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

// wrapper for http://parse.com as a key/value store
var ParseAdaptor = {
	appId: Settings.parse.appId,
	restApiKey: Settings.parse.restApiKey,
	entries:{},
	getItem:function(key,callback) {
		$.ajax({ 
			url: 'https://api.parse.com/1/classes/WatchList?where={"key":"'+key+'"}',
			headers: {'X-Parse-Application-Id':this.appId,'X-Parse-REST-API-Key':this.restApiKey},
			contentType:'application/json',
			dataType: "json",
			success: function(data){
				L.log('get',data);
				if (data.results[0]) {
					ParseAdaptor.entries[key] = data.results[0].objectId;
					L.log('entries set',ParseAdaptor.entries);
					callback(data.results[0].value,data.results[0].updatedAt);
				} else { // no data
					callback();
				}
				
			}
		});
	},
	// setItem(string key, string val, function callback(createdAt|updatedAt))
	setItem:function(key,val,callback) {		
		if (this.entries[key]) {
			$.ajax({
				url: 'https://api.parse.com/1/classes/WatchList/'+this.entries[key],
				headers: {'X-Parse-Application-Id':this.appId,'X-Parse-REST-API-Key':this.restApiKey},
				contentType:'application/json',
				dataType: "json",
				type: "PUT",
				data: JSON.stringify({"key": key,"value": val}),
				success: function(data){
					L.log('update',data)
					if (callback) callback(data.updatedAt);
				}
			});
		} else {
			this.getItem(key, function(oldVal) {
				if (oldVal) {
					// we now know about entry, retry doin update
					if (callback) ParseAdaptor.setItem(key,val,callback);
					else ParseAdaptor.setItem(key,val);
				} else {
					// not in store, do insert
					$.ajax({
						url: 'https://api.parse.com/1/classes/WatchList',
						headers: {'X-Parse-Application-Id':ParseAdaptor.appId,'X-Parse-REST-API-Key':ParseAdaptor.restApiKey},
						contentType:'application/json',
						dataType: "json",
						type: "POST",
						data: JSON.stringify({"key": key,"value": val}),
						success: function(data){
							L.log('insert',data)
							if (callback) callback(data.createdAt);
						}
					});
				}
			});	
		}
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
			window.location = remoteStorage.createOAuthAddress(storageInfo, [RS.category], window.location.href);
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