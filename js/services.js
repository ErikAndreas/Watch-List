

angular.module('swl').factory('watchListService',['storeService',function(storeService) {
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
      console.log('wls getData');
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
      console.log('saving local', d);
      storeService.local.setItem('WL-data',angular.toJson(d));
      // settimeout call setRemote
      console.log('save data remote');
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
        console.log('remote updated');
        var d = watchListService.getData();
        //d.updatedAt = date;
        storeService.local.setItem('WL-data',angular.toJson(d));
        if (callback) callback();
      });
    }
  };
  return watchListService;
}]);

angular.module('swl').factory('artistNewsModelService',['watchListService','spotifyService','lastFMService','statusService','swlSettings',function(watchListService,spotifyService,lastFMService,statusService,swlSettings){
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
          //console.log(img, k);
          artistNewsModelService.artistNewsModel.artistNewsFindings[k-1].img=img;
        }
      };
      var handler = function(findings,i,ignoreReleaseList) {
        if (findings && findings.length > 0) {
          //console.log(findings,i);
          artistNewsModelService.artistNewsModel.imgs[i] = 'img/spotify32bw.png';      
          for (var j=0;j<findings.length;j++) {
            //console.log(artistNewsFindings);
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
        console.log('duplicate, skipping ',a);
        statusService.add('error','Skipping duplicate, '+a+' is already in the list');
      } else  {
        artistNewsModelService.artistNewsModel.news.push({"artist": a, "added": watchListService.dformat()});
        artistNewsModelService.populate();
        watchListService.saveNews(artistNewsModelService.artistNewsModel.news);
        statusService.add('info','Added '+a);
      }
    },
    rmNews:function(idx) {
      artistNewsModelService.artistNewsModel.news.splice(idx,1);
      artistNewsModelService.populate();
      watchListService.saveNews(artistNewsModelService.artistNewsModel.news);
      statusService.add('info','Removed');
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

angular.module('swl').factory('artistAlbumModelService',['watchListService','spotifyService','lastFMService','statusService','swlSettings',function(watchListService,spotifyService,lastFMService,statusService,swlSettings){
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
          //console.log(img, k);
          artistAlbumModelService.artistAlbumModel.artistAlbumsFindings[k-1].img=img;
        }
      };
      var handler = function(findings,artist,album,img,i) {
        if (findings && findings.length > 0) {
          //console.log(findings,i);
          artistAlbumModelService.artistAlbumModel.imgs[i] = 'img/spotify32bw.png';      
          for (var j=0;j<findings.length;j++) {
            //console.log(artistNewsFindings);
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
       console.log('duplicate, skipping ',ar,al);
       statusService.add('error','Skipping duplicate, '+ar+' - '+al+' is already in the list');
      } else  {    
        artistAlbumModelService.artistAlbumModel.artistAlbums.push({"artist": ar, "album": al, "added": watchListService.dformat()});
        artistAlbumModelService.populate();
        watchListService.saveArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums);
        statusService.add('info','Added '+ar+' - '+al);
      }
    },
    rmArtistAlbum:function(idx) {
      artistAlbumModelService.artistAlbumModel.artistAlbums.splice(idx,1);
      artistAlbumModelService.populate();
      watchListService.saveArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums);
      statusService.add('info','Removed');
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
  var statusService = {
    statuses:[],
    add:function(type,msg) {
      statusService.statuses.push({'type':type, 'msg': msg});
      $timeout(function() {
        console.log('timeout');
        statusService.statuses.splice(0,1);
      }, 3000);
      
    }
  };
  return statusService;
}]);

angular.module('swl').factory('remoteCheckService',['storeService','statusService','watchListService',function(storeService,statusService,watchListService) {
  var remoteCheckService = {
    checkForData:function() {
      storeService.remote.getItem(function(data,err){
        if (401 == err) {
          statusService.add('error','Session expired, connect again: ' + err);
        } else if (err) {
          statusService.add('error','Path not found ' + err);
        } else {
          if (data) {
            data = JSON.parse(data);
            console.log('remote data',data);
            // compare remote updatedAt w local d.updatedAt - if remote newer update local
            var remoteD = Date.parse(data.updatedAt);
            console.log('remote date',data.updatedAt,remoteD);
            var localD = Date.parse(watchListService.getData().updatedAt);
            if (isNaN(localD)) localD = 0;
            console.log('local date',localD);
            if (remoteD > localD) {
              console.log('remote newer, updating');
              //watchListService.data = data;
              //watchListService.data.updatedAt = data.updatedAt;
              //storeService.local.setItem('WL-data',angular.toJson(watchListService.data));
              storeService.local.setItem('WL-data',angular.toJson(data));
              // need some magic here to kick the bindings and update ui, we're out of angular scope here...
            } 
          } else {
            statusService.add('error','No data available');
          }
        }
      });
    }
  };
  return remoteCheckService;
}]);

angular.module('swl').factory('lastFMOnSpotifyService',['lastFMService','spotifyService','swlSettings',function(lastFMService,spotifyService,swlSettings){
  var lastFMOnSpotifyService = {
    getSuggsOnSpot:function(un, callback) {  
      lastFMService.getNews(swlSettings.lastFMapiKey,un).then(function(d) {
        var onSpot = [];
        var suggs = [];
        var handler = function(r,artist, album,img) {
          if (r.length > 0) {
            for (var i = 0; i < r.length;i++) {
              console.log('onSpot ' , r[i].artist, r[i].album,r[i].img,r[i].href);
              onSpot.push({
                'artist': r[i].artist,
                'album':r[i].album,
                'href':r[i].href,
                'img':r[i].img
              });
            }
          } else {
            console.log('sugg' , artist, album,img);
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