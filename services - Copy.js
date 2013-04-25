'use strict';
swl.factory('lastFMService', function($http,$q) {
  var lastFMService = {
    // http://stackoverflow.com/questions/12505760/angularjs-processing-http-response-in-service
    getNews: function() {
      var findings = [];
      // $http returns a promise, which has a then function, which also returns a promise
      var p1 = $http.get('http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=1&user=saerdnakire&api_key=00198b31b392d0750f88819830e49680');
      var p2 = $http.get('http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=0&user=saerdnakire&api_key=00198b31b392d0750f88819830e49680');
      var promise = $q.all([p1,p2]).then(function(d){
        // d will contain array of responses
        // The then function here is an opportunity to modify the response
        for (var i = 0; i < d.length; i++) {
          for (var j = 0; d[i].data.albums && d[i].data.albums.album && j < d[i].data.albums.album.length; j++) {
            findings.push({'artist':d[i].data.albums.album[j].artist.name,'album':d[i].data.albums.album[j].name,'image':d[i].data.albums.album[j].image[2]['#text']});
          }
        }
        console.log(findings);
        // The return value gets picked up by the then in the controller
        return findings;
      });
      console.log(promise);
      // Return the promise to the controller
      return promise;
    }
  };
  return lastFMService;
});

swl.factory('spotifyService', function($http,$q) {
  var spotifyService = {
    shouldMemoize: true,
    // memoize calls
    newsMem: {},
    aaMem: {},
    userCountry: 'SE',
    lookupArtistAlbums: function(artist, album) {
      // memoization w promise
      var aral = {'ar':artist,'al':album};
      if (spotifyService.shouldMemoize && spotifyService.aaMem[artist+'_'+album]) { 
        console.log('spotify memoize hit for '+artist+'_'+album);
        var deferred = $q.defer();
        deferred.resolve(spotifyService.aaMem[artist+'_'+album]);
        return deferred.promise;
      }
      var p1 = $http.get('http://ws.spotify.com/search/1/album.json?q='+album.replace(/&/g,'%26')+'%20AND%20artist:%22'+artist.replace(/&/g,'%26')+'%22').then(function(data) {
        var findings = [];
        //console.log(aral);
        if (data.data.info.num_results > 0) {
          for (var j = 0; j < data.data.albums.length; j++) {  
            if (data.data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase()
              && spotifyService.checkAvail(data.data.albums[j].availability.territories)          
              ) {         
              findings.push({
                'artist':data.data.albums[j].artists[0].name,
                'album':data.data.albums[j].name,
                'href':data.data.albums[j].href
              });
            }
          }
        }
        if (spotifyService.shouldMemoize) {
          spotifyService.aaMem[artist+'_'+album] = findings;
        }
        return findings;
      });
      return p1;
    },
  
    checkAvail: function(cs) {
      return cs.indexOf(spotifyService.userCountry) >= 0 || cs == 'worldwide';
    }
  }
  return spotifyService;
});