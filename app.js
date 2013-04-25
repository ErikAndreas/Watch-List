'use strict';
var swl = angular.module('swl', function($httpProvider){	
	// https://github.com/angular/angular.js/pull/1454
	//delete $httpProvider.defaults.headers.common["X-Requested-With"]
});

swl.config(function($routeProvider,$compileProvider) {
	$routeProvider.
		when('/home', {templateUrl: 'partials/home.html',   controller: 'LastFMCtrl'}).
		when('/news', {templateUrl: 'partials/news.html', controller: 'NewsCtrl'}).
		when('/albums', {templateUrl: 'partials/albums.html', controller: 'AlbumsCtrl'}).
		when('/settings', {templateUrl: 'partials/settings.html', controller: 'SettingsCtrl'}).
		otherwise({redirectTo: '/home'});
	$compileProvider.urlSanitizationWhitelist(/^\s*(https?|spotify):/);
});

swl.value('swlSettings',{
		lastFMapiKey:'00198b31b392d0750f88819830e49680'
});

swl.run(function($rootScope,storeService,lsAdaptorService,rsService,remoteCheckService){
	console.log('swl.run');
	storeService.local = lsAdaptorService;
	storeService.remote = rsService;
	if (remoteStorage.receiveToken()) {
		var token = remoteStorage.receiveToken()
		console.log('back from oauth, got token ',token);
		storeService.local.setItem('RS.token',token);
	}
	if (storeService.local.getItem('RS.token')) {
		remoteCheckService.checkForData();
	}
});