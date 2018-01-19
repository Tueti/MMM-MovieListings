# MMM-MovieListings
Displays the top 20 movies that are currently in theaters around you. The list is fetched from [The Movie Database](https://themoviedb.org).
The module determines whether it's on the left or right side of the mirror and displays accordingly (image in poster mode mode will always be on the side of the mirror's edge):

![MMM-MovieListings](https://raw.githubusercontent.com/Tueti/MMM-MovieListings/master/MMM-MovieListings_left.jpg)
![MMM-MovieListings](https://raw.githubusercontent.com/Tueti/MMM-MovieListings/master/MMM-MovieListings_right.jpg)

## Install
`cd ~/MagicMirror/modules`

`git clone https://github.com/Tueti/MMM-MovieListings.git`

`cd MMM-MovieListings && npm install`

## Dependencies
`request` - is being installed via `npm install`

## Config
The entry in `config.js` can include the following options:

|Option|Description|Default|
|---|---|---|
|`header`|The header of the module|Kinofilme|
|`apiKey`|**required** Your API key. Please insert the 'v3 (auth)' key here, not v4. Signup [here](https://www.themoviedb.org/account/signup), then get a key in your profile section -> api|_none_|
|`includeMoviePlot`|Determins whether a short plot discription will be shown or not. Set to either `true` or `false`|`false`|
|`maxPlotLength`|Sets the max length of the movie plot description. Only necessary if `includeMoviePlot` is set to `true`. Setting this value to `0` shows entire plot. NOTE: This might be a long text and mess with the layout.|`198`|
|`region`|The region you want to see the movie listing for. Insert a region as an [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code (DE for Germany, US for United States, GB for United Kingdom, etc...) |`DE`|
|`language`|The language for the movie titles. Either a simple [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) code (DE for Germany, EN for english, etc.) or a region specific language as in [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (de-DE for German in Germany, pt-BR for Portugese in Brazil, etc.)|`de-DE`|
|`interface`|You can choose between a simple list view and a more detailed poster view with movie image and more details. Options are `list` and `poster`. If you choose poster, the moviesPerPage will be ignored as it will only show one movie at a time|`poster`|
|`moviesPerPage`|How many movies should be displayed at once? To disable pagination and show all movies at once, pass it `0` (or leave this setting from config since `0` is default)|`0`|
|`pageChangeInterval`|Interval in milliseconds to change between pages if you defined a `moviesPerPage` or set display to `poster`|`30 * 1000` = 30 seconds|
|`refreshInterval`|Interval in milliseconds to update movie list. Please take the [API documentation](https://developers.themoviedb.org/3/getting-started/request-rate-limiting) for rate limit into account |`1000 * 60 * 60 * 24` = Once a day|

## Roadmap
1. 3rd view as a detailed list (without an image but more details as in `list`)
2. Cache movies for 24 hours (or for the time of the `refreshInterval`) when received in `poster` view (currently every view change fetches new)
