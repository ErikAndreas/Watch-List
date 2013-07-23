

angular.module('swl').factory('watchListService',['storeService','$log',function(storeService,$log) {
  "use strict";
  var watchListService = {
    // model to persist (local and remote)
    data: {
      news:[],
      artistAlbums:[],
      ignoreReleaseList:[],
      updatedAt:{}
    },
    tSync:{},
    getData:function(){
      var d = storeService.local.getItem('WL-data');
      if (d) {
        watchListService.data = JSON.parse(d);
      }
      return watchListService.data;
    },
    saveNews:function(news) {
      var d = watchListService.getData();
      d.news = news;
      watchListService.save(d);
    },
    saveIgnoreReleaseList:function(list) {
      var d = watchListService.getData();
      d.ignoreReleaseList = list;
      watchListService.save(d);
    },
    saveArtistAlbums:function(list) {
      var d = watchListService.getData();
      d.artistAlbums = list;
      watchListService.save(d);
    },
    save:function(d) {
      d.updatedAt = new Date(); // FIXME? (utc)
      $log.log('saving local', d);
      storeService.local.setItem('WL-data',angular.toJson(d));
      // settimeout call setRemote
      $log.log('save data remote');
      if (storeService.local.getItem('RS.token')) {
        watchListService.tSync = window.setTimeout(function(){watchListService.setRemote();}, 5000);
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
    },
    // remote is stored as string, callback need to parse to json
    getRemote:function(callback) {
      storeService.remote.getItem(callback);
    },
    setRemote:function(callback) {
      storeService.remote.setItem(angular.toJson(watchListService.getData()),function(){
        $log.log('remote updated');
        var d = watchListService.getData();
        //d.updatedAt = date;
        storeService.local.setItem('WL-data',angular.toJson(d));
        if (callback) callback();
      });
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
      'news':watchListService.getData().news,
      'ignoreReleaseList':watchListService.getData().ignoreReleaseList,
      'imgs':[],
      'artistNewsFindings':[]
    },
    populate:function(){
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
      for (var i = 0; i < artistNewsModelService.artistNewsModel.news.length; i++) {
        spotifyService.lookupNews(artistNewsModelService.artistNewsModel.news[i].artist,handler,i,artistNewsModelService.artistNewsModel.ignoreReleaseList);
      }
    },
    addNews:function(a) {
      if (artistNewsModelService.containsNews(a)) {
        $log.log('duplicate, skipping ',a);
        statusService.add('error',linguaService._("Skipping duplicate, %s is already in the list",a));
      } else  {
        artistNewsModelService.artistNewsModel.news.push({"artist": a, "added": watchListService.dformat()});
        artistNewsModelService.populate();
        watchListService.saveNews(artistNewsModelService.artistNewsModel.news);
        statusService.add('info',linguaService._("Added %s", a));
      }
    },
    rmNews:function(idx) {
      artistNewsModelService.artistNewsModel.news.splice(idx,1);
      artistNewsModelService.populate();
      watchListService.saveNews(artistNewsModelService.artistNewsModel.news);
      statusService.add('info',linguaService._("Removed"));
    },
    addIgnore:function(href) {
      artistNewsModelService.artistNewsModel.ignoreReleaseList.push(href);
      artistNewsModelService.populate();
      watchListService.saveIgnoreReleaseList(artistNewsModelService.artistNewsModel.ignoreReleaseList);
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
      'artistAlbums':watchListService.getData().artistAlbums,
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
      for (var i = 0; i < artistAlbumModelService.artistAlbumModel.artistAlbums.length; i++) {
        // meth: artist,album,img,callback,ref
        // callback: findings, artist, album,img,ref
        spotifyService.lookupArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums[i].artist,artistAlbumModelService.artistAlbumModel.artistAlbums[i].album,'',handler,i);
      }
    },
    addArtistAlbum:function(ar,al) {
      if (artistAlbumModelService.containsArtistAlbum(ar,al)) {
       $log.log('duplicate, skipping ',ar,al);
       statusService.add('error',linguaService._("Skipping duplicate, %1$s %2$s is already in the list",[ar,al]));
      } else  {
        artistAlbumModelService.artistAlbumModel.artistAlbums.push({"artist": ar, "album": al, "added": watchListService.dformat()});
        artistAlbumModelService.populate();
        watchListService.saveArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums);
        statusService.add('info',linguaService._("Added %1$s - %2$s",[ar,al]));
      }
    },
    rmArtistAlbum:function(idx) {
      artistAlbumModelService.artistAlbumModel.artistAlbums.splice(idx,1);
      artistAlbumModelService.populate();
      watchListService.saveArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums);
      statusService.add('info',linguaService._("Removed"));
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

angular.module('swl').factory('remoteCheckService',['linguaService','storeService','statusService','watchListService','$log',
  function(linguaService,storeService,statusService,watchListService,$log) {
  "use strict";
  var remoteCheckService = {
    checkForData:function() {
      storeService.remote.getItem(function(data,err){
        if (401 == err) {
          statusService.add('error',linguaService._("Session expired, connect again: %s", err));
        } else if (err) {
          statusService.add('error',linguaService._("Path not found %s", err));
        } else {
          if (data) {
            data = JSON.parse(data);
            $log.log('remote data',data);
            // compare remote updatedAt w local d.updatedAt - if remote newer update local
            var remoteD = Date.parse(data.updatedAt);
            $log.log('remote date',data.updatedAt,remoteD);
            var localD = Date.parse(watchListService.getData().updatedAt);
            if (isNaN(localD)) localD = 0;
            $log.log('local date',localD);
            if (remoteD > localD) {
              $log.log('remote newer, updating');
              //watchListService.data = data;
              //watchListService.data.updatedAt = data.updatedAt;
              //storeService.local.setItem('WL-data',angular.toJson(watchListService.data));
              storeService.local.setItem('WL-data',angular.toJson(data));
              // need some magic here to kick the bindings and update ui, we're out of angular scope here...
            }
          } else {
            statusService.add('error',linguaService._("No data available"));
          }
        }
      });
    }
  };
  return remoteCheckService;
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