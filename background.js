chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.contentScriptQuery == "getRating") {
		var goodreadsUrl = "https://www.goodreads.com/book/isbn?isbn=" + request.isbn;

		fetch(goodreadsUrl)
		.then(response => response.text())
		.then(data => sendResponse(data))
		.catch(error => sendResponse(error))
		return true;
	}
});