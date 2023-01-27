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
<a href="https://addons.mozilla.org/en-US/firefox/addon/goodreads-ratings-on-overdrive/" target="_blank" rel="noopener"><img src="https://i0.wp.com/waleedzuberi.com/wp-content/uploads/2021/04/get-the-addon-178x60px.dad84b42.png?resize=172%2C60&ssl=1" width="172" border="0" height="60"></a>

<a href="https://chrome.google.com/webstore/detail/goodreads-ratings-on-over/ooefaoacdclhcccchjnapjlclpkeblje" target="_blank" rel="noopener"><img src="https://i0.wp.com/waleedzuberi.com/wp-content/uploads/2018/01/ChromeWebStore_Badge_v2_206x58.png?ssl=1"></a>

## Example
![screenshot](https://i0.wp.com/waleedzuberi.com/wp-content/uploads/2018/01/Screenshot-2018-1-17-A-Wrinkle-In-Time1.png?resize=1271%2C750&ssl=1)

## Changelog
* Version 1.2 (26/1/2022)
	* Fix for new book page and stars on Goodreads (thanks @[rubenmv](https://github.com/rubenmv/extension-goodreads-ratings-for-amazon/))
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