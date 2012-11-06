// http://stackoverflow.com/questions/8458561/interacting-with-require-js-modules-from-the-firebug-chrome-console?rq=1
"use strict";
require.config({
    urlArgs: "bust=" + (new Date()).getTime()
});

require(["jquery", "app"], function($,app) {

	$(document).ready(function() {
		app.init();
	});
});
