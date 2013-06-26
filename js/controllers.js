
angular.module('swl').controller('LastFMCtrl', ['$scope','lastFMOnSpotifyService','storeService','artistAlbumModelService',function LastFMCtrl($scope,lastFMOnSpotifyService,storeService,artistAlbumModelService) {
    "use strict";
    if (storeService.local.getItem('lastFMuserName')) {
        $scope.lastFMuserName = storeService.local.getItem('lastFMuserName');
        lastFMOnSpotifyService.getSuggsOnSpot($scope.lastFMuserName,function(suggs, onSpot) {
            $scope.suggs = suggs;
            $scope.onSpot = onSpot;
        });
    }

    $scope.setLastFMuserName = function() {
        storeService.local.setItem('lastFMuserName',$scope.lastFMuserName);
        lastFMOnSpotifyService.getSuggsOnSpot($scope.lastFMuserName,function(suggs, onSpot) {
            $scope.suggs = suggs;
            $scope.onSpot = onSpot;
        });
    };

    $scope.addArtistAlbum = function(ar,al) {
        console.log('add ' +ar + " - " + al);
        artistAlbumModelService.addArtistAlbum(ar,al);
    };
}]);

angular.module('swl').controller('NewsCtrl',['$scope','artistNewsModelService',function NewsCtrl($scope,artistNewsModelService) {
    "use strict";
    $scope.artistNewsModel = artistNewsModelService.artistNewsModel;
    artistNewsModelService.populate();

    //console.log($scope);

    $scope.addArtistNews = function() {
        // TODO check not empty
        var a = $scope.mAddArtistNews;
        artistNewsModelService.addNews(a);
        console.log($scope);
        $scope.mAddArtistNews = '';
    };

    $scope.rm = function(idx) {
        artistNewsModelService.rmNews(idx);
    };

    $scope.addIgnore = function(href) {
        artistNewsModelService.addIgnore(href);
    };
}]);

angular.module('swl').controller('AlbumsCtrl',['$scope', 'artistAlbumModelService',function AlbumsCtrl($scope, artistAlbumModelService){
    "use strict";
    $scope.artistAlbumModel = artistAlbumModelService.artistAlbumModel;
    artistAlbumModelService.populate();
    //console.log($scope);
    $scope.addArtistAlbum = function() {
        // TODO check not empty
        var ar = $scope.mAddArtist;
        var al = $scope.mAddAlbum;
        console.log('add ' +ar + " - " + al);
        artistAlbumModelService.addArtistAlbum(ar,al);
        console.log($scope);
        $scope.mAddArtist = '';
        $scope.mAddAlbum = '';
    };

    $scope.rm = function(idx) {
        artistAlbumModelService.rmArtistAlbum(idx);
    };
}]);

angular.module('swl').controller('SettingsCtrl',['$scope','$rootScope','rsService','watchListService','statusService',function SettingsCtrl($scope,$rootScope,rsService,watchListService,statusService){
    "use strict";
    $scope.auth = function() {
        rsService.auth($scope.mUserAddress);
    };

    // JSON.stringify will incl $$hashKey added by angular
    $scope.exportData = angular.toJson(watchListService.getData());

    $scope.importData = function() {
        var o = $scope.mImport;
        try {
            o = JSON.parse(o);
            watchListService.save(o);
            $scope.mImport = '';
            statusService.add('info',_("import complete"));
        } catch (err) {
            statusService.add('error',err.message);
        }
    };

    $rootScope.$on('dropFileEvent', function(evt,fc) {
        console.log('got dropFileEvent', fc);
        $scope.mImport = fc;
        $scope.$apply();
    });
}]);

angular.module('swl').controller('navCtrl', ['$scope', '$location', '$rootScope', 'spotifyService', 'artistNewsModelService', function ($scope, $location, $rootScope, spotifyService,artistNewsModelService) {
    "use strict";
    $scope.isActive = function(route) {
        //console.log(route);
        return route === $location.path();
    };

    $rootScope.$on('dropFromSpotifyEvent', function(evt,fc) {
        //console.log('got dropFromSpotifyEvent', fc)
        var uri = fc.substring(fc.lastIndexOf('/')+1);
        //console.log(uri);
        spotifyService.lookupArtist('spotify:artist:'+uri,function(artist) {
            //console.log(artist);
            artistNewsModelService.addNews(artist);
        });
        // weird, if not calling $apply the $http call in lookupArtist wont happen...
        $scope.$apply();
    });
}]);

angular.module('swl').controller('StatusController',['$scope', 'statusService',function StatusController($scope, statusService) {
    "use strict";
    $scope.statuses = statusService.statuses;
}]);