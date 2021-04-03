# Goodreads Ratings on Overdrive 
![goodreads_ratings banner](https://i2.wp.com/waleedzuberi.com/wp-content/uploads/2018/01/banner_1400-560.png)
Hi there! This is just a simple little WebExtension that shows Goodreads ratings of books and audiobooks on Overdrive library pages.
## Permissions
The add-on only activates on Overdrive library pages and fetches ratings from Goodreads.com. No personal data is collected or used by this extension.
```
*://*.overdrive.com/media/*
*://*.overdrive.com/*/media/*
*://*.goodreads.com/*
```
## Installation
<a href="https://addons.mozilla.org/en-US/firefox/addon/goodreads-ratings-on-overdrive/" target="_blank" rel="noopener"><img src="https://i2.wp.com/waleedzuberi.com/wp-content/uploads/2020/05/firefox-get-the-addon.png?w=580&ssl=1" width="172" border="0" height="60"></a>

<a href="https://chrome.google.com/webstore/detail/goodreads-ratings-on-over/ooefaoacdclhcccchjnapjlclpkeblje" target="_blank" rel="noopener"><img src="https://i2.wp.com/waleedzuberi.com/wp-content/uploads/2018/01/ChromeWebStore_Badge_v2_206x58.png"></a>

## Example
![screenshot](https://i1.wp.com/waleedzuberi.com/wp-content/uploads/2020/05/goodreads-overdrive-sample-stars.jpg)

## Changelog
* Version 1.1.0 (3/4/2021)
	* Handle cases when queryselector doesn't pick up the right div (Edge)
* Version 1.1.0 (8/5/2020)
	* Fix for Chrome CORB errors
	* Show rating from Goodreads as stars (thanks @[rubenmv](https://github.com/rubenmv/extension-goodreads-ratings-for-amazon/))
	* Improved URL matching (thanks @[Foxsly](https://github.com/Foxsly))
	* General code cleanup
* Version 1.0.2 (29/01/2018)
	* Chrome compatibility fixes
* Version 1.0.1 (18/1/2018)
	* Fix error handling
* Version 1.0.0 (17/1/2018)
	* Initial release