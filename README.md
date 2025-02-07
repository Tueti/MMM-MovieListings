# The original MMM-MovieListings

## NOTE FOR UPDATE 1.2.0:
Sometimes things slip through. I am very thankful for the community work to this module. But after the last Pull Request, which brought this item up to speed with the architecture of MagicMirror² and added major improvements to the way the requests were handled, some features had been lost and a few bugs creeped in. I should have caught them before merging the code into production, but I didn't. Sorry for any inconvinience that this has caused. My latest update should fix those things, reinstate the List view and restore proper User Experience (such as animations). Plus I didn't only added the List back in, I gave it an overhaul to make it look (a little) better. Enjoy!

## Description
Displays the top 20 movies that are currently in theaters around you. The list is fetched from [The Movie Database](https://themoviedb.org).
The module determines whether it's on the left or right side of the mirror and displays accordingly (image in poster mode mode will always be on the side of the mirror's edge):

[![Platform](https://img.shields.io/badge/platform-MagicMirror-informational)](https://MagicMirror.builders)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

![Example](image-1.png)
![Example](image-2.png)

## Install
`cd ~/MagicMirror/modules`

`git clone https://github.com/Tueti/MMM-MovieListings`

## Dependencies
None. Uses MagicMirror² builtin fetch

## Change Log
For the latest changes, please refer to the [change log](https://github.com/Tueti/MMM-MovieListings/wiki/Change-Log).

## Config
The entry in `config.js` can include the following options:

|Option|Description|Default|
|---|---|---|
|`header`|The header of the module|Kinofilme|
|`apiKey`|**Required!** Your API **Read Access Token**. Please insert the 'v3 (auth)' key here, not v4. Signup [here](https://www.themoviedb.org/account/signup), then get a key in your profile section -> api|_none_|
|`interface`|Defines how the module will be presented. Movies can either be shown as a poster with details or a simple list. User `poster` or `list` as values.|`poster`|
|`includeMoviePlot`|Determins whether a short plot discription will be shown or not. Set to either `true` or `false`|`false`|
|`maxPlotLength`|Sets the max length of the movie plot description. Only necessary if `includeMoviePlot` is set to `true`. Setting this value to `0` shows entire plot. NOTE: This might be a long text and mess with the layout.|`198`|
|`language`|The language for the movie data. A region specific language as in [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (de-DE for German in Germany, pt-BR for Portugese in Brazil, etc.)|`de-DE`|
|`pageChangeInterval`|Interval in milliseconds to change between movies|`30 * 1000` = 30 seconds|
|`refreshInterval`|Interval in milliseconds to update movie list. Please take the [API documentation](https://developers.themoviedb.org/3/getting-started/request-rate-limiting) for rate limit into account |`1000 * 60 * 60 * 24` = Once a day|

## Example Config
Add the module to the modules array in the `config/config.js` file:
````javascript
{
		module: 'MMM-MovieListings',
		position: 'bottom_left',
		config: {
			apiKey: 'api_key_here',
			header: "Kinofilme",
			interface: "poster",
			includeMoviePlot: true,
			maxPlotLength: 198,
			language: "de-DE",
			pageChangeInterval: 10 * 1000,
			refreshInterval: 1000 * 60 * 60 * 60 * 24
		}
},
````