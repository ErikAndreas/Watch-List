/**
	TODO: extract all direct call to window.location.* to UI helper 
*/

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
		
		WL.setRemoteKey(Store.local.getItem('RS.userAddress'));
		L.log('init wl remote key ' + Store.local.getItem('RS.userAddress'));
		
		// check for remote data
		settingsController.checkRemote();
		L.log('isconnected ' + RS.isConnected);
		if (RS.isConnected) UI.setConnected();
		
		window.addEventListener('message', function(event) {
			if (event.origin == location.protocol +'//'+ location.host) {
				console.log('Received an OAuth token: ' + event.data);
				Store.local.setItem('RS.token',event.data);
				RS.token = event.data;
				RS.isConnected = true;
				window.location.hash = 'settings/checkremote';
				$('#connectedState').attr('src','img/connect-icon.png');
			}
		}, false);
	}
	
	return {
		init:init
	}
});