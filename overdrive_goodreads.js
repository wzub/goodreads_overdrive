var GDkey = 'x3tNCXWYZigfkcFSRUnTyg';

//#title-format-details ul > li
var ODisbn = escape(document.querySelector('#title-format-details').textContent.match('[0-9]{11,13}'));
var GDratingsParent = document.querySelector('.js-starRatingsContainer');

var spinner = document.createElement("div");
spinner.className = 'spinner';

var GDratings = document.createElement("div");
GDratings.setAttribute('id', 'GDratings');

var elemGDicon = document.createElement("img");
elemGDicon.setAttribute('alt', '(Goodreads icon)');
elemGDicon.setAttribute('src', browser.extension.getURL('icons/goodreads-icon.png'));

var elemGDratingSpan = document.createElement("span");
elemGDratingSpan.setAttribute('id', 'GDratingsText');

var elemGDlink = document.createElement("a");
elemGDlink.href = "https://www.goodreads.com/book/isbn/"+ODisbn;
elemGDlink.setAttribute('target', '_blank');
elemGDlink.setAttribute('title', 'View on Goodreads.com');

elemGDlink.append(elemGDicon,elemGDratingSpan);
GDratings.append(elemGDlink);

GDratingsParent.append(GDratings);

var GDlink = document.querySelector('#GDlink');
var GDratingsText = document.querySelector('#GDratingsText');

GDratingsText.append(spinner);

function GDxmlHttpRequest(ODisbn, GDkey) {
	var gdRequest = new Request("https://www.goodreads.com/book/review_counts.json?isbns="+ODisbn+"&key="+GDkey, {method: 'GET'});

	fetch(gdRequest)
	.then(response => {
		if (response.ok) {
			return response.json()
		} else {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			})
		}
	})
	.then(data => {
		GDratingsText.append("Rating: ",data["books"][0]["average_rating"]);
	}).catch(error => {
		// console.error(error);
		var title = escape(document.querySelector('h1.TitleDetailsHeading-title').textContent);
		var author = escape(document.querySelector('.TitleDetailsHeading-creatorLink').textContent);

		var elemGDerrorlink = document.createElement("a");
		elemGDerrorlink.href = 'https://www.goodreads.com/search?q='+title+' by '+author;
		elemGDerrorlink.setAttribute('title', 'search on Goodreads.com');
		elemGDerrorlink.setAttribute('target', '_blank');
		elemGDerrorlink.append('Error (',error.status,'): ',error.statusText);
	}).then(function(){
		spinner.className = '';
	});
};

GDxmlHttpRequest(ODisbn, GDkey);