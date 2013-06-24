
angular.module('lastfm',[]);
angular.module('lastfm').factory('lastFMService', ['$http','$q',function($http,$q) {
  "use strict";
  var lastFMService = {
    // http://stackoverflow.com/questions/12505760/angularjs-processing-http-response-in-service
    getNews: function(apiKey,un) {
      var findings = [];
      // $http returns a promise, which has a then function, which also returns a promise
      var p1 = $http.get('http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=1&user='+un+'&api_key='+apiKey);
      var p2 = $http.get('http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=0&user='+un+'&api_key='+apiKey);
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
    },
    albumCover: function(apiKey,artist, album, callback,ref) {
      $http.get('http://ws.audioscrobbler.com/2.0/?method=album.getInfo&format=json&artist='+artist.replace(/&/g,'%26')+'&album='+album.replace(/&/g,'%26')+'&api_key='+apiKey).success(function(data) {
        var img = {};
        if (data.album && data.album.image[2]["#text"].length > 0) {
          img = data.album.image[2]["#text"];
        } else {
          img = 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_album_large.png';
        }
        if (callback) {
          callback(img, ref);
        }
      });
    },
  };
  return lastFMService;
}]);