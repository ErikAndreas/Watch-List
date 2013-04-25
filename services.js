'use strict';
swl.factory('lastFMService', function($http,$q) {
  var lastFMService = {
    // http://stackoverflow.com/questions/12505760/angularjs-processing-http-response-in-service
    getNews: function(un) {
      var findings = [];
      // $http returns a promise, which has a then function, which also returns a promise
      var p1 = $http.get('http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=1&user='+un+'&api_key=00198b31b392d0750f88819830e49680');
      var p2 = $http.get('http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=0&user='+un+'&api_key=00198b31b392d0750f88819830e49680');
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
    albumCover: function(artist, album, callback,ref) {
      $http.get('http://ws.audioscrobbler.com/2.0/?method=album.getInfo&format=json&artist='+artist.replace(/&/g,'%26')+'&album='+album.replace(/&/g,'%26')+'&api_key=00198b31b392d0750f88819830e49680').success(function(data) {
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
});

swl.factory('spotifyService', function($http) {
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
              if (data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase()
                && spotifyService.checkAvail(data.albums[j].availability.territories)          
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
      $http.get('http://ws.spotify.com/lookup/1/.json?uri='+uri).success(function(data) {
        if (data.artist) {
          callback(data.artist.name);
        }
        else if (data.album) {
          callback(data.album.artist, data.album.name);
        }
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
  }
  return spotifyService;
});

swl.factory('storeService',function(){
  var storeService = {
    local:{getItem:function(){}},
    remote:{}
  };
  return storeService;
});

swl.factory('lsAdaptorService',function() {
  return {
    getItem:function(key) {
      return localStorage.getItem(key);
    },
    setItem:function(key, val) {
      localStorage.setItem(key, val);
    },
    remove:function(key) {
      localStorage.removeItem(key);
    }
  }
});

swl.factory('watchListService',function(storeService) {
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
      if (dd < 10) {dd = '0' + dd}
      if (mm < 10) {mm = '0' + mm}
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
});

swl.factory('artistNewsModelService',function(watchListService,spotifyService,lastFMService,statusService){
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
      for (var i = 0; i < artistNewsModelService.artistNewsModel.news.length; i++) {
        spotifyService.lookupNews(artistNewsModelService.artistNewsModel.news[i].artist,function(findings,i,ignoreReleaseList) {
        if (findings && findings.length > 0) {
          //console.log(findings,i);
          artistNewsModelService.artistNewsModel.imgs[i] = 'img/spotify32bw.png';      
          for (var j=0;j<findings.length;j++) {
            //console.log(artistNewsFindings);
            artistNewsModelService.artistNewsModel.artistNewsFindings.push(findings[j]);
            lastFMService.albumCover(findings[j].artist, findings[j].album,function(img, k){
              if (img && img.length > 0) {
                //console.log(img, k);
                artistNewsModelService.artistNewsModel.artistNewsFindings[k-1].img=img;
              }
            },artistNewsModelService.artistNewsModel.artistNewsFindings.length);       
          }
        } else {
          artistNewsModelService.artistNewsModel.imgs[i] = 'img/close-32.png';
        }
        },i,artistNewsModelService.artistNewsModel.ignoreReleaseList);
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
      }
    },
    rmNews:function(idx) {
      artistNewsModelService.artistNewsModel.news.splice(idx,1);
      artistNewsModelService.populate();
      watchListService.saveNews(artistNewsModelService.artistNewsModel.news);
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
});

swl.factory('artistAlbumModelService',function(watchListService,spotifyService,lastFMService,statusService){
  var artistAlbumModelService = {
    // in-memory model
    artistAlbumModel: {
      'artistAlbums':watchListService.getData().artistAlbums,
      'imgs':[],
      'artistAlbumsFindings':[]
    },
    populate:function(){
      artistAlbumModelService.artistAlbumModel.artistAlbumsFindings = [];
      for (var i = 0; i < artistAlbumModelService.artistAlbumModel.artistAlbums.length; i++) {
        // meth: artist,album,img,callback,ref
        // callback: findings, artist, album,img,ref
        spotifyService.lookupArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums[i].artist,artistAlbumModelService.artistAlbumModel.artistAlbums[i].album,'',function(findings,artist,album,img,i) {
        if (findings && findings.length > 0) {
          //console.log(findings,i);
          artistAlbumModelService.artistAlbumModel.imgs[i] = 'img/spotify32bw.png';      
          for (var j=0;j<findings.length;j++) {
            //console.log(artistNewsFindings);
            artistAlbumModelService.artistAlbumModel.artistAlbumsFindings.push(findings[j]);
            lastFMService.albumCover(findings[j].artist, findings[j].album,function(img, k){
              if (img && img.length > 0) {
                //console.log(img, k);
                artistAlbumModelService.artistAlbumModel.artistAlbumsFindings[k-1].img=img;
              }
            },artistAlbumModelService.artistAlbumModel.artistAlbumsFindings.length);       
          }
        } else {
          artistAlbumModelService.artistAlbumModel.imgs[i] = 'img/close-32.png';
        }
        },i);
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
      }
    },
    rmArtistAlbum:function(idx) {
      artistAlbumModelService.artistAlbumModel.artistAlbums.splice(idx,1);
      artistAlbumModelService.populate();
      watchListService.saveArtistAlbums(artistAlbumModelService.artistAlbumModel.artistAlbums);
    },
    containsArtistAlbum:function(ar,al) {
      var n = artistAlbumModelService.artistAlbumModel.artistAlbums;
      for (var i = 0; i < n.length; i++) {
        if (ar.toLowerCase() == n[i].artist.toLowerCase() && al.toLowerCase() == n[i].album.toLowerCase())
          return true;
      }
      return false;
    }
  }
  return artistAlbumModelService;
});

swl.factory('statusService',function($timeout) {
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
});

swl.factory('rsService',function(storeService) {
  var rsService = {
    key:storeService.local.getItem('RS.userAddress'),
    category:'music',
    auth:function(userAddress) {
      remoteStorage.getStorageInfo(userAddress, function(err, storageInfo) {
        if (!err) {
          // save storageInfo obj
          rsService.key = userAddress;
          storeService.local.setItem('RS.userAddress',userAddress);
          storeService.local.setItem('RS.userStorageInfo', angular.toJson(storageInfo));
          console.log('pathname ' + location.pathname.substring(0,location.pathname.lastIndexOf('/')));
          //var redirectUri = location.protocol + '//' + location.host + location.pathname.substring(0,location.pathname.lastIndexOf('/')) + '/receiveToken.html';
          var redirectUri = location.protocol + '//' + location.host + location.pathname.substring(0,location.pathname.lastIndexOf('/')) + '';
          console.log('will open ' + redirectUri + ' for oauth dance');
          var oauthPage = remoteStorage.createOAuthAddress(storageInfo, [rsService.category+':rw'], redirectUri);
          console.log(oauthPage);
          location.href = oauthPage;
        } else {        
          console.log(err);
        }
      });
    },
    getItem:function(callback) {
      var token = storeService.local.getItem('RS.token');
      var key = storeService.local.getItem('RS.userAddress');
      console.log('tryin remote get for ' + key + ' using token ' + token);
      var storageInfo = JSON.parse(storeService.local.getItem('RS.userStorageInfo'));
      if (storageInfo) {
        var client = remoteStorage.createClient(storageInfo,rsService.category+'/SWL', token);
        // TODO: check err == 401 -> session expired, if (err) -> path not found, data == undefined -> no data on path
        client.get(key, function(err, data) { 
          callback(data,err);
        });
      } else {
        callback(null,'no storageInfo, connect again');
      }
    },
    setItem:function(value, callback) {
      var token = storeService.local.getItem('RS.token');
      var key = storeService.local.getItem('RS.userAddress');
      console.log('tryin remote set for ' + key + ' using token ' + token);
      var storageInfo = JSON.parse(storeService.local.getItem('RS.userStorageInfo'));
      var client = remoteStorage.createClient(storageInfo, rsService.category+'/SWL', token);
      // TODO: check err == 401 -> session expired, if (err) -> path not found, data == undefined -> no data on path
      client.put(key, value, function(err) { 
        callback(err);
      });   
    }
  };
  return rsService;
});

swl.factory('remoteCheckService',function(storeService,statusService,watchListService) {
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
            watchListService.data = data;
            watchListService.data.updatedAt = data.updatedAt;
            storeService.local.setItem('WL-data',angular.toJson(watchListService.data));
          } 
        } else {
          statusService.add('error','No data available');
        }
      }
    });
    }
  };
  return remoteCheckService;
});

swl.factory('lastFMOnSpotifyService',function(lastFMService,spotifyService){
  var lastFMOnSpotifyService = {
    getSuggsOnSpot:function(un, callback) {  
      lastFMService.getNews(un).then(function(d) {
        var onSpot = [];
        var suggs = [];
        for (var i = 0; i < d.length; i++) {
          spotifyService.lookupArtistAlbums(d[i].artist,d[i].album, d[i].image, function(r,artist, album,img){
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
          });
        }
        callback(suggs, onSpot);
      });
    }
  };
  return lastFMOnSpotifyService;
});