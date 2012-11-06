// RemoteStorage 
// depends on remoteStorage.js and uses localStorage
// TODO: consider minor refactoring from http://tutorial.unhosted.5apps.com/js/tutorial.js
"use strict";
define(["m/store","logger","scripts/m/remoteStorage.js"],function(Store,L) {

	var category = 'music';
	var token = Store.local.getItem('RS.token');
	var isConnected = false;
	
	function connect() {
		// popup will be null if prevented by browser
		//var popup = window.open('');
		remoteStorage.getStorageInfo(Store.local.getItem('RS.userAddress'), function(err, storageInfo) {
			if (!err) {
				// save storageInfo obj
				Store.local.setItem('RS.userStorageInfo', JSON.stringify(storageInfo));
				L.log('pathname ' + location.pathname.substring(0,location.pathname.lastIndexOf('/')));
				//var redirectUri = location.protocol + '//' + location.host + location.pathname.substring(0,location.pathname.lastIndexOf('/')) + '/receiveToken.html';
				var redirectUri = location.protocol + '//' + location.host + location.pathname.substring(0,location.pathname.lastIndexOf('/')) + '';
				L.log('will open ' + redirectUri + ' for oauth dance');
				var oauthPage = remoteStorage.createOAuthAddress(storageInfo, [category+':rw'], redirectUri);
				//popup = window.open(oauthPage);
				//popup.location.href = oauthPage;
				location.href = oauthPage;
			} else {
				//popup.close();
				$('#loginC').show('fast');
				$('#loginMsg').html('Login failed, try again ('+err+')').show();
				console.log(err);
			}
		});
	}
	
	function getItem(key, callback) {
		if (!token) token = Store.local.getItem('RS.token');
		L.log('tryin remote get for ' + key + ' using token ' + token);
		var storageInfo = JSON.parse(Store.local.getItem('RS.userStorageInfo'));
		if (storageInfo) {
			var client = remoteStorage.createClient(storageInfo,category+'/SWL', token);
			// TODO: check err == 401 -> session expired, if (err) -> path not found, data == undefined -> no data on path
			client.get(key, function(err, data) { 
				callback(data,err);
			});
		} else {
			callback(null,'no storageInfo, connect again');
		}
	}
	
	function setItem(key, value, callback) {
		if (!token) token = Store.local.getItem('RS.token');
		L.log('tryin remote set for ' + key + ' using token ' + token);
		var storageInfo = JSON.parse(Store.local.getItem('RS.userStorageInfo'));
		var client = remoteStorage.createClient(storageInfo, category+'/SWL', token);
		// TODO: check err == 401 -> session expired, if (err) -> path not found, data == undefined -> no data on path
		client.put(key, value, function(err) { 
			callback(err);
		});		
	}

	function getToken() {
		return remoteStorage.receiveToken();
	}
	
	return {
		isConnected:isConnected,
		connect:connect,
		getItem:getItem,
		setItem:setItem,
		getToken:getToken
	}
})