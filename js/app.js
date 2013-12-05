/*
on modules
http://sravi-kiran.blogspot.se/2013/02/ModulesInAngularJS.html
http://briantford.com/blog/huuuuuge-angular-apps.html
http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript
*/
angular.module('swl', ['spotify', 'lastfm', 'lingua', 'dropbox', 'ngRoute']);

angular.module('swl').config(['$routeProvider', '$compileProvider',
  function ($routeProvider, $compileProvider) {
    "use strict";
    $routeProvider.
    when('/home', {
      templateUrl: 'partials/home.html',
      controller: 'LastFMCtrl'
    }).
    when('/news', {
      templateUrl: 'partials/news.html',
      controller: 'NewsCtrl'
    }).
    when('/albums', {
      templateUrl: 'partials/albums.html',
      controller: 'AlbumsCtrl'
    }).
    when('/settings', {
      templateUrl: 'partials/settings.html',
      controller: 'SettingsCtrl'
    }).
    otherwise({
      redirectTo: '/home'
    });
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|spotify):/);
  }
]);

angular.module('swl').value('swlSettings', {
  lastFMapiKey: '00198b31b392d0750f88819830e49680'
});

angular.module('swl').run(['$rootScope', 'watchListService', 'linguaService', '$log', 'dropboxService',
  function ($rootScope, watchListService, linguaService, $log, dropboxService) {
    "use strict";
    $log.info('swl.run');
    $rootScope._ = linguaService._;
    $rootScope._n = linguaService._n;

    if (!localStorage.getItem('WL-data')) {
      localStorage.setItem('WL-data', angular.toJson(watchListService.data));
    }
    dropboxService.authenticate(function (err) {
      $log.log('fail', err);
    });
    $log.log(dropboxService.isAuth());
  }
]);
