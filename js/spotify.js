
angular.module('spotify',[]);
angular.module('spotify').factory('spotifyService', ['$http',function($http) {
  "use strict";
  var spotifyService = {
    shouldMemoize: true,
    // memoize calls
    newsMem: {},
    aaMem: {},
    userCountry: 'SE',
    lookupArtistAlbums: function(artist,album,img,callback,ref) {
      var aral = {'ar':artist,'al':album,'img':img};
      if (spotifyService.shouldMemoize && spotifyService.aaMem[artist+'_'+album]) {
        //console.log('spotify memoize hit for '+artist+'_'+album);
        callback(spotifyService.aaMem[artist+'_'+album], artist, album,img,ref);
      } else {
        $http.get('http://ws.spotify.com/search/1/album.json?q='+album.replace(/&/g,'%26')+'%20AND%20artist:%22'+artist.replace(/&/g,'%26')+'%22').success(function(data) {
          var findings = [];
          if (data.info.num_results > 0) {
            for (var j = 0; j < data.albums.length; j++) {
              if (data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase() &&
                spotifyService.checkAvail(data.albums[j].availability.territories)
                ) {
                findings.push({
                  'artist':data.albums[j].artists[0].name,
                  'album':data.albums[j].name,
                  'href':data.albums[j].href,
                  'img':aral.img
                });
              }
            }
          }
          if (spotifyService.shouldMemoize) {
            spotifyService.aaMem[artist+'_'+album] = findings;
          }
          //console.log(findings);
          callback(findings, aral.ar, aral.al,aral.img,ref);
        });
      }
    },
    lookupNews:function(artist,callback,i,ignoreReleaseList) {
      if (spotifyService.shouldMemoize && spotifyService.newsMem[artist]) {
        //console.log('spotify memoize hit for '+artist);
        callback(spotifyService.newsMem[artist],i,ignoreReleaseList);
      } else {
        $http.get('http://ws.spotify.com/search/1/album.json?q=tag:new%20AND%20artist:%22'+artist.replace(/&/g,'%26')+'%22').success(function(data) {
          var findings = [];
          if (data.info.num_results > 0) {
            for (var j = 0; j < data.albums.length; j++) {
              if (data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase() &&
                spotifyService.checkAvail(data.albums[j].availability.territories) &&
                !spotifyService.shouldIgnore(ignoreReleaseList,data.albums[j].href)) {
                findings.push({
                  'artist':data.albums[j].artists[0].name,
                  'album':data.albums[j].name,
                  'href':data.albums[j].href
                });
              }
            }
          }
          if (spotifyService.shouldMemoize) {
            spotifyService.newsMem[artist] = findings;
          }
          if (callback) {
            callback(findings,i,ignoreReleaseList);
          }
        });
      }
    },
    lookupArtist:function(uri, callback) {
      //console.log('checking ' + uri);
      $http.get('http://ws.spotify.com/lookup/1/.json?uri='+uri).success(function(data) {
        //console.log(data);
        if (data.artist) {
          callback(data.artist.name);
        }
        else if (data.album) {
          callback(data.album.artist, data.album.name);
        }
      }).
      error(function(data, status, headers, config) {
        console.log('fail',data, status);
      });
    },
    checkAvail: function(cs) {
      return cs.indexOf(spotifyService.userCountry) >= 0 || cs == 'worldwide';
    },
    shouldIgnore: function(ignoreReleaseList,href) {
      for (var i = 0; ignoreReleaseList && i < ignoreReleaseList.length; i++) {
        if (href && ignoreReleaseList[i].toLowerCase() == href.toLowerCase()) {
          console.log('ignoring release ' + href);
          return true;
        }
      }
      return false;
    }
  };
  return spotifyService;
}]);