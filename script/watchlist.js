var WL = {
	// this data is backed by local Store
	data:{
		news:[],
		artistAlbums:[],
		updatedAt:{}
	},
	remoteKey:'',
	tSync:{},
	clear:function() {
		WL.data.news = [];
		WL.data.artistAlbums = [];
		WL.data.updatedAt = {};
		WL.remoteKey = '';
	},
	getData:function(){
		var d = Store.local.getItem('WL-data');
		if (d) {
			WL.data = JSON.parse(d);
		}
		return WL.data;
	},
	addNews:function(n){
		L.log('wl add news',n);
		WL.getData().news.push(n);
		WL.saveData();
	},
	containsNews:function(a) {
		var n = WL.getData().news;
		for (var i = 0; i < n.length; i++) {
			if (a == n[i].artist)
				return true;
		}
		return false;
	},
	containsNews:function(a) {
		var n = WL.getData().news;
		for (var i = 0; i < n.length; i++) {
			if (a.toLowerCase() == n[i].artist.toLowerCase())
				return true;
		}
		return false;
	},
	containsArtistAlbum:function(ar,al) {
		var n = WL.getData().artistAlbums;
		for (var i = 0; i < n.length; i++) {
			if (ar.toLowerCase() == n[i].artist.toLowerCase() && al.toLowerCase() == n[i].album.toLowerCase())
				return true;
		}
		return false;
	},
	addArtistAlbum:function(n){
		L.log('wl add artist album',n);
		WL.getData().artistAlbums.push(n);
		WL.saveData();
	},	
	removeNews:function(i) {
		var d = WL.getData().news.splice(i,1);
		WL.saveData();
	},
	removeArtistAlbum:function(i) {
		var d = WL.getData().artistAlbums.splice(i,1);
		WL.saveData();
	},	
	saveData:function() {
		// var d = WL.getData(); // imply re-read from store
		var d = WL.data;
		d.updatedAt = new Date(); // FIXME? (utc)
		Store.local.setItem('WL-data',JSON.stringify(d));
		// settimeout call setRemote
		if ('' != WL.remoteKey) {
			WL.tSync = setTimeout('WL.setRemote(WL.remoteKey)', 5000);
		}
	},
	// remote is stored as string, callback need to parse to json
	getRemote:function(remoteKey,callback) {
		WL.remoteKey = remoteKey;
		Store.remote.getItem(remoteKey,callback);
	},
	setRemote:function(remoteKey,callback) {
		Store.remote.setItem(remoteKey,JSON.stringify(WL.getData()),function(){
			L.log('remote updated');
			var d = WL.getData();
			//d.updatedAt = date;
			Store.local.setItem('WL-data',JSON.stringify(d));
			if (callback) callback();
		});
	}
};