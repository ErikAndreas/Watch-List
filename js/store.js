
angular.module('store',[]);
angular.module('store').factory('storeService',function(){
  var storeService = {
    local:{getItem:function(){}},
    remote:{}
  };
  return storeService;
});

angular.module('store').factory('lsAdaptorService',function() {
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
  };
});

angular.module('store').factory('rsService',function(storeService) {
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