/*
on modules
http://sravi-kiran.blogspot.se/2013/02/ModulesInAngularJS.html
http://briantford.com/blog/huuuuuge-angular-apps.html
http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript
*/

angular.module('swl', ['store','spotify','lastfm','lingua']);

angular.module('swl').config(['$routeProvider','$compileProvider',function($routeProvider,$compileProvider) {
	"use strict";
	$routeProvider.
		when('/home', {templateUrl: 'partials/home.html',   controller: 'LastFMCtrl'}).
		when('/news', {templateUrl: 'partials/news.html', controller: 'NewsCtrl'}).
		when('/albums', {templateUrl: 'partials/albums.html', controller: 'AlbumsCtrl'}).
		when('/settings', {templateUrl: 'partials/settings.html', controller: 'SettingsCtrl'}).
		otherwise({redirectTo: '/home'});
	$compileProvider.urlSanitizationWhitelist(/^\s*(https?|spotify):/);
}]);

angular.module('swl').value('swlSettings',{
		lastFMapiKey:'00198b31b392d0750f88819830e49680'
});

angular.module('swl').run(['$rootScope','storeService','lsAdaptorService','rsService','remoteCheckService','linguaService','$log',
	function($rootScope,storeService,lsAdaptorService,rsService,remoteCheckService,linguaService,$log){
	"use strict";
	$log.info('swl.run');
	storeService.local = lsAdaptorService;
	storeService.remote = rsService;
	$rootScope._ = linguaService._;
    $rootScope._n = linguaService._n;
	if (remoteStorage.receiveToken()) {
		var token = remoteStorage.receiveToken();
		$log.log('back from oauth, got token ',token);
		storeService.local.setItem('RS.token',token);
	}
	if (storeService.local.getItem('RS.token')) {
		remoteCheckService.checkForData();
	}
}]);