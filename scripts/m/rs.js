// RemoteStorage 
// depends on remoteStorage.js and uses localStorage
define(["m/store","logger","scripts/m/remoteStorage.js"],function(Store,L) {

	var category = 'music';
	var token = Store.local.getItem('RS.token');
	var isConnected = false;
	
	function connect() {
		// popup will be null if prevented by browser
		var popup = window.open('');
		remoteStorage.getStorageInfo(Store.local.getItem('RS.userAddress'), function(err, storageInfo) {
			if (!err) {
				//window.location = remoteStorage.createOAuthAddress(storageInfo, [RS.category], window.location.href);
				L.log('pathname ' + location.pathname.substring(0,location.pathname.lastIndexOf('/')));
				var redirectUri = location.protocol + '//' + location.host + location.pathname.substring(0,location.pathname.lastIndexOf('/')) + '/receiveToken.html';
				L.log('will open ' + redirectUri + ' for oauth dance');
				var oauthPage = remoteStorage.createOAuthAddress(storageInfo, [category+':rw'], redirectUri);
				//var popup = window.open(oauthPage);
				popup.location.href = oauthPage;
			} else {
				popup.close();
				$('#loginC').show('fast');
				$('#loginMsg').html('Login failed, try again ('+err+')').show();
				console.log(err);
			}
		});
	}
	
	function getItem(key, callback) {
		if (!token) token = Store.local.getItem('RS.token');
		L.log('tryin remote get for ' + key + ' using token ' + token);
		remoteStorage.getStorageInfo(Store.local.getItem('RS.userAddress'), function(err, storageInfo) {
			var client = remoteStorage.createClient(storageInfo,category+'/SWL', token);
			client.get(key, function(err, data) { 
				callback(data);
			});
		});
	}
	
	function setItem(key, value, callback) {
		if (!token) token = Store.local.getItem('RS.token');
		L.log('tryin remote set for ' + key + ' using token ' + token);
		remoteStorage.getStorageInfo(Store.local.getItem('RS.userAddress'), function(err, storageInfo) {
			var client = remoteStorage.createClient(storageInfo, category+'/SWL', token);
			client.put(key, value, function(err) { 
				callback(err);
			});
		});
	}
	
	return {
		isConnected:isConnected,
		connect:connect,
		getItem:getItem,
		setItem:setItem
	}
})