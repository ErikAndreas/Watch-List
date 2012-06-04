var Store = {
	local:{},
	remote:{}
};
/* could use http://westcoastlogic.com/lawnchair */
var LocalStoreAdaptor = {
	getItem:function(key) {
		return localStorage.getItem(key);
	},
	setItem:function(key, val) {
		localStorage.setItem(key, val);
	},
	remove:function(key) {
		localStorage.removeItem(key);
	}
};

// RemoteStorage 
// depends on remoteStorage.js and uses localStorage
var RS = {
	category:'music',
	userAddress:localStorage.getItem('RS.userAddress'),
	token:localStorage.getItem('RS.token'),
	isConnected:false,
	connect:function() {
		RS.userAddress = localStorage.getItem('RS.userAddress');
		remoteStorage.getStorageInfo(RS.userAddress, function(err, storageInfo) {
			if (!err) {
				window.location = remoteStorage.createOAuthAddress(storageInfo, [RS.category], window.location.href);
			} else {
				$('#loginC').show('fast');
				$('#loginMsg').html('Login failed, try again ('+err+')').show();
				console.log(err);
			}
		});
	},
	getItem:function(key, callback) {
		remoteStorage.getStorageInfo(RS.userAddress, function(err, storageInfo) {
			var client = remoteStorage.createClient(storageInfo, RS.category, RS.token);
			client.get(key, function(err, data) { 
				callback(data);
			});
		});
	},
	setItem:function(key, value, callback) {
		remoteStorage.getStorageInfo(RS.userAddress, function(err, storageInfo) {
			var client = remoteStorage.createClient(storageInfo, RS.category, RS.token);
			client.put(key, value, function(err) { 
				callback(err);
			});
		});
	}
};