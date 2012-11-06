"use strict";
define(["logger","ui","m/watchlist","m/rs","m/store"],function(L,UI,WL,RS,Store) {
	
	function start() {
		UI.setCurrTab('tab3');
	}
	
	function importWL() {
		var o = $('#impta').val();
		try {
			o = JSON.parse(o);
			WL.data = o;
			WL.saveData();
			$('#impC').hide('fast');
			window.location.hash = 'settings'
		} catch (err) {
			UI.showError(err.message);
		}
	}
	
	function connect() {
		RS.connect();
		window.location.hash = 'settings'
	}
	
	function checkRemote() {
		//UI.dispLoggedin();
		//$('#syncLink').html('You are connected');
		// we might have remote data, check for it
		// check err == 401 -> session expired, if (err) -> path not found, data == undefined -> no data on path
		WL.getRemote(function(data,err){
			if (401 == err) {
				UI.showError('Session expired, connect again: ' + err);
			} else if (err) {
				UI.showError('Path not found ' + err);
			} else {
				if (data) {
					data = JSON.parse(data);
					L.log('remote data',data);
					// compare remote updatedAt w local d.updatedAt - if remote newer update local
					var remoteD = Date.parse(data.updatedAt);
					L.log('remote date',data.updatedAt,remoteD);
					var localD = Date.parse(WL.getData().updatedAt);
					if (isNaN(localD)) localD = 0;
					L.log('local date',localD);
					RS.isConnected = true;
					UI.setConnected();
					if (remoteD > localD) {
						L.log('remote newer, updating');
						WL.data = data;
						WL.data.updatedAt = data.updatedAt;
						Store.local.setItem('WL-data',JSON.stringify(WL.data));
						// update ui with new data; reload
						window.location.reload();
					}	
				} else {
					UI.showInfo('No data available');
				}
			}
		});
	}
	
	return {
		start:start,
		importWL:importWL,
		connect:connect,
		checkRemote:checkRemote
	}
})