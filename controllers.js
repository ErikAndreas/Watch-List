'use strict';
swl.controller('LastFMCtrl', function LastFMCtrl($scope,lastFMOnSpotifyService,storeService,artistAlbumModelService) {
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
  	}

  	$scope.addArtistAlbum = function(ar,al) {
  		console.log('add ' +ar + " - " + al);
  		artistAlbumModelService.addArtistAlbum(ar,al);
  	}
});

swl.controller('NewsCtrl',function NewsCtrl($scope,artistNewsModelService) {
	$scope.artistNewsModel = artistNewsModelService.artistNewsModel;
	artistNewsModelService.populate();

	console.log($scope);

	$scope.addArtistNews = function() {
		// TODO check not empty
		var a = $scope.mAddArtistNews;
  		artistNewsModelService.addNews(a);
  		console.log($scope);
  		$scope.mAddArtistNews = '';
  	}

  	$scope.rm = function(idx) {
  		artistNewsModelService.rmNews(idx);
  	}

  	$scope.addIgnore = function(href) {
  		artistNewsModelService.addIgnore(href);
  	}
});

swl.controller('AlbumsCtrl',function AlbumsCtrl($scope, artistAlbumModelService){
	$scope.artistAlbumModel = artistAlbumModelService.artistAlbumModel;
	artistAlbumModelService.populate();
	console.log($scope);
	$scope.addArtistAlbum = function() {
		// TODO check not empty
		var ar = $scope.mAddArtist;
		var al = $scope.mAddAlbum;
  		console.log('add ' +ar + " - " + al);
  		artistAlbumModelService.addArtistAlbum(ar,al);
  		console.log($scope);
  		$scope.mAddArtist = '';
  		$scope.mAddAlbum = '';
  	}

  	$scope.rm = function(idx) {
  		artistAlbumModelService.rmArtistAlbum(idx);
  	}
});

swl.controller('SettingsCtrl',function SettingsCtrl($scope,$rootScope,rsService,watchListService,statusService){
	
	$scope.auth = function() {
		rsService.auth($scope.mUserAddress);
	}

	// JSON.stringify will incl $$hashKey added by angular
	$scope.exportData = angular.toJson(watchListService.getData());

	$scope.importData = function() {
		var o = $scope.mImport;
		try {
			o = JSON.parse(o);
			watchListService.save(o);
			$scope.mImport = '';
			statusService.add('info','import complete');
		} catch (err) {
			statusService.add('error',err.message);
		}
	}

	$rootScope.$on('dropFileEvent', function(evt,fc) {
		console.log('got dropFileEvent', fc)
		$scope.mImport = fc;
		$scope.$apply();
	});
});

swl.controller('navCtrl', ['$scope', '$location', '$rootScope', 'spotifyService', 'artistNewsModelService', function ($scope, $location, $rootScope, spotifyService,artistNewsModelService) {
    $scope.isActive = function(route) {
    	//console.log(route);
        return route === $location.path();
    }

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

swl.controller('StatusController',function StatusController($scope, statusService) {	
	$scope.statuses = statusService.statuses;
});