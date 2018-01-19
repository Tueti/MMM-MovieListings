/* Magic Mirror
 * Module: MMM-MovieListing
 *
 * By Christian Jens https://tueti.github.io
 * Modified by Kyle Johnson
 * MIT Licensed.
 */

Module.register('MMM-MovieListings', {

  // Default module config.
	defaults: {
    apiKey: '',
		region: 'DE',
    language: 'de-DE',
    interface: 'poster', //'list', 'poster', 'detailed'
    includeMoviePlot: false,
    maxPlotLength: 198,
    header: 'Kinofilme',
    moviesPerPage: 0,
    refreshInterval: 1000 * 60 * 60 * 24, //Once a day
    baseUrl: 'https://api.themoviedb.org/3/movie/now_playing',
    animationSpeed: 2.5 * 1000,
    pageChangeInterval: 30 * 1000
	},

  getStyles: function() {
		return ['MMM-MovieListings.css'];
	},

  getTranslations: function() {
    return {
      en: "translations/en.json",
      de: "translations/de.json",
      sv: "translations/sv.json",
      es: "translations/es.json"
    }
  },

  start: function() {
    Log.log(this.name + ' is started');
    this.movies = {};

    var self = this;
    self.sendSocketNotification('FETCH_MOVIE_LIST', this.config); //run once now, then set Interval for once a day
    setInterval(function() {
      self.sendSocketNotification('FETCH_MOVIE_LIST', this.config);
    }, this.config.refreshInterval);
  },

  socketNotificationReceived: function(notification, payload) {
    Log.log(this.name + ': received socket notification ' + notification + ' with payload:', payload);

    if (notification === 'MOVIE_ERROR') {
      Log.log(this.name + ': Error');
    }

    if (notification === 'MOVIE_LIST_DONE') {
      // Log.log(this.name + ': Got movies');
      // Prepare DOM data
      this.movies = payload.results;
      this.prepareDomUpdate(this.movies);
    }

    if (notification === 'MOVIE_ID_DONE') {
      // Log.log(this.name + ': Got movie details', payload);
      this.posterToDisplay = payload
      this.updateDom(this.config.animationSpeed);
    }
  },

  /*
   * DOM MANIPULATION
   */

	getDom: function() {
    var wrapper = document.createElement('div')
    var header = document.createElement('header');
    header.innerHTML = this.config.header;
    wrapper.appendChild(header);

    // No movies fetched yet
    if (!this.moviesToDisplay && !this.posterToDisplay) {
      var loadingPlaceholder = document.createElement('div');
      loadingPlaceholder.className = 'small dimmed';
      loadingPlaceholder.innerHTML = this.translate('LOADING');

      wrapper.appendChild(loadingPlaceholder);
      return wrapper;
    }

    switch (this.config.interface) {
      case 'list':
        var tableContainer = document.createElement('div').appendChild(this.createTableView(this.moviesToDisplay));
        wrapper.appendChild(tableContainer);
        return wrapper;
      case 'poster':
        var posterContainer = document.createElement('div').appendChild(this.createPosterView(this.posterToDisplay));
        wrapper.appendChild(posterContainer);
        return wrapper;
      default:
        break;
    }
	},

  // Different view styles
  createTableView: function(movies) {
    var table = document.createElement('table');
    table.className = 'small';

    for (var i = 0; i <= movies.length - 1; i++) {
      var movie = movies[i];

      var tableRow = document.createElement('tr');
      var tableData = document.createElement('td');

      var cell = document.createElement('span');
      cell.innerHTML = movie.title;

      tableData.appendChild(cell);
      tableRow.appendChild(tableData);
      table.appendChild(tableRow);
    }
    
    return table;
  },

  createPosterView: function(movieSet) {

    var movie = movieSet.details;
    var credits = movieSet.credits;

    // create container
    var posterWrapper = document.createElement('div');
    posterWrapper.className = 'xsmall';

    // set up title
    var title = document.createElement('div');
    title.classList = 'small';
    title.innerHTML = movie.title;

    // set up tagline
    var tagline = document.createElement('div');
    tagline.classList = 'dimmed';
    tagline.innerHTML = movie.tagline;
    
    // set up plot
    if (this.config.includeMoviePlot) {
      var plot = document.createElement('div');
      plot.classList = 'dimmed';
      var plotContent = "";
      if (this.config.maxPlotLength == 0) {
        plotContent = movie.overview
      } else {
        plotContent = movie.overviewShort;
      }
      plot.innerHTML = plotContent.split(/((?:\S+ ){10})/g).filter(Boolean).join("<br/>");;
    }
    
    // Set up details => image
    var image = document.createElement('img');
    image.src = 'https://image.tmdb.org/t/p/w154/' + movie.poster_path; // "w92", "w154", "w185", "w342", "w500", "w780", or "original"

    // Set up details => textArea
    var detailsContainer = document.createElement('p');
    detailsContainer.className = this.data.position.toLowerCase().indexOf('right') < 0 ? 'marginLeft' : 'marginRight';
    
    // Set up details => rating
    var detailsRatingContainer = document.createElement('div');
    detailsRatingContainer.className = 'xsmall';
    var detailsRatingVote = document.createElement('span');
    detailsRatingVote.innerHTML = movie.vote_average + ' / 10';
    var detailsRatingVotings = document.createElement('span');
    detailsRatingVotings.className = 'xsmall dimmed';
    detailsRatingVotings.innerHTML = ' (' + movie.vote_count + ' ' + this.translate('RATINGS') + ')';

    detailsRatingContainer.appendChild(detailsRatingVote);
    detailsRatingContainer.appendChild(detailsRatingVotings);

    // Set up details => runtime
    var runtimeContent = document.createElement('div');
    runtimeContent.className = 'xsmall';
    runtimeContent.innerHTML = movie.runtime + ' ' + this.translate('MIN');

    // Set up details => credits actors
    var creditsContainer = document.createElement('div');
    creditsContainer.className = 'marginTop xsmall';
/*  Header(?)
    var castHeader = document.createElement('div');
    castHeader.className = 'xsmall dimmed';
    castHeader.innerHTML = this.translate('CAST');
    creditsContainer.appendChild(castHeader);
*/
    var castContent = document.createElement('div');
    castContent.className = 'xsmall';
    if (credits.cast && credits.cast.length > 0) {
      for (var i = 0; i < Math.min(6, credits.cast.length); i++) {
        castContent.innerHTML += credits.cast[i].name + '<br />';
      }
    }
    creditsContainer.appendChild(castContent);

    // Set up details => credits director
    var directorContainer = document.createElement('div');
    var directorHeader = document.createElement('span');
    directorHeader.className = 'xsmall dimmed';
    directorHeader.innerHTML = ', ' + this.translate('DIRECTOR');
    var directorContent = document.createElement('span');
    directorContent.className = 'xsmall';
    if (credits.crew && credits.crew.length > 0) {
      for (var i = 0; i <= credits.crew.length - 1; i++) {
        if (credits.crew[i].job === 'Director') {
          directorContent.innerHTML = credits.crew[i].name;
        };
      };
    }
    directorContainer.appendChild(directorContent);
    directorContainer.appendChild(directorHeader);
    creditsContainer.appendChild(directorContainer);


    // Set up details => genres
    if (movie.genres) {
      var genres = '';
      for (var i = 0; i <= movie.genres.length -1; i++) {
        genres += movie.genres[i].name;
        if (i < movie.genres.length - 1) {
          genres += ', ';
        }
      }
    }

    // Add all details
    detailsContainer.appendChild(detailsRatingContainer);
    detailsContainer.appendChild(runtimeContent);
    detailsContainer.appendChild(creditsContainer);
   

    // Set up details => table
    var detailsTable = document.createElement('table');
    detailsTable.className = 'xsMarginTop';
    var tableRow = document.createElement('tr');
    var imageCell = document.createElement('td');
    var textCell = document.createElement('td');
    textCell.className = 'top';
    imageCell.className = 'top';

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
   * HELPER
   */
  prepareDomUpdate: function(movies) {
    switch (this.config.interface) {
      case 'list':
        // If pagination enabled, turn to DOM update scheduler, else just display all movies
        if (this.config.moviesPerPage > 0) {
          this.scheduleDomUpdatesForList(movies);
        } else {
          this.moviesToDisplay = movies
          this.updateDom();
        }
        break;
      case 'poster':
        this.scheduleDomUpdatesForPoster(movies);
      default:
        break;
    }
  },

  scheduleDomUpdatesForList: function(movies) {
    var self = this;
    var pages = Math.ceil(movies.length / self.config.moviesPerPage);
    self.movieChunks = [];
    self.nextIndex = 0;

    for (var i = 0; i < pages; i++) {
      self.movieChunks.push(movies.splice(0, self.config.moviesPerPage))
    }

    self.moviesToDisplay = self.movieChunks[self.nextIndex];
    self.nextIndex++;
    self.updateDom();

    setInterval(function() {
      self.moviesToDisplay = self.movieChunks[self.nextIndex];
      self.nextIndex++;

      // reset index if end is reached
      if (self.nextIndex > self.movieChunks.length - 1) {
        self.nextIndex = 0;
      }

      self.updateDom(self.config.animationSpeed);
    }, this.config.pageChangeInterval);
  },

  scheduleDomUpdatesForPoster: function(movies) {
    var self = this;
    self.nextIndex = 0;
    self.sendSocketNotification('FETCH_MOVIE_ID', {
      movieId: movies[self.nextIndex].id,
      apiKey: self.config.apiKey,
      language: self.config.language,
      config: self.config
    });
    self.nextIndex++;

    setInterval(function() {
      self.sendSocketNotification('FETCH_MOVIE_ID', {
        movieId: movies[self.nextIndex].id,
        apiKey: self.config.apiKey,
        language: self.config.language,
        config: self.config
      });
      self.nextIndex++;

      // reset when end of array is reached
      if (self.nextIndex > movies.length - 1) {
        self.nextIndex = 0;
      }
    }, this.config.pageChangeInterval);
  },
});
