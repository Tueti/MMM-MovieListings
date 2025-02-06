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
        animationSpeed: 2.5 * 1000,
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
        this.movies = {};
        var self = this;
        self.sendSocketNotification('FETCH_MOVIE_LIST', this.config); //run once now, then set Interval for once a day
        setInterval(function () {
            self.sendSocketNotification('FETCH_MOVIE_LIST', this.config);
        }, this.config.refreshInterval);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MOVIE_ERROR') {
            Log.log(this.name + ': Error');
        }
        if (notification === 'MOVIE_LIST_DONE') {
            this.movies = payload; // payload now contains combined movie details and credits
            this.scheduleDomUpdatesForPoster(this.movies); // Call to handle the data
        }
    },

    /*
     * DOM CREATION
     */

    // Main function for view updates
    getDom: function () {
        var wrapper = document.createElement('div')
        wrapper.id = "movie-listing";

        var header = document.createElement('header');
        header.id = "header-id";
        header.innerHTML = this.config.header;
        wrapper.appendChild(header);

        this.posterWrapper = this.setupDomForPosterView();
        wrapper.appendChild(this.posterWrapper)

        this.wrapper = wrapper;
        return this.wrapper;
    },

    // Creates containers for the poster view
    setupDomForPosterView: function () {
        var posterWrapper = document.createElement('div');
        posterWrapper.id = "poster-wrapper";
        posterWrapper.className = 'xsmall';

        // set up title
        var title = document.createElement('div');
        title.id = "title-id";
        title.classList = 'small';

        // set up tagline
        var tagline = document.createElement('div');
        tagline.id = "tagline-id";
        tagline.classList = 'dimmed';

        // set up plot
        var plot = document.createElement('div');
        plot.id = "plot-id";
        plot.classList = 'dimmed';

        // Set up details => image
        var image = document.createElement('img');
        image.id = "image-id";
        image.alt = ' poster';

        // Set up details => textArea
        var detailsContainer = document.createElement('p');
        detailsContainer.id = "details-container";
        detailsContainer.className = this.data.position.toLowerCase().indexOf('right') < 0 ? 'marginLeft' : 'marginRight';

        // Set up details => rating
        var detailsRatingContainer = document.createElement('div');
        detailsRatingContainer.id = "details-rating-container";
        detailsRatingContainer.className = 'xsmall';

        var detailsRatingVote = document.createElement('span');
        detailsRatingVote.id = "details-rating-vote";
        var detailsRatingVotings = document.createElement('span');
        detailsRatingVotings.id = "details-rating-votings";
        detailsRatingVotings.className = 'xsmall dimmed';

        // Set up details => runtime
        var runtimeContent = document.createElement('div');
        runtimeContent.id = "runtime-content";
        runtimeContent.className = 'xsmall';

        // Set up details => credits actors
        var creditsContainer = document.createElement('div');
        creditsContainer.id = "credits-container";
        creditsContainer.className = 'marginTop xsmall';

        // Set up cast content
        var castContent = document.createElement('div');
        castContent.id = "cast-content";
        castContent.className = 'xsmall';

        // Set up details => credits director
        var directorContainer = document.createElement('div');
        directorContainer.id = "director-container";

        var directorHeader = document.createElement('span');
        directorHeader.id = "director-header";
        directorHeader.className = 'xsmall dimmed';

        var directorContent = document.createElement('span');
        directorContent.id = "director-content";
        directorContent.className = 'xsmall';

        // Set up details => table
        var detailsTable = document.createElement('table');
        detailsTable.id = "details-table";
        detailsTable.className = 'xsMarginTop';
        var tableRow = document.createElement('tr');
        tableRow.id = "table-row";
        var imageCell = document.createElement('td');
        imageCell.id = "image-cell";
        var textCell = document.createElement('td');
        textCell.id = "text-cell";
        textCell.className = 'top';
        imageCell.className = 'top';

        detailsRatingContainer.appendChild(detailsRatingVote);
        detailsRatingContainer.appendChild(detailsRatingVotings);

        creditsContainer.appendChild(castContent);

        directorContainer.appendChild(directorContent);
        directorContainer.appendChild(directorHeader);
        creditsContainer.appendChild(directorContainer);

        // Add all details
        detailsContainer.appendChild(detailsRatingContainer);
        detailsContainer.appendChild(runtimeContent);
        detailsContainer.appendChild(creditsContainer);

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

        // Set up entire view in container
        posterWrapper.appendChild(title);
        posterWrapper.appendChild(tagline);
        posterWrapper.appendChild(detailsTable);
        if (this.config.includeMoviePlot) {
            posterWrapper.appendChild(plot);
        }

        return posterWrapper;
    },


    /*
     * VIEW POPULATION (DOM MANIPULATION)
     * Fill the appropriate view with life (data)
     */
    // Temporarily removed list view
    // createListView: function (movies) {
    //     var table = document.createElement('table');
    //     table.className = 'small';

    //     for (var i = 0; i <= movies.length - 1; i++) {
    //         var movie = movies[i];

    //         var tableRow = document.createElement('tr');
    //         var tableData = document.createElement('td');

    //         var cell = document.createElement('span');
    //         cell.innerHTML = movie.title;

    //         tableData.appendChild(cell);
    //         tableRow.appendChild(tableData);
    //         table.appendChild(tableRow);
    //     }

    //     return table;
    // },

    populateContentIntoPosterView: function (movieSet) {
        var movie = movieSet.details;
        var credits = movieSet.credits;

        //Log.log(credits);
        wrapper = this.wrapper;
        posterWrapper = this.posterWrapper;

        // set up title
        var title = document.getElementById('title-id');
        title.innerHTML = movie.title;

        // set up tagline
        var tagline = document.getElementById('tagline-id');
        tagline.innerHTML = movie.tagline;
        
        // set up plot
        if (this.config.includeMoviePlot) {
            var plot = document.getElementById('plot-id');
            var plotContent = "";
            if (this.config.maxPlotLength == 0) {
                plotContent = movie.overview
            } else {
                overviewShort = movie.overview.length > this.config.maxPlotLength ? `${movie.overview.substring(0, (this.config.maxPlotLength))}&#8230;` : movie.overview;
                plotContent = overviewShort;
            }
            plot.innerHTML = plotContent.split(/((?:\S+ ){10})/g).filter(Boolean).join("<br/>");
        }

        // Set up details => rating
        var detailsRatingVote = document.getElementById('details-rating-vote');
        detailsRatingVote.innerHTML = movie.vote_average + ' / 10';

        var detailsRatingVotings = document.getElementById('details-rating-votings');
        detailsRatingVotings.innerHTML = ' (' + movie.vote_count + ' ' + this.translate('RATINGS') + ')';

        // Set up details => runtime
        var runtimeContent = document.getElementById('runtime-content');
        runtimeContent.innerHTML = movie.runtime + ' ' + this.translate('MIN');

        // Setup cast content = > credits cast
        var castContent = document.getElementById('cast-content');
        castContent.innerHTML = ''; // ensure that the castContent is empty before populating.
        if (credits.cast && credits.cast.length > 0) {
            for (var i = 0; i < Math.min(6, credits.cast.length); i++) {
                castContent.innerHTML += credits.cast[i].name + '<br />';
            }
        }

        // Set up details => credits director
        var directorHeader = document.getElementById('director-header');
        directorHeader.innerHTML = ', ' + this.translate('DIRECTOR');

        var directorContent = document.getElementById('director-content');
        if (credits.crew && credits.crew.length > 0) {
            for (var i = 0; i <= credits.crew.length - 1; i++) {
                if (credits.crew[i].job === 'Director') {
                    directorContent.innerHTML = credits.crew[i].name;
                };
            };
        }

        // Set up details => genres
        if (movie.genres) {
            var genres = '';
            for (var i = 0; i <= movie.genres.length - 1; i++) {
                genres += movie.genres[i].name;
                if (i < movie.genres.length - 1) {
                    genres += ', ';
                }
            }
        }

        return posterWrapper;
    },

    /*
     * HELPER
     */
    scheduleDomUpdatesForPoster: function (movies) {
        var self = this;
        self.nextIndex = 0; // Start at the first movie

        // Display the first movie
        this.currentMovie = this.populateContentIntoPosterView(movies[self.nextIndex]);

        // After DOM update, set the image source
        setTimeout(function () {
            var image = document.getElementById('image-id');
            if (image) {
                var movie = movies[self.nextIndex]; // Get the current movie
                image.src = 'https://image.tmdb.org/t/p/w154/' + movie.details.poster_path; // Set image source
            }
        }, 100); // Delay slightly to ensure DOM is updated first

        // Set an interval to rotate through the movies
        setInterval(function () {
            self.nextIndex++;

            if (self.nextIndex >= movies.length) {
                self.nextIndex = 0;
            }

            self.currentMovie = self.populateContentIntoPosterView(movies[self.nextIndex]);

            // After DOM update, set the image source again
            setTimeout(function () {
                var image = document.getElementById('image-id');
                if (image) {
                    var movie = movies[self.nextIndex]; // Get the current movie
                    image.src = 'https://image.tmdb.org/t/p/w154/' + movie.details.poster_path; // Set image source
                }
            }, 100); // Delay slightly to ensure DOM is updated first
        }, this.config.pageChangeInterval);
    }
});