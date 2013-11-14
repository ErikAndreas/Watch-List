

angular.module('swl').factory('watchListService',['dropboxService','$log',function(dropboxService,$log) {
  "use strict";
  var watchListService = {
    // model to persist (local and remote)
    data: {
      news:[],
      artistAlbums:[],
      ignoreReleaseList:[],
      updatedAt:{}
    },
    getData:function(cb) {
      if (dropboxService.isAuth()) {
        //TODO: be smart not fetch from dropbox every time
        dropboxService.get(function(data) {
          if (data) {
            watchListService.data = data;
            localStorage.setItem('WL-data', data);
          }
          cb(watchListService.data);
        },function(error) {
          console.log('Error opening default datastore: ' + error);
        });
      } else {
        var d = localStorage.getItem('WL-data');
        if (d) {
          watchListService.data = JSON.parse(d);
        }
        cb(watchListService.data);
      }
    },
    saveNews:function(list,cb) {
      var d = JSON.parse(localStorage.getItem('WL-data'));
      d.news = list;
      watchListService.save(d,cb);
    },
    saveIgnoreReleaseList:function(list,cb) {
      var d = JSON.parse(localStorage.getItem('WL-data'));
      d.ignoreReleaseList = list;
      watchListService.save(d,cb);
    },
    saveArtistAlbums:function(list,cb) {
      var d = JSON.parse(localStorage.getItem('WL-data'));
      d.artistAlbums = list;
      watchListService.save(d,cb);
    },
    save:function(d,cb) {
      d.updatedAt = new Date(); // FIXME? (utc)
      $log.log('saving local', d);
      localStorage.setItem('WL-data',angular.toJson(d));
      if (dropboxService.isAuth()) {
        $log.log('save data remote');
        dropboxService.set(angular.toJson(d),cb);
      } else {
        cb();
      }
    },

    dformat:function(date) {
      if (!date) date = new Date();
      var dd = date.getDate();
      var mm = date.getMonth() + 1;
      var yyyy = date.getFullYear();
      if (dd < 10) {dd = '0' + dd;}
      if (mm < 10) {mm = '0' + mm;}
      return yyyy + '-' + mm + '-' + dd;
    }
  };
  return watchListService;
}]);

angular.module('swl').factory('artistNewsModelService',['linguaService','watchListService','spotifyService','lastFMService','statusService','swlSettings','$log',
  function(linguaService,watchListService,spotifyService,lastFMService,statusService,swlSettings,$log){
  "use strict";
  var artistNewsModelService = {
    // in-memory model
    artistNewsModel: {
      'news':{},
      'ignoreReleaseList':{},
      'imgs':[],
      'artistNewsFindings':[]
    },
    populate:function(){
      $log.log('populating');
      artistNewsModelService.artistNewsModel.artistNewsFindings = [];
      var imageHandler = function(img, k){
        if (img && img.length > 0) {
          artistNewsModelService.artistNewsModel.artistNewsFindings[k-1].img=img;
        }
      };
      var handler = function(findings,i,ignoreReleaseList) {
        if (findings && findings.length > 0) {
          artistNewsModelService.artistNewsModel.imgs[i] = 'img/spotify32bw.png';
          for (var j=0;j<findings.length;j++) {
            artistNewsModelService.artistNewsModel.artistNewsFindings.push(findings[j]);
            lastFMService.albumCover(swlSettings.lastFMapiKey,findings[j].artist, findings[j].album,imageHandler,artistNewsModelService.artistNewsModel.artistNewsFindings.length);
          }
        } else {
          artistNewsModelService.artistNewsModel.imgs[i] = 'img/delete-32.png';
        }
      };
      watchListService.getData(function(data) {
        artistNewsModelService.artistNewsModel.news = data.news;
        artistNewsModelService.artistNewsModel.ignoreReleaseList = data.ignoreReleaseList;
        for (var i = 0; i < artistNewsModelService.artistNewsModel.news.length; i++) {
          spotifyService.lookupNews(artistNewsModelService.artistNewsModel.news[i].artist,handler,i,artistNewsModelService.artistNewsModel.ignoreReleaseList);
        }
      });
    },
    addNews:function(a) {
      if (artistNewsModelService.containsNews(a)) {
        $log.log('duplicate, skipping ',a);
        statusService.add('error',linguaService._("Skipping duplicate, %s is already in the list",a));
      } else  {
        artistNewsModelService.artistNewsModel.news.push({"artist": a, "added": watchListService.dformat()});
        watchListService.saveNews(artistNewsModelService.artistNewsModel.news, function(){
          artistNewsModelService.populate();
          statusService.add('info',linguaService._("Added %s", a));
        });
      }
    },
    rmNews:function(idx) {
      artistNewsModelService.artistNewsModel.news.splice(idx,1);
      watchListService.saveNews(artistNewsModelService.artistNewsModel.news, function() {
        artistNewsModelService.populate();
        statusService.add('info',linguaService._("Removed"));
      });
    },
    addIgnore:function(href) {
      artistNewsModelService.artistNewsModel.ignoreReleaseList.push(href);
      watchListService.saveIgnoreReleaseList(artistNewsModelService.artistNewsModel.ignoreReleaseList,function() {
        artistNewsModelService.populate();
      });
    },
    containsNews:function(a) {
      var n = artistNewsModelService.artistNewsModel.news;
      for (var i = 0; i < n.length; i++) {
        if (a.toLowerCase() == n[i].artist.toLowerCase())
          return true;
      }
      return false;
    }
  };
  return artistNewsModelService;
}]);

angular.module('swl').factory('artistAlbumModelService',['linguaService','watchListService','spotifyService','lastFMService','statusService','swlSettings','$log',
  function(linguaService,watchListService,spotifyService,lastFMService,statusService,swlSettings,$log){
  "use strict";
  var artistAlbumModelService = {
    // in-memory model
    artistAlbumModel: {
      'artistAlbums':[],
      'imgs':[],
      'artistAlbumsFindings':[]
    },
    populate:function(){
      artistAlbumModelService.artistAlbumModel.artistAlbumsFindings = [];
      var imageHandler = function(img, k){
        if (img && img.length > 0) {
          artistAlbumModelService.artistAlbumModel.artistAlbumsFindings[k-1].img=img;
        }
      };
      var handler = function(findings,artist,album,img,i) {
        if (findings && findings.length > 0) {
          artistAlbumModelService.artistAlbumModel.imgs[i] = 'img/spotify32bw.png';
          for (var j=0;j<findings.length;j++) {
            artistAlbumModelService.artistAlbumModel.artistAlbumsFindings.push(findings[j]);
            lastFMService.albumCover(swlSettings.lastFMapiKey,findings[j].artist, findings[j].album,imageHandler,artistAlbumModelService.artistAlbumModel.artistAlbumsFindings.length);
          }
        } else {
          artistAlbumModelService.artistAlbumModel.imgs[i] = 'img/delete-32.png';
        }
      };
      watchListService.getData(function(data) {
        artistAlbumModelService.artistAlbumModel.artistAlbums = data.artistAlbums;
        for (var i = 0; i < artistAlbumModelService.artistAlbumModel.artistAlbums.length; i++) {
          // meth: artist,album,img,callback,ref
          // callback: findings, artist, album,img,ref
          spotifyService.lookupArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums[i].artist,artistAlbumModelService.artistAlbumModel.artistAlbums[i].album,'',handler,i);
        }
      });
    },
    addArtistAlbum:function(ar,al) {
      if (artistAlbumModelService.containsArtistAlbum(ar,al)) {
       $log.log('duplicate, skipping ',ar,al);
       statusService.add('error',linguaService._("Skipping duplicate, %1$s %2$s is already in the list",[ar,al]));
      } else  {
        artistAlbumModelService.artistAlbumModel.artistAlbums.push({"artist": ar, "album": al, "added": watchListService.dformat()});
        watchListService.saveArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums, function() {
          artistAlbumModelService.populate();
          statusService.add('info',linguaService._("Added %1$s - %2$s",[ar,al]));
        });
      }
    },
    rmArtistAlbum:function(idx) {
      artistAlbumModelService.artistAlbumModel.artistAlbums.splice(idx,1);
      watchListService.saveArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums, function() {
        artistAlbumModelService.populate();
        statusService.add('info',linguaService._("Removed"));
      });
    },
    containsArtistAlbum:function(ar,al) {
      var n = artistAlbumModelService.artistAlbumModel.artistAlbums;
      for (var i = 0; i < n.length; i++) {
        if (ar.toLowerCase() == n[i].artist.toLowerCase() && al.toLowerCase() == n[i].album.toLowerCase())
          return true;
      }
      return false;
    }
  };
  return artistAlbumModelService;
}]);

angular.module('swl').factory('statusService',['$timeout',function($timeout) {
  "use strict";
  var statusService = {
    statuses:[],
    add:function(type,msg) {
      statusService.statuses.push({'type':type, 'msg': msg});
      $timeout(function() {
        statusService.statuses.splice(0,1);
      }, 3000);

    }
  };
  return statusService;
}]);


angular.module('swl').factory('lastFMOnSpotifyService',['lastFMService','spotifyService','swlSettings',
  function(lastFMService,spotifyService,swlSettings){
  "use strict";
  var lastFMOnSpotifyService = {
    getSuggsOnSpot:function(un, callback) {
      lastFMService.getNews(swlSettings.lastFMapiKey,un).then(function(d) {
        var onSpot = [];
        var suggs = [];
        var handler = function(r,artist, album,img) {
          if (r.length > 0) {
            for (var i = 0; i < r.length;i++) {
              onSpot.push({
                'artist': r[i].artist,
                'album':r[i].album,
                'href':r[i].href,
                'img':r[i].img
              });
            }
          } else {
            suggs.push({
              'artist': artist,
              'album':album,
              'img':img
            });
          }
        };
        for (var i = 0; i < d.length; i++) {
          spotifyService.lookupArtistAlbums(d[i].artist,d[i].album, d[i].image, handler);
        }
        callback(suggs, onSpot);
      });
    }
  };
  return lastFMOnSpotifyService;
}]);