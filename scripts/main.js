require.config({
    urlArgs: "bust=" + (new Date()).getTime()
});

require(["jquery", "app"], function($,app) {

	$(document).ready(function() {
		app.init();
	});
});
