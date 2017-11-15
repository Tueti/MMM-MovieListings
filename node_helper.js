/* Magic Mirror
 * Module: MMM-MovieListing
 *
 * By Christian Jens http://christianjens.de
 * MIT Licensed.
 */

  //   https://api.themoviedb.org/3/movie/now_playing?api_key=dbe08b1e1a7061853de90f8dd0e3408e&language=de-DE&page=1&region=de


var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
		console.log('MMM-MovieListing helper started...')
	},

  socketNotificationReceived: function (notification, payload) {
		if (notification === 'FETCH_MOVIE_LIST') {
			this.fetchMovieList(payload);
		}

    if (notification === 'FETCH_MOVIE_ID') {
      this.fetchMovieById(payload);
    }
	},

  fetchMovieList: function(payload) {
    var self = this;
    var movies = [];

    request(
      payload.baseUrl + '?api_key=' + payload.apiKey + '&language=' + payload.language + '&page=1' + '&region=' + payload.region,
      function (error, response, body) {
        if (error) {
          return self.sendSocketNotification('MOVIE_ERROR', error);
        }

        self.sendSocketNotification('MOVIE_LIST_DONE', JSON.parse(body))
      }
    );
  },

  fetchMovieById: function(payload) {
    var self = this;
    var movie = {};

    request(
      'https://api.themoviedb.org/3/movie/' + payload.movieId + '?api_key=' + payload.apiKey + '&language=' + payload.language,
      function (error, response, body) {
        if (error) {
          return self.sendSocketNotification('MOVIE_ERROR', error);
        }

        request(
          'https://api.themoviedb.org/3/movie/' + payload.movieId + '/credits?api_key=' + payload.apiKey,
          function(subError, subRresponse, creditsBody) {
            if (subError) {
              return self.sendSocketNotification('MOVIE_ERROR', error);
            }

            var movieData = {
              details: JSON.parse(body),
              credits: JSON.parse(creditsBody)
            };

            // Create shortened version of plot with linebreaks so it displays nicely
            var plotContent = "";
            if (payload.config.maxPlotLength == 0) {
              plotContent = movieData.details.overview
            } else {
              plotContent = movieData.details.overview.length > payload.config.maxPlotLength ? `${movieData.details.overview.substring(0, (payload.config.maxPlotLength))}&#8230;` : movieData.details.overview;
            }

            // Add shortened plot to payload
            movieData.details.overviewShort = plotContent;

            self.sendSocketNotification('MOVIE_ID_DONE', movieData);
          }
        );

      }
    );
  }

});