angular.module('dropbox',[]);
angular.module('dropbox').factory('dropboxService', ['$http','$rootScope',function($http,$rootScope) {
  "use strict";
  var client = new Dropbox.Client({key: 'u76dx4vjx6bke01'});
  var table;
  var dropboxService = {
    sendAuth:function() {client.authenticate();},
    authenticate:function(errCb) {
        client.authenticate({interactive: false}, function (error) {
          if (error) {
              errCb(error);
          }
        });
    },
    getTable:function(cb,errCb) {
      if (!table) {
        console.log('will open');
        var datastoreManager = client.getDatastoreManager();
        datastoreManager.openDefaultDatastore(function (error, datastore) {
          console.log('ds open');
          if (error) {
              errCb(error);
          }
          table = datastore.getTable('swl');
          $rootScope.$apply(function() {
            cb(table);
          });
        });
      } else {
        console.log('already got it');
        cb(table);
      }
    },
    isAuth:function() {
        return client.isAuthenticated();
    },
    get:function(cb, errCb) {
      dropboxService.getTable(function(t) {
        var rs = t.getOrInsert('1',{'data':'{"news":[],"artistAlbums":[],"ignoreReleaseList":[],"updatedAt":{}}'});
        var data = JSON.parse(rs.get('data'));
        console.log('get dropbox');
        //rs.deleteRecord();
        cb(data);
      },errCb);
    },
    set:function(data, cb, errCb) {
      dropboxService.getTable(function(t) {
        var rs = t.get("1");
        rs.set('data', data);
        console.log('set dropbox');
        if (cb) cb();
      },errCb);
    }
  };
  return dropboxService;
}]);