"use strict";
define(["v/StartView","m/store","lastfm","logger","spotify","ui"],function(startView, Store, LastFM,L,Spotify,UI) {
	
	function getLastFMUser() {
		var u = Store.local.getItem('WL-lastfmuser');
		return u;
	}
	
	function setLastFMUser(un) {
		Store.local.setItem('WL-lastfmuser',un);
		window.location.hash = '';
	}
	
	function lastFMSuggestions(u) {		
		LastFM.newsMerged(u,startView.renderLastFMFindings);
	}
	
	function start() {
		L.log('controller start');
		UI.setCurrTab('tab4');
		var u = getLastFMUser();
		if (u) {
			startView.setLastFMUN(u);
			lastFMSuggestions(u);
		}
	}
	
	function dropFromSpotify(data) {
		Spotify.lookupArtist(data,function(artist,album){
			if (album) {
				L.log('drop add artist album ' + artist + ' - ' + album);
				window.location.hash = 'aa/add/'+artist+'/'+album;
			} else {				
				L.log('drop add artist news ' + artist);
				window.location.hash = 'news/add/'+artist
			}
		});
	}
	
	return {
		start:start,
		setLastFMUser:setLastFMUser,
		dropFromSpotify:dropFromSpotify
	}
});