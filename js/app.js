/*
on modules
http://sravi-kiran.blogspot.se/2013/02/ModulesInAngularJS.html
http://briantford.com/blog/huuuuuge-angular-apps.html
http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript
*/

// ngRoute should be injected for 1.2
angular.module('swl', ['spotify','lastfm','lingua','dropbox']);

angular.module('swl').config(['$routeProvider','$compileProvider',function($routeProvider,$compileProvider) {
    "use strict";
    $routeProvider.
        when('/home', {templateUrl: 'partials/home.html',   controller: 'LastFMCtrl'}).
        when('/news', {templateUrl: 'partials/news.html', controller: 'NewsCtrl'}).
        when('/albums', {templateUrl: 'partials/albums.html', controller: 'AlbumsCtrl'}).
        when('/settings', {templateUrl: 'partials/settings.html', controller: 'SettingsCtrl'}).
        otherwise({redirectTo: '/home'});
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|spotify):/);
    // is aHrefSanitizationWhitelist in 1.2
}]);

angular.module('swl').value('swlSettings',{
        lastFMapiKey:'00198b31b392d0750f88819830e49680'
});

angular.module('swl').run(['$rootScope','watchListService','linguaService','$log','dropboxService',
    function($rootScope,watchListService,linguaService,$log,dropboxService){
    "use strict";
    $log.info('swl.run');
    $rootScope._ = linguaService._;
    $rootScope._n = linguaService._n;

    if (!localStorage.getItem('WL-data')) {
        localStorage.setItem('WL-data',angular.toJson(watchListService.data));
    }
    dropboxService.authenticate(function(err) {
        console.log('fail',err);
    });
    console.log(dropboxService.isAuth());
}]);