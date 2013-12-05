angular.module('dropbox', []);
angular.module('dropbox').factory('dropboxService', ['$http', '$rootScope', '$log',
  function ($http, $rootScope, $log) {
    "use strict";
    var client = new window.Dropbox.Client({
      key: 'u76dx4vjx6bke01'
    });
    var table;
    var dropboxService = {
      sendAuth: function () {
        client.authenticate();
      },
      authenticate: function (errCb) {
        client.authenticate({
          interactive: false
        }, function (error) {
          if (error) {
            errCb(error);
          }
        });
      },
      getTable: function (cb, errCb) {
        if (!table) {
          $log.log('will open');
          var datastoreManager = client.getDatastoreManager();
          datastoreManager.openDefaultDatastore(function (error, datastore) {
            $log.log('ds open');
            if (error) {
              errCb(error);
            }
            table = datastore.getTable('swl');
            $rootScope.$apply(function () {
              cb(table);
            });
          });
        } else {
          $log.log('already got it');
          cb(table);
        }
      },
      isAuth: function () {
        return client.isAuthenticated();
      },
      get: function (cb, errCb) {
        dropboxService.getTable(function (t) {
          var rs = t.getOrInsert('1', {
            'data': '{"news":[],"artistAlbums":[],"ignoreReleaseList":[],"updatedAt":{}}'
          });
          var data = JSON.parse(rs.get('data'));
          $log.log('get dropbox');
          //rs.deleteRecord();
          cb(data);
        }, errCb);
      },
      set: function (data, cb, errCb) {
        dropboxService.getTable(function (t) {
          var rs = t.get("1");
          rs.set('data', data);
          $log.log('set dropbox');
          if (cb) {
            cb();
          }
        }, errCb);
      }
    };
    return dropboxService;
  }
]);
