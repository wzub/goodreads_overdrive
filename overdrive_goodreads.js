var goodreadsIconUrl = chrome.runtime.getURL('icons/goodreads-icon.png');
var parser = new DOMParser();
var parentDiv = document.querySelector('.js-starRatingsContainer');
var overdriveStars = document.querySelector('.StarRatings');
var titleContainerParent = document.querySelector('.title-column-top');
var titleContainer = document.querySelector('.TitleDetailsHeading');

// insert skeleton
var initialHtmlString = "<div id='goodreadsRatingDiv'><span id='goodreadsRatingDivText' class='goodreadsRatingDivText'>";
initialHtmlString += "<a id='goodreadsRatingUrl' href='#' target='_blank'><img src='"+goodreadsIconUrl+"' alt='rating on Goodreads.com' /><span id='goodreadsSpinner' class='spinner'></span><span id='goodreadsRatingResult'></span> </a>";
initialHtmlString += "</span></div>";

var initialHtml = parser.parseFromString(initialHtmlString, "text/html").querySelector("#goodreadsRatingDiv");

// handle situation when overdriveStars isn't picked up (Edge)
if (overdriveStars !== null) {
	// overdriveStars.nextSibling returns null because it is the last child of parentDiv; goodreadsRatingDiv is then always inserted after it
	parentDiv.insertBefore(initialHtml, overdriveStars.nextSibling);
}
else {
	console.log('overdriveStars is null');
	titleContainerParent.insertBefore(initialHtml, titleContainer.nextSibling);
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
var OverdriveIsbn = encodeURI(document.querySelector('#title-format-details').textContent.match('[0-9]{11,13}'));
console.log('Detected ISBN: ' + OverdriveIsbn);

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

	spinner.style.display = 'block';

	chrome.runtime.sendMessage({
		contentScriptQuery: "getRating",
		isbn: isbn
	}, data => {
		try {
			counter++;

			var goodreadsPage = parser.parseFromString(data, "text/html");
			var goodreadsPageMeta = goodreadsPage.querySelector(".BookPageMetadataSection");

			if (goodreadsPageMeta === undefined || goodreadsPageMeta === null) {
				throw new ReferenceError("ISBN:" +isbn+ " not found on Goodreads.com");
			}

			var stars = goodreadsPageMeta.querySelector(".RatingStars");
			if (stars === undefined || stars === null) {
				throw new ReferenceError("Cannot find '.RatingStars' on Goodreads page");
			}

			var reviewCount = goodreadsPageMeta.querySelector('.RatingStatistics__meta').getAttribute('aria-label');
			console.log(isbn + " has " + reviewCount);

			var parentSpan = "<br/><span id='goodreadsRating' class='goodreadsRating'>";
			parentSpan += "<span class='stars staticStars'>";
			let starsContent = GetStarsContent(goodreadsPageMeta, stars, true);
			parentSpan += starsContent;
			parentSpan += "</span>";
			
			var contentSpan = parser.parseFromString(parentSpan, "text/html").querySelector('.stars');
			// goodreadsRatingUrl.append(contentSpan);
			goodreadsRatingResult.textContent = '';
			goodreadsRatingResult.append(contentSpan);

			goodreadsRatingUrl.href = url;
			goodreadsRatingUrl.title = reviewCount;
			spinner.style.display = 'none';
			
			found = true;

		} catch (error) {
			console.log(error);

			var overdriveTitle = encodeURIComponent(document.querySelector('h1.TitleDetailsHeading-title').textContent);
			var overdriveAuthor = encodeURIComponent(document.querySelector('.TitleDetailsHeading-creatorLink').textContent);
			// var overdriveSubtitle = encodeURIComponent(document.querySelector('.TitleSeries .subtitle').textContent);
			// var overdriveSeries = encodeURIComponent(document.querySelector('.TitleSeries .series').textContent);
			var goodreadsErrorUrl = 'https://www.goodreads.com/search?q='+overdriveTitle+' by '+overdriveAuthor;

			goodreadsRatingUrl.href = goodreadsErrorUrl;
			goodreadsRatingUrl.title = "search for " + decodeURI(overdriveTitle) + " on Goodreads.com";
			goodreadsRatingResult.textContent = "Search on Goodreads.com";
			spinner.style.display = 'none';

			// check again
			found = false;
			if (counter < 10) getGoodreadsRating(OverdriveIsbn);
		}
	});
}

getGoodreadsRating(OverdriveIsbn);