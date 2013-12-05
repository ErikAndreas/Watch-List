angular.module('swl').directive("dropFileZone", ['$rootScope', '$log',
  function ($rootScope, $log) {
    "use strict";

    function dragEnter(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    function dragOver(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      //console.log(evt);
    }

    function drop(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      $log.log(evt);
    }

    return {
      restrict: 'A',
      link: function (scope, element) {
        element.bind('dragenter', function (evt) {
          dragEnter(evt, element);
        });
        element.bind('dragover', dragOver);
        element.bind('drop', function (evt) {
          drop(evt, element);
          var files = evt.dataTransfer.files; // FileList object.
          var f = files[0];
          if (f) {
            $log.log('filename', f.name);
            var r = new FileReader();
            r.onload = function (e) {
              var contents = e.target.result;
              //$('#impta').val(contents);
              $log.log('contents', contents);
              $rootScope.$broadcast('dropFileEvent', contents);
            };
            r.onerror = function (e) {
              $log.log(e);
            };
            r.readAsText(f); // takes optional 2nd param encoding
          }
        });
      }
    };
  }
]);

angular.module('swl').directive("dropFromSpotify", ['$rootScope',
  function ($rootScope) {
    "use strict";

    function dragEnter(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    function dragOver(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      //console.log(evt);
    }

    function drop(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      //console.log(evt);
    }

    return {
      restrict: 'A',
      link: function (scope, element) {
        element.bind('dragenter', function (evt) {
          dragEnter(evt, element);
        });
        element.bind('dragover', dragOver);
        element.bind('drop', function (evt) {
          drop(evt, element);
          //console.log(evt.dataTransfer.getData('text'));
          $rootScope.$broadcast('dropFromSpotifyEvent', evt.dataTransfer.getData('text'));
        });
      }
    };
  }
]);

angular.module('swl').directive("dragToFile", ['watchListService', '$log',
  function (watchListService, $log) {
    "use strict";
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.bind('click', function () {
          element[0].focus();
          element[0].select();
        });
        element.bind('dragstart', function (evt) {
          $log.log('dragstart', element.val());
          var d = watchListService.dformat();
          // see http://ecmanaut.blogspot.se/2006/07/encoding-decoding-utf8-in-javascript.html
          //evt.dataTransfer.setData("DownloadURL", "text/plain; charset=UTF-8:WatchList.backup."+d+".txt:data:image/png;base64," + btoa(element.val()));
          evt.dataTransfer.setData("DownloadURL", "text/plain; charset=UTF-8:WatchList.backup." + d + ".txt:data:image/png;base64," + btoa(window.unescape(encodeURIComponent(element.val()))));
        });
      }
    };
  }
]);
