angular.module('swl').controller('LastFMCtrl', ['$scope', 'lastFMOnSpotifyService', 'artistAlbumModelService',
  function LastFMCtrl($scope, lastFMOnSpotifyService, artistAlbumModelService) {
    "use strict";
    if (localStorage.getItem('lastFMuserName')) {
      $scope.lastFMuserName = localStorage.getItem('lastFMuserName');
      lastFMOnSpotifyService.getSuggsOnSpot($scope.lastFMuserName, function (suggs, onSpot) {
        $scope.suggs = suggs;
        $scope.onSpot = onSpot;
      });
    }

    $scope.setLastFMuserName = function () {
      localStorage.setItem('lastFMuserName', $scope.lastFMuserName);
      lastFMOnSpotifyService.getSuggsOnSpot($scope.lastFMuserName, function (suggs, onSpot) {
        $scope.suggs = suggs;
        $scope.onSpot = onSpot;
      });
    };

    $scope.addArtistAlbum = function (ar, al) {
      artistAlbumModelService.addArtistAlbum(ar, al);
    };
  }
]);

angular.module('swl').controller('NewsCtrl', ['$scope', 'artistNewsModelService',
  function NewsCtrl($scope, artistNewsModelService) {
    "use strict";
    $scope.artistNewsModel = artistNewsModelService.artistNewsModel;
    artistNewsModelService.populate();

    $scope.addArtistNews = function () {
      // TODO check not empty
      var a = $scope.mAddArtistNews;
      artistNewsModelService.addNews(a);
      $scope.mAddArtistNews = '';
    };

    $scope.rm = function (idx) {
      artistNewsModelService.rmNews(idx);
    };

    $scope.addIgnore = function (href) {
      artistNewsModelService.addIgnore(href);
      /*for (var i = 0; i < $scope.artistNewsModel.artistNewsFindings.length; i++) {
            if ($scope.artistNewsModel.artistNewsFindings[i].href === href) {
                $scope.artistNewsModel.artistNewsFindings.splice(i, 1);
                $scope.artistNewsModel.artistNewsFindings[k-1]
                break;
            }
        }*/
    };
  }
]);

angular.module('swl').controller('AlbumsCtrl', ['$scope', 'artistAlbumModelService',
  function AlbumsCtrl($scope, artistAlbumModelService) {
    "use strict";
    $scope.artistAlbumModel = artistAlbumModelService.artistAlbumModel;
    artistAlbumModelService.populate();
    $scope.addArtistAlbum = function () {
      // TODO check not empty
      var ar = $scope.mAddArtist;
      var al = $scope.mAddAlbum;
      artistAlbumModelService.addArtistAlbum(ar, al);
      $scope.mAddArtist = '';
      $scope.mAddAlbum = '';
    };

    $scope.rm = function (idx) {
      artistAlbumModelService.rmArtistAlbum(idx);
    };
  }
]);

angular.module('swl').controller('SettingsCtrl', ['$scope', '$rootScope', 'watchListService', 'statusService', 'dropboxService',
  function SettingsCtrl($scope, $rootScope, watchListService, statusService, dropboxService) {
    "use strict";

    $scope.dropboxAuth = function () {
      dropboxService.sendAuth();
    };

    $scope.dbBtnTxt = dropboxService.isAuth() ? 'Connected' : 'Connect with Dropbox';

    // JSON.stringify will incl $$hashKey added by angular
    watchListService.getData(function (data) {
      $scope.exportData = angular.toJson(data);
    });

    $scope.importData = function () {
      var o = $scope.mImport;
      try {
        o = JSON.parse(o);
        watchListService.save(o, function () {
          $scope.mImport = '';
          statusService.add('info', $scope._("import complete"));
        });
      } catch (err) {
        statusService.add('error', err.message);
      }
    };

    $rootScope.$on('dropFileEvent', function (evt, fc) {
      $scope.mImport = fc;
      $scope.$apply();
    });
  }
]);

angular.module('swl').controller('navCtrl', ['$scope', '$location', '$rootScope', 'spotifyService', 'artistNewsModelService',
  function ($scope, $location, $rootScope, spotifyService, artistNewsModelService) {
    "use strict";
    $scope.isActive = function (route) {
      return route === $location.path();
    };

    $rootScope.$on('dropFromSpotifyEvent', function (evt, fc) {
      var uri = fc.substring(fc.lastIndexOf('/') + 1);
      spotifyService.lookupArtist('spotify:artist:' + uri, function (artist) {
        artistNewsModelService.addNews(artist);
      });
      // weird, if not calling $apply the $http call in lookupArtist wont happen...
      $scope.$apply();
    });
  }
]);

angular.module('swl').controller('StatusController', ['$scope', 'statusService',
  function StatusController($scope, statusService) {
    "use strict";
    $scope.statuses = statusService.statuses;
  }
]);
