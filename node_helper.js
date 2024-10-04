/* Magic Mirror
 * Module: MMM-MovieListing
 *
 * By Christian Jens http://christianjens.de
 * Updated by mumblebaj
 * MIT Licensed.
 */

//   https://api.themoviedb.org/3/movie/now_playing?api_key=dbe08b1e1a7061853de90f8dd0e3408e&language=de-DE&page=1&region=de


var NodeHelper = require('node_helper');

module.exports = NodeHelper.create({
    start: function () {
        console.log('MMM-MovieListing helper started...')
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'FETCH_MOVIE_LIST') {
            this.fetchMovieList(payload);
        }

        if (notification === 'FETCH_MOVIE_ID') {
            //console.log("movies: ", payload)
            this.fetchMovieById(payload);
        }
    },

    fetchMovieList: async function (payload) {
        var self = this;
        var movies = [];
		let data;
		
		//Fetch Now Playing List
        const url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + payload.apiKey
            }
        };

        const nowPlaying = await fetch(url, options);
        data = await nowPlaying.json();
		
		self.sendSocketNotification('MOVIE_LIST_DONE', data)

    },

    fetchMovieById: async function (payload) {
        var self = this;
        var movie = {};
        let details;
        let credit;
        let movieData;

        var url = 'https://api.themoviedb.org/3/movie/' + payload.movieId + '&language=' + payload.language;

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer '  + payload.apiKey
            }
        };

        try {
            // Fetch movie details
            const detailsResponse = await fetch(url, options);
            details = await detailsResponse.json(); // Wait for the details to be fetched

            // Fetch movie credits
            const url1 = 'https://api.themoviedb.org/3/movie/933260/credits?language=en-US';
            const options1 = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + payload.apiKey
                }
            };

            const creditsResponse = await fetch(url1, options1);
            credit = await creditsResponse.json(); // Wait for the credits to be fetched

            // Now that both requests have completed, build the movieData object
            movieData = {
                details: details,
                credits: credit
            };

            //console.log('Movie Details: ', movieData);
        } catch (error) {
            console.error('Error fetching movie details or credits:', error);
        }

        // Create shortened version of plot with line breaks so it displays nicely
        let plotContent = "";
        if (payload.config.maxPlotLength === 0) {
            plotContent = movieData.details.overview;
        } else {
            plotContent = movieData.details.overview.length > payload.config.maxPlotLength ? `${movieData.details.overview.substring(0, (payload.config.maxPlotLength))}&#8230;` : movieData.details.overview;
        }

        // Add shortened plot to payload
        movieData.details.overviewShort = plotContent;

        self.sendSocketNotification('MOVIE_ID_DONE', movieData);
    }

});
