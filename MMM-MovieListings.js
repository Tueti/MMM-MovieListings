/* Magic Mirror
 * Module: MMM-MovieListing
 *
 * By Christian Jens https://chrischisblog.de
 * Modified by Kyle Johnson
 * Modified by mumblebaj 2024-10-15
 * MIT Licensed.
 */

Module.register('MMM-MovieListings', {

    // Default module config.
    defaults: {
        apiKey: '',
        region: 'DE',
        language: 'de-DE',
        interface: 'poster',
        includeMoviePlot: false,
        maxPlotLength: 198,
        header: 'Kinofilme',
        refreshInterval: 1000 * 60 * 60 * 24, //Once a day
        animationSpeed: 1.5 * 1000,
        pageChangeInterval: 30 * 1000
    },

    getStyles: function () {
        return ['MMM-MovieListings.css'];
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json",
            sv: "translations/sv.json",
            es: "translations/es.json"
        }
    },

    start: function () {
        Log.log(this.name + ' is started');
        var self = this;
        self.sendSocketNotification('FETCH_MOVIE_LIST', this.config); //run once now...
        setInterval(function () { //...then set Interval for configured refresh interval (default: Once a day)
            self.sendSocketNotification('FETCH_MOVIE_LIST', this.config);
        }, this.config.refreshInterval);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MOVIE_ERROR') {
            Log.log(this.name + ': Error');
        }
        if (notification === 'MOVIE_LIST_DONE') {
            // Payload contains an array of movies like this: [{ details, credits },{ details, credits },...]
            // Initiate the regular Dom updates
            this.movieList = payload;
            this.loopDomUpdates(this.movieList);
        }
    },

    /*
     * DOM CREATION
     */

    /// Will be called by MagicMirror to create the view
    /// Manually triggered by this.updateDom()
    getDom: function () {
        var wrapper = document.createElement('div')
        wrapper.id = "movie-listing";

        var header = document.createElement('header');
        header.id = "header-id";
        header.innerHTML = this.config.header;
        wrapper.appendChild(header);

        if(!this.movieList) {
            var placeholder = document.createElement('div');
            placeholder.id = "placeholder-id";
            placeholder.className = 'small';
            placeholder.innerHTML = this.translate('LOADING');
            wrapper.appendChild(placeholder);
            return wrapper;
        }

        var posterWrapper = document.createElement('div').appendChild(this.createDomForPosterView());
        wrapper.appendChild(posterWrapper);

        return wrapper;
    },

    createDomForPosterView: function () {
        var posterWrapper = document.createElement('div');

        // SET UP TITLE
        var title = document.createElement('div');
        title.className = 'small';
        title.innerHTML = this.currentMovie.details.title;
        // END SETUP TITLE
        
        // SET UP TAGLINE
        var tagline = document.createElement('div');
        tagline.className = 'dimmed';
        tagline.innerHTML = this.currentMovie.details.tagline;
        // END SETUP TAGLINE

        // SET UP PLOT
        if (this.config.includeMoviePlot) {
            var plot = document.createElement('div');
            plot.className = 'dimmed';
            var plotContent = "";
            if (this.config.maxPlotLength == 0) {
                plotContent = this.currentMovie.details.overview;
            } else {
                overviewShort = this.currentMovie.details.overview.length > this.config.maxPlotLength ? `${this.currentMovie.details.overview.substring(0, (this.config.maxPlotLength))}&#8230;` : this.currentMovie.details.overview;
                plotContent = overviewShort;
            }
            plot.innerHTML = plotContent.split(/((?:\S+ ){7})/g).filter(Boolean).join("<br/>"); // Line break after every 7th word
        }
        // END SETUP PLOT

        // SET UP POSTER IMAGE
        var image = document.createElement('img');
        image.alt = ' poster';
        image.src = 'https://image.tmdb.org/t/p/w154/' + this.currentMovie.details.poster_path;
        // END SETUP POSTER IMAGE

        // SET UP TEXT AREA FOR MOVIE DETAILS (RATING, RUNTIME, CREDITS, ETC.)
        var detailsContainer = document.createElement('p');
        detailsContainer.className = this.data.position.toLowerCase().indexOf('right') < 0 ? 'marginLeft' : 'marginRight';

        // SET UP RATING
        var detailsRatingContainer = document.createElement('div');
        detailsRatingContainer.className = 'xsmall';

        var detailsRatingVote = document.createElement('span');
        detailsRatingVote.innerHTML = this.currentMovie.details.vote_average + ' / 10';

        var detailsRatingVotings = document.createElement('span');
        detailsRatingVotings.className = 'xsmall dimmed';
        detailsRatingVotings.innerHTML = ' (' + this.currentMovie.details.vote_count + ' ' + this.translate('RATINGS') + ')';

        detailsRatingContainer.appendChild(detailsRatingVote);
        detailsRatingContainer.appendChild(detailsRatingVotings);
        // END SETUP RATING

        // SET UP RUNTIME
        var runtimeContent = document.createElement('div');
        runtimeContent.className = 'xsmall';
        runtimeContent.innerHTML = this.currentMovie.details.runtime + ' ' + this.translate('MIN');
        // END SETUP RUNTIME

        // SET UP CREDITS (ACTORS, DIRECTOR) IN CONTAINER
        var creditsContainer = document.createElement('div');
        creditsContainer.className = 'marginTop xsmall';

        // SET UP CAST
        var castContent = document.createElement('div');
        castContent.className = 'xsmall';
        castContent.innerHTML = ''; // ensure that the castContent is empty before populating.
        if (this.currentMovie.credits.cast && this.currentMovie.credits.cast.length > 0) {
            for (var i = 0; i < Math.min(6, this.currentMovie.credits.cast.length); i++) {
                castContent.innerHTML += this.currentMovie.credits.cast[i].name + '<br />';
            }
        }
        // END SETUP CAST

        // SET UP DIRECTOR
        var directorContainer = document.createElement('div');
        directorContainer.id = "director-container";

        var directorHeader = document.createElement('span');
        directorHeader.className = 'xsmall dimmed';
        directorHeader.innerHTML = ', ' + this.translate('DIRECTOR'); // Will be placed behind directors name

        var directorContent = document.createElement('span');
        directorContent.className = 'xsmall';
        if (this.currentMovie.credits.crew && this.currentMovie.credits.crew.length > 0) {
            for (var i = 0; i <= this.currentMovie.credits.crew.length - 1; i++) {
                if (this.currentMovie.credits.crew[i].job === 'Director') {
                    directorContent.innerHTML = this.currentMovie.credits.crew[i].name;
                };
            };
        }
        directorContainer.appendChild(directorContent);
        directorContainer.appendChild(directorHeader);
        // END SETUP DIRECTOR

        creditsContainer.appendChild(castContent);
        creditsContainer.appendChild(directorContainer);
        // END SETUP CREDITS

        detailsContainer.appendChild(detailsRatingContainer);
        detailsContainer.appendChild(runtimeContent);
        detailsContainer.appendChild(creditsContainer);
        // END SETUP TEXT AREA FOR MOVIE DETAILS

        // SETUP TABLE TO DISPLAY POSTER AND MOVIE DETAILS SIDE-BY-SIDE
        // Simple table with one row and two cells
        var detailsTable = document.createElement('table');
        detailsTable.className = 'xsMarginTop';
        var tableRow = document.createElement('tr');
        var imageCell = document.createElement('td');
        imageCell.className = 'top';
        var textCell = document.createElement('td');
        textCell.className = 'top';
        
        imageCell.appendChild(image);
        textCell.appendChild(detailsContainer);
        if (this.data.position.toLowerCase().indexOf('right') < 0) {
            tableRow.appendChild(imageCell);
            textCell.className = 'top left';
            tableRow.appendChild(textCell);
        } else {
            tableRow.appendChild(textCell);
            tableRow.appendChild(imageCell);
        };
        detailsTable.appendChild(tableRow);
        // END SETUP TABLE

        // ADD ALL UI PARTS TO DOM
        posterWrapper.appendChild(title);
        posterWrapper.appendChild(tagline);
        posterWrapper.appendChild(detailsTable);
        if (this.config.includeMoviePlot) {
            posterWrapper.appendChild(plot);
        }

        return posterWrapper;
    },

    /*
     * HELPER
     */

    /**
     * Finds the new current index of movies, then uses a SocketNotification to set the current movie
     * 
     * @param {TMDB Payload} movies - Array of movies with details and credits: [{ details, credits }]
     */
    loopDomUpdates: function (movies) {
        var self = this;
        self.movieIndex = 0;

        this.currentMovie = movies[self.movieIndex];
        this.updateDom(this.config.animationSpeed);

        setInterval(function () {
            self.movieIndex++;
            if (self.movieIndex >= movies.length) {
                self.movieIndex = 0;
            }
            self.currentMovie = movies[self.movieIndex];
            self.updateDom(self.config.animationSpeed);
        }, 5000);
    }




    // /*
    //  * VIEW POPULATION (DOM MANIPULATION)
    //  * Fill the appropriate view with life (data)
    //  */
    // // Temporarily removed list view
    // // createListView: function (movies) {
    // //     var table = document.createElement('table');
    // //     table.className = 'small';

    // //     for (var i = 0; i <= movies.length - 1; i++) {
    // //         var movie = movies[i];

    // //         var tableRow = document.createElement('tr');
    // //         var tableData = document.createElement('td');

    // //         var cell = document.createElement('span');
    // //         cell.innerHTML = movie.title;

    // //         tableData.appendChild(cell);
    // //         tableRow.appendChild(tableData);
    // //         table.appendChild(tableRow);
    // //     }

    // //     return table;
    // // },
});