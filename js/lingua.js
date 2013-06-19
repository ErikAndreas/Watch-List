/**
 depends on jed.js (i18n)
 depends on python/pybabel/jinja2 for xgettext equivalent extractions
 babel.cfg:
[javascript:*.js]
encoding = utf-8

[jinja2: *.html]
encoding = utf-8

 usage: >pybabel extract -F babel.cfg -k _n:1,2 -k _ -o messages.pot . partials js

 >npm install -g po2json
 and per locale:
 >po2json translations/sv-se.po l_sv-se.json
 */


angular.module('lingua',[]);

angular.module('lingua').factory('linguaService',function() {
    var linguaService = {
        _:function(singular, vars) {
            return i18n.translate(singular).fetch(vars);
        },
        _n:function(singular, plural,n, vars) {
            if (n) {
                return i18n.translate(singular).ifPlural(n, plural).fetch(n);
            } else {
                return i18n.translate(singular).fetch(vars);
            }
        }
    };
    return linguaService;
});

angular.module('lingua').controller('linguaController',['$scope', '$window',function LoginCtrl($scope,$window) {
    $scope.changeLocale = function(locale) {
        // so, only way to reload $locale is on full page reload
        // and load angular-locale_xx-yy.js
        localStorage.setItem('locale',locale);
        $window.location.reload();
    };
}]);