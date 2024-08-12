var goodreadsIconUrl = chrome.runtime.getURL('icons/goodreads-icon.png');
var parser = new DOMParser();
var parentDiv = document.querySelector('.js-starRatingsContainer');
var overdriveStars = document.querySelector('.StarRatings');
var titleContainerParent = document.querySelector('.title-column-top');
var titleContainer = document.querySelector('.TitleDetailsHeading');

if (!titleContainer) {
    // console.error("Not a book page");
    throw new ReferenceError("Not a book page");
}

// insert skeleton
var initialHtmlString = `
    <div id='goodreadsRatingDiv'>
        <span id='goodreadsRatingDivText' class='goodreadsRatingDivText'>
            <a id='goodreadsRatingUrl' href='#' target='_blank'>
                <img src='${goodreadsIconUrl}' alt='rating on Goodreads.com' />
                <span id='goodreadsSpinner' class='spinner'></span>
                <span id='goodreadsRatingResult'></span>
            </a>
        </span>
    </div>
`;

var initialHtml = parser.parseFromString(initialHtmlString, "text/html").querySelector("#goodreadsRatingDiv");

// handle situation when overdriveStars isn't picked up (Edge)
if (overdriveStars && parentDiv) {
    parentDiv.insertBefore(initialHtml, overdriveStars.nextSibling);
} else if (titleContainerParent && titleContainer) {
    console.log('overdriveStars is null');
    titleContainerParent.insertBefore(initialHtml, titleContainer.nextSibling);
} else {
    console.error('Unable to insert Goodreads rating div');
}

var goodreadsRatingDiv = document.getElementById('goodreadsRatingDiv');
var spinner = document.getElementById('goodreadsSpinner');
var goodreadsRatingDivText = document.getElementById('goodreadsRatingDivText');
var goodreadsRatingUrl = document.getElementById('goodreadsRatingUrl');
var goodreadsRatingResult = document.getElementById('goodreadsRatingResult');

/**
 * Sanitizer, removes all html tags, leave text
 * https://github.com/rubenmv/extension-goodreads-ratings-for-amazon/
 */
var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
var tagOrComment = new RegExp('<(?:'
	// Comment body.
	+
	'!--(?:(?:-*[^->])*--+|-?)'
	// Special "raw text" elements whose content should be elided.
	+
	'|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
	// Regular name
	+
	'|/?[a-z]' + tagBody + ')>', 'gi');

function removeTags(html) {
	var oldHtml;
	do {
		oldHtml = html;
		html = html.replace(tagOrComment, '');
	} while (html !== oldHtml);
	return html.replace(/</g, '&lt;').replace(/\n/g, '');
}

// get the ISBN from the page
var titleFormatDetails = document.querySelector('#title-format-details');
var OverdriveIsbn = titleFormatDetails ? encodeURI(titleFormatDetails.textContent.match('[0-9]{11,13}')[0]) : null;
console.log('Detected ISBN: ' + OverdriveIsbn);

if (!OverdriveIsbn) {
    console.error('Unable to find ISBN');
}

var found = false;
var counter = 0;

/**
 * Function from https://github.com/rubenmv/extension-goodreads-ratings-for-amazon/
 */
function GetStarsContent(meta, stars, isNewStyle) {
	let spanContent = '';
	if (!isNewStyle) {
		for (var i = 0; i < stars.children.length; i++) {
			spanContent += "<span class='" + stars.children[i].className + "' size=12x12></span>";
		}
		return spanContent;
	}
	// Quick and really dirty hack for the new goodreads style when retrieving from Chrome
	let decimalNumber = parseFloat(meta.querySelector('.RatingStatistics__rating').textContent);
	let entero = Math.floor(decimalNumber);
	let decimalPart = decimalNumber - entero;
	for (var i = 0; i < stars.children.length; i++) {
		let currentStar = stars.children[i];
		let currentStarPaths = currentStar.querySelectorAll('path');
		let containsEmpty = currentStar.querySelector('.RatingStar__backgroundFill');
		let containsFill = currentStar.querySelector('.RatingStar__fill')?.getAttribute('d'); // class + attribute
		if (containsEmpty && containsFill) { 
			if (decimalPart <= 0.5) spanContent += "<span class='staticStar p3' size=12x12></span>";
			else spanContent += "<span class='staticStar p6' size=12x12></span>";
		}
		else { // only empty or fully filled star
			if (containsEmpty) {
				spanContent += "<span class='staticStar p0' size=12x12></span>";
			}
			if (containsFill) {
				spanContent += "<span class='staticStar p10' size=12x12></span>";
			}
		}
	}

	return spanContent;
}

function getGoodreadsRating(isbn) {
    var url = "https://www.goodreads.com/book/isbn?isbn=" + isbn;
    console.log("Getting ratings from " + url);

    if (spinner) spinner.style.display = 'block';

    chrome.runtime.sendMessage({
        contentScriptQuery: "getRating",
        isbn: isbn
    }, response => {
        try {
            counter++;

            if (!response.success) {
                throw new Error(response.error || "Failed to fetch data from Goodreads");
            }

            var goodreadsPage = parser.parseFromString(response.data, "text/html");
            var goodreadsPageMeta = goodreadsPage.querySelector(".BookPageMetadataSection");

            if (!goodreadsPageMeta) {
                throw new ReferenceError("ISBN:" + isbn + " not found on Goodreads.com");
            }

            var stars = goodreadsPageMeta.querySelector(".RatingStars");
            if (!stars) {
                throw new ReferenceError("Cannot find '.RatingStars' on Goodreads page");
            }

            var reviewCount = goodreadsPageMeta.querySelector('.RatingStatistics__meta')?.getAttribute('aria-label');

            var parentSpan = `
                <br/><span id='goodreadsRating' class='goodreadsRating'>
                    <span class='stars staticStars'>
                        ${GetStarsContent(goodreadsPageMeta, stars, true)}
                    </span>
                </span>
            `;
            
            var contentSpan = parser.parseFromString(parentSpan, "text/html").querySelector('.stars');
            if (goodreadsRatingResult) {
                goodreadsRatingResult.textContent = '';
                goodreadsRatingResult.append(contentSpan);
            }

            if (goodreadsRatingUrl) {
                goodreadsRatingUrl.href = url;
                goodreadsRatingUrl.title = reviewCount || '';
            }
            if (spinner) spinner.style.display = 'none';
            
            found = true;

        } catch (error) {
            console.error(error);

            var overdriveTitle = encodeURIComponent(document.querySelector('h1.TitleDetailsHeading-title')?.textContent || '');
            var overdriveAuthor = encodeURIComponent(document.querySelector('.TitleDetailsHeading-creatorLink')?.textContent || '');
            var goodreadsErrorUrl = 'https://www.goodreads.com/search?q=' + overdriveTitle + ' by ' + overdriveAuthor;

            if (goodreadsRatingUrl) {
                goodreadsRatingUrl.href = goodreadsErrorUrl;
                goodreadsRatingUrl.title = "search for " + decodeURI(overdriveTitle) + " on Goodreads.com";
            }
            if (spinner) spinner.style.display = 'none';

            // check again
            found = false;
            if (counter < 10) getGoodreadsRating(OverdriveIsbn);
            else if (goodreadsRatingResult) goodreadsRatingResult.textContent = "Search on Goodreads.com";
        }
    });
}

if (OverdriveIsbn) {
    getGoodreadsRating(OverdriveIsbn);
}