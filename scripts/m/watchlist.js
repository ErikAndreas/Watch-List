define(["logger", "m/store"],function(L, Store) {
	// this data is backed by local Store
	var data = {
		news:[],
		artistAlbums:[],
		ignoreReleaseList:[],
		updatedAt:{}
	};
	var remoteKey = '';
	var tSync = {};
	
	function clear() {
		data.news = [];
		data.artistAlbums = [];
		data.ignoreAlbumList = [];
		data.updatedAt = {};
		remoteKey = '';
	}
	
	function getData(){
		var d = Store.local.getItem('WL-data');
		if (d) {
			data = JSON.parse(d);
		}
		return data;
	}
	function addNews(n){
		L.log('wl add news',n);
		getData().news.push(n);
		saveData();
	}
	
	function addIgnoreRelease(artistRelease) {
		if (!getData().ignoreReleaseList) {
			L.log('no ignoreList prop, creating it!');
			data['ignoreReleaseList'] = [];
		}
		L.log(data);
		var alreadyin = false;
		for (var i = 0; i < data.ignoreReleaseList.length; i++) {
			if (data.ignoreReleaseList[i].toLowerCase() == artistRelease)
				alreadyin = true;
		}
		if (!alreadyin) {
			data.ignoreReleaseList.push(artistRelease);
			saveData();
		} else {
			L.log('silently ignoring adding duplicate to ignoreRelaseList ');
		}
	}
	
	function clearIgnoreReleaseList() {
		L.log('clearing ignore release list');
		getData().ignoreReleaseList = [];
		saveData();
	}
	
	function containsNews(a) {
		var n = getData().news;
		for (var i = 0; i < n.length; i++) {
			if (a.toLowerCase() == n[i].artist.toLowerCase())
				return true;
		}
		return false;
	}
	
	function containsArtistAlbum(ar,al) {
		var n = getData().artistAlbums;
		for (var i = 0; i < n.length; i++) {
			if (ar.toLowerCase() == n[i].artist.toLowerCase() && al.toLowerCase() == n[i].album.toLowerCase())
				return true;
		}
		return false;
	}
	
	function addArtistAlbum(n){
		L.log('wl add artist album',n);
		getData().artistAlbums.push(n);
		saveData();
	}
	
	function removeNews(i) {
		var d = getData().news.splice(i,1);
		saveData();
	}
	
	function removeArtistAlbum(i) {
		var d = getData().artistAlbums.splice(i,1);
		saveData();
	}
	
	function saveData() {
		// var d = getData(); // imply re-read from store
		var d = data;
		d.updatedAt = new Date(); // FIXME? (utc)
		L.log('saving local', d);
		Store.local.setItem('WL-data',JSON.stringify(d));
		// settimeout call setRemote
		L.log('save data w remoteKey ' + remoteKey);
		if (remoteKey && '' != remoteKey) {
			tSync = window.setTimeout(function(){setRemote();}, 5000);
		}
	}
	
	// remote is stored as string, callback need to parse to json
	function getRemote(callback) {
		Store.remote.getItem(remoteKey,callback);
	}
	
	function setRemote(callback) {
		Store.remote.setItem(remoteKey,JSON.stringify(getData()),function(){
			L.log('remote updated');
			var d = getData();
			//d.updatedAt = date;
			Store.local.setItem('WL-data',JSON.stringify(d));
			if (callback) callback();
		});
	}
	
	function setRemoteKey(k) {
		remoteKey = k;
	}
	
	return {
		setRemoteKey:setRemoteKey,
		clear:clear,
		getData:getData,
		addNews:addNews,
		containsNews:containsNews,
		addIgnoreRelease:addIgnoreRelease,
		addArtistAlbum:addArtistAlbum,
		removeNews:removeNews,
		removeArtistAlbum:removeArtistAlbum,
		containsArtistAlbum:containsArtistAlbum,
		getRemote:getRemote,
		setRemote:setRemote,
		clearIgnoreReleaseList:clearIgnoreReleaseList
	}	
})