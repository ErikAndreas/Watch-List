"use strict";
define(["logger","c/StartController","c/NewsArtistAlbumController","c/SettingsController","scripts/r/routie.js"],function(L,startController,newsArtistAlbumController,settingsController){
	
	function init() {
		routie({
			'': function() {
				L.log('routing to start');
				startController.start();
			},
			'setlastfmun/:un': function(un) {
				startController.setLastFMUser(un);
			},
			'dropFromSpotify/*': function(data) {
				startController.dropFromSpotify(data);
			},
			'news': function() {
				L.log('routing to news');
				newsArtistAlbumController.startNews();
			},
			'news/add/:artist': function(artist) {
				newsArtistAlbumController.addNews(artist);
			},
			'news/rm/:i': function(i) {
				L.log('routing to rm news');
				newsArtistAlbumController.rmNews(i);
			},
			'news/hide/:href':function(href) {
				newsArtistAlbumController.hide(href);
			},
			'news/clearhide':function() {
				newsArtistAlbumController.clearIgnoreReleaseList();
			},
			'albums': function() {
				L.log('routing to albums');
				newsArtistAlbumController.startArtistAlbums();
			},
			'aa/add/:artist/:album': function(artist,album) {
				newsArtistAlbumController.addArtistAlbum(artist,album);
			},
			'aa/rm/:i': function(i) {
				L.log('routing to rm aa');
				newsArtistAlbumController.rmArtistAlbum(i);
			},
			'settings':function() {
				settingsController.start();
			},
			'settings/import':function() {
				settingsController.importWL();
			},
			'settings/connect':function() {
				settingsController.connect();
			},
			'settings/checkremote':function() {
				settingsController.checkRemote();
			}
		});
	}
	
	function route(path) {
		routie(path);
	}

	return {
		init:init,
		route:route
	}
});