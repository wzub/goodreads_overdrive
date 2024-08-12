chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.contentScriptQuery == "getRating") {
	  var goodreadsUrl = "https://www.goodreads.com/book/isbn?isbn=" + request.isbn;
  
	  fetch(goodreadsUrl)
		.then(response => response.text())
		.then(data => {
		  sendResponse({data: data, success: true});
		})
		.catch(error => {
		  sendResponse({error: error.toString(), success: false});
		});
  
	  return true;  // response is sent asynchronously
	}
});