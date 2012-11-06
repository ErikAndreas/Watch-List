/**
	TODO: extract all direct call to window.location.* to UI helper 
*/
"use strict";
define(["logger", "m/store","m/localstoreadaptor","m/rs","r/router","spotify","ui","c/SettingsController","m/watchlist"], 
	function(L,Store,LocalStoreAdaptor,RS, Router, Spotify, UI,settingsController,WL) {	

	function init() {
		L.log('init start');
		Store.local = LocalStoreAdaptor;
		Store.remote = RS;
		Spotify.userCountry = 'SE';
		UI.bind();
		if (Store.local.getItem(UI.CURRTAB_KEY)) {
			UI.setCurrTab(Store.local.getItem(UI.CURRTAB_KEY));
		} else {
			L.log('defaulting ui to overview');
			UI.setCurrTab('tab4');
		}
		Router.init();

		// we might be back on index after oauth redirect
		if (RS.getToken()) {
			var token = RS.getToken();
			Store.local.setItem('RS.token',token);
	        RS.token = token;
	        RS.isConnected = true;
	        window.location.hash = 'settings/checkremote';
	        $('#connectedState').attr('src','img/connect-icon.png');
		}
		
		WL.setRemoteKey(Store.local.getItem('RS.userAddress'));
		L.log('init wl remote key ' + Store.local.getItem('RS.userAddress'));
		
		// check for remote data
		settingsController.checkRemote();
		L.log('isconnected ' + RS.isConnected);
		if (RS.isConnected) UI.setConnected();		
	}
	
	return {
		init:init
	}
});