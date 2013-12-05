/**
 depends on jed.js (i18n)
 depends on python/pybabel/jinja2 for xgettext equivalent extractions
 babel.cfg:
[javascript:*.js]
encoding = utf-8

[jinja2: *.html]
encoding = utf-8

 usage: >pybabel extract -F babel.cfg -k _n:1,2 -k _ -o messages.pot . partials js

using poedit the tabs for plural translations does not always appear, see https://drupal.org/node/17564

 >npm install -g po2json
 and per locale:
 >po2json translations/sv-se.po l_sv-se.json
 */
/*jshint -W098 */
var Lingua = {
  init: function (doc, cb) {
    "use strict";
    var locale = localStorage.getItem('locale');
    //console.log(locale);
    if (locale) {
      var s = doc.createElement('script');
      s.setAttribute('src', "//code.angularjs.org/1.1.5/i18n/angular-locale_" + locale + ".js");
      doc.body.appendChild(s);
    } else {
      locale = "en-us";
    }
    window.microAjax('l_' + locale + '.json', function (data) {
      /*jshint camelcase: false */
      data = JSON.parse(data);
      var i18n = new window.Jed({
        "domain": locale,
        "missing_key_callback": function (key) {
          window.console.error("Missing key " + key + " for " + locale);
        },
        locale_data: data
      });
      //console.log(i18n);
      window.i18n = i18n;
      cb();
    });
  }
};

angular.module('lingua', []);

angular.module('lingua').factory('linguaService', function () {
  "use strict";
  var linguaService = {
    _: function (singular, vars) {
      return window.i18n.translate(singular).fetch(vars);
    },
    _n: function (singular, plural, n, vars) {
      if (n) {
        return window.i18n.translate(singular).ifPlural(n, plural).fetch(n);
      } else {
        return window.i18n.translate(singular).fetch(vars);
      }
    }
  };
  return linguaService;
});

angular.module('lingua').controller('linguaController', ['$scope', '$window',
  function linguaController($scope, $window) {
    "use strict";
    $scope.changeLocale = function (locale) {
      // so, only way to reload $locale is on full page reload
      // and load angular-locale_xx-yy.js
      localStorage.setItem('locale', locale);
      $window.location.reload();
    };
  }
]);
