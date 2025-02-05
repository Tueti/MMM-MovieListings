var NodeHelper = require('node_helper');
const fs = require('fs');
const os = require('os');

const moviesdata = `${__dirname}/movies_data.json`;

module.exports = NodeHelper.create({
    start: function () {
        console.log('MMM-MovieListing helper started...');
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'FETCH_MOVIE_LIST') {
            this.fetchMovieList(payload);
        }
    },

    fetchMovieList: async function (payload) {
        var self = this;
        let data;

        // Fetch Now Playing List
        const url = 'https://api.themoviedb.org/3/movie/now_playing?language=' + payload.language + '&page=1';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + payload.apiKey
            }
        };

        try {
            const nowPlayingResponse = await fetch(url, options);
            const nowPlayingData = await nowPlayingResponse.json();

            // Slice the movies based on the config
            const moviesToFetch = nowPlayingData.results.slice(0, payload.number_to_fetch);

            // Fetch movie details and credits for each movie
            const movieDetailsPromises = moviesToFetch.map(async(movie) => {
                const movieDetails = await self.fetchMovieDetailsAndCredits(movie.id, payload.apiKey);
                return movieDetails;
            });

            // Wait for all movie details and credits to be fetched
            const moviesData = await Promise.all(movieDetailsPromises);

            // Send combined movie data back to the main.js
            self.sendSocketNotification('MOVIE_LIST_DONE', moviesData);
        } catch (error) {
            console.error('Error fetching now playing movies:', error);
        }
    },

    fetchMovieDetailsAndCredits: async function (movieId, apiKey) {
        let details;
        let credits;

        // Fetch movie details
        const detailsUrl = 'https://api.themoviedb.org/3/movie/' + movieId + '?language=' + payload.language;
        const detailsOptions = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + apiKey
            }
        };

        try {
            const detailsResponse = await fetch(detailsUrl, detailsOptions);
            details = await detailsResponse.json();

            // Fetch movie credits
            const creditsUrl = 'https://api.themoviedb.org/3/movie/' + movieId + '/credits?language=' + payload.language;
            const creditsOptions = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + apiKey
                }
            };

            const creditsResponse = await fetch(creditsUrl, creditsOptions);
            credits = await creditsResponse.json();

            // Combine details and credits into a single object
            return {
                details: details,
                credits: credits
            };
        } catch (error) {
            console.error(`Error fetching details or credits for movie ID ${movieId}:`, error);
            return null;
        }
    }
});
