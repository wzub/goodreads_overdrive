var goodreadsIconUrl = chrome.runtime.getURL('icons/goodreads-icon.png');
var parser = new DOMParser();
var parentDiv = document.querySelector('.js-starRatingsContainer');
var overdriveStars = document.querySelector('.StarRatings');

// insert skeleton
var initialHtmlString = "<div id='goodreadsRatingDiv'><span id='goodreadsRatingDivText' class='goodreadsRatingDivText'>";
initialHtmlString += "<a id='goodreadsRatingUrl' href='#' target='_blank'><img src='"+goodreadsIconUrl+"' alt='rating on Goodreads.com' /><span id='goodreadsSpinner' class='spinner'></span></a>";
initialHtmlString += "</span></div>";

var initialHtml = parser.parseFromString(initialHtmlString, "text/html").querySelector("#goodreadsRatingDiv");

// overdriveStars.nextSibling returns null because it is the last child of parentDiv; goodreadsRatingDiv is then always inserted after it
parentDiv.insertBefore(initialHtml, overdriveStars.nextSibling);

var goodreadsRatingDiv = document.getElementById('goodreadsRatingDiv');
var spinner = document.getElementById('goodreadsSpinner');
var goodreadsRatingDivText = document.getElementById('goodreadsRatingDivText');
var goodreadsRatingUrl = document.getElementById('goodreadsRatingUrl');

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

function getGoodreadsRating(isbn) {
	var url = "https://www.goodreads.com/book/isbn?isbn=" + isbn;
	console.log("Getting ratings from " + url);

	chrome.runtime.sendMessage({
		contentScriptQuery: "getRating",
		isbn: isbn
	}, data => {
		try {
			var goodreadsPage = parser.parseFromString(data, "text/html");
			var goodreadsPageMeta = goodreadsPage.querySelector("#bookMeta");

			if (goodreadsPageMeta === undefined || goodreadsPageMeta === null) {
				throw new ReferenceError("ISBN:" +isbn+ " not found on Goodreads.com");
			}

			var stars = goodreadsPageMeta.querySelectorAll(".stars")[0];
			if (stars === undefined || stars === null) {
				throw new ReferenceError("Cannot find '.stars' info on Goodreads page");
			}

			/* Copy approach to inserting star ratings by https://github.com/rubenmv/extension-goodreads-ratings-for-amazon/ */
			var averageHtml = goodreadsPageMeta.querySelectorAll("[itemprop=ratingValue]")[0].textContent;
			var votesHtml = goodreadsPageMeta.querySelectorAll("[itemprop=ratingCount]")[0].parentNode.textContent;
			var reviewCount = removeTags(averageHtml).trim() + " from " + removeTags(votesHtml).trim();
			console.log(isbn + " has " + reviewCount);

			// Create manually to avoid injection
			var parentSpan = "<span class='stars staticStars'>";
			for (var i = 0; i < stars.children.length; i++) {
				parentSpan += "<span class='" + stars.children[i].className + "' size='12x12'></span>";
			}
			parentSpan += "</span>";
			
			var contentSpan = parser.parseFromString(parentSpan, "text/html").querySelector(".stars");
			goodreadsRatingUrl.append(contentSpan);

			goodreadsRatingUrl.href = url;
			goodreadsRatingUrl.title = reviewCount;
			spinner.style.display = 'none';

		} catch (error) {
			console.log(error);

			var overdriveTitle = encodeURIComponent(document.querySelector('h1.TitleDetailsHeading-title').textContent);
			var overdriveAuthor = encodeURIComponent(document.querySelector('.TitleDetailsHeading-creatorLink').textContent);
			var overdriveSubtitle = encodeURIComponent(document.querySelector('.TitleSeries').textContent);
			var goodreadsErrorUrl = 'https://www.goodreads.com/search?q='+overdriveTitle+' '+overdriveSubtitle+' by '+overdriveAuthor;

			goodreadsRatingUrl.href = goodreadsErrorUrl;
			goodreadsRatingUrl.append("Search on Goodreads.com");
			goodreadsRatingUrl.title = "search for " + decodeURI(overdriveTitle) + " on Goodreads.com";
			spinner.style.display = 'none';
		}
	});
}

getGoodreadsRating(OverdriveIsbn);