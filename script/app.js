var App = {
	getLastFMUser:function() {
		var u = Store.local.getItem('WL-lastfmuser');
		if (u) {
			LastFM.userName = u;
		}
		return u;
	},
	setLastFMUser:function(un) {
		Store.local.setItem('WL-lastfmuser',un);
		LastFM.userName = un;
		App.lastFMSuggestions();
	},
	addNews:function(a) {
		if (WL.containsNews(a)) {
			UI.showError('Skipping, already got "'+a+'" in list');
		} else if (a.length > 0 ) {
			L.log('app add news', a);
			WL.addNews({"artist": a, "added": Util.dformat()});
			UI.showInfo('"'+a+'" added to Watchlist');
			App.renderNews();
		} else {
			UI.showError('Please supply an Artist');
		}
	},
	addArtistAlbum:function(ar,al) {
		if (WL.containsArtistAlbum(ar,al)) {
			UI.showError('Skipping, already got "'+ar+' - '+al+'" in list');
		} else if (ar.length > 0 && al.length > 0) {
			WL.addArtistAlbum({"artist": ar, "album": al, "added": Util.dformat()});
			UI.showInfo('"'+ar+' - '+al+'" added to Watchlist');
			App.renderArtistAlbums();
		} else {
			UI.showError('Please supply Artist and Album');
		}
	},
	rmNews:function(i) {
		L.log('app rm', i);
		WL.removeNews(i);
		UI.showInfo('News removed');
		App.renderNews();
	},
	rmArtistAlbum:function(i) {
		L.log('app rm', i);
		WL.removeArtistAlbum(i);
		UI.showInfo('Artist album removed');
		App.renderArtistAlbums();
	},	
	importData:function() {
		var o = $('#impta').val();
		try {
			o = JSON.parse(o);
			WL.data = o;
			WL.saveData();
			App.renderNews();
			App.renderArtistAlbums();
			$('#impC').hide('fast');
		} catch (err) {
			UI.showError(err.message);
		}
	},
	init:function() {
		L.log('init');
		Store.local = LocalStoreAdaptor;
		Store.remote = RS;
		Spotify.userCountry = 'SE';
		if (Store.local.getItem(UI.CURRTAB_KEY)) {
			UI.setCurrTab(localStorage.getItem(UI.CURRTAB_KEY));
		} else {
			L.log('defaulting ui to overview');
			UI.setCurrTab('tab4');
		}
		// check for local data, if none bootstrap it
		var d = WL.getData();
		L.log(WL.data);
		// bind UI components
		UI.bind();
		// check for token passed from remoteStorage login callback
		/*if (null != remoteStorage.receiveToken()) {
			var token = remoteStorage.receiveToken();
			localStorage.setItem('RS.token',token);
			RS.token = token;
			RS.isConnected = true;
		}*/
		// check localStorage for saved remoteStorage token
		if (null != localStorage.getItem('RS.token')) {
			RS.token = localStorage.getItem('RS.token');
			RS.isConnected = true;
		}
		// check for remote data
		if (RS.isConnected) {
			App.checkRemote();
			$('#connectedState').attr('src','img/connect-icon.png');
		}
		//TODO: only render curr tab
		App.renderNews();
		App.renderArtistAlbums();
		if (App.getLastFMUser()) {
			App.lastFMSuggestions();
		}
	},
	lastFMSuggestions:function(){
		// TODO: break-out to UI
		LastFM.newsMerged(function(findings){
			$('#findingsLastFM').html('<h3>Watch List suggestions</h3>');
			$('#findingsLastFMOnSpotify').html('<h3>New stuff you might like on Spotify</h3>');
			for (var i = 0; i < findings.length; i++) {
				$('#findingsLastFM').append('<div id="lfmw'+i+'" onmouseout="$(\'#cp'+i+'\').toggle();" onmouseover="$(\'#cp'+i+'\').toggle();"  class="captionWrapper"><img style="width:0px;height:0px;" id="lastFMCover'+i+'"/></div>');
				$('#lastFMCover'+i).attr('src',findings[i].image);
				Spotify.lookupArtistAlbums(findings[i].artist,findings[i].album,i,function(j,sfindings,artist,album){
					if (sfindings.length > 0) {
						$('#findingsLastFMOnSpotify').append($('#lfmw'+j));
						$('#lfmw'+j).append('<div style="display:none" id="cp'+j+'" class="captionDesc"><p id="lfmtxt'+j+'" class="descCon">' + artist + ' - ' + album + '</p></div>');
						$('#lastFMCover'+j).wrap('<a href="'+sfindings[0].href+'">');
						$('#lastFMCover'+j).css('width','128px');
						$('#lastFMCover'+j).css('height','128px');
					} else {					
						$('#lfmw'+j).append('<div style="display:none" id="cp'+j+'" class="captionDesc"><p id="lfmtxt'+j+'" class="descCon">' + artist + ' - ' + album + '</p></div>');
						$('#lfmtxt'+j).append('<br/><a style="color:white;font-size:11px;" href="#" onclick="App.addArtistAlbum(\''+artist+'\',\''+album+'\');return false;"><strong>+</strong>Add to Watchlist</a>');
						$('#lastFMCover'+j).css('width','128px');
						$('#lastFMCover'+j).css('height','128px');
					}
				});							
			}
		});
	},
	renderNews:function(){
		var d = WL.getData();
		// render UI data if any, loop data: call lookup w render callback passing in findings: S.lookupN(wl.getnews.i, rendernews(s.newsfindings))
		UI.renderNews(d.news);
		for (var i = 0; i < d.news.length; i++) {
			Spotify.lookupNews(d.news[i].artist,i,UI.renderNewsFindings);
		}
	},
	renderArtistAlbums:function(){
		var d = WL.getData();
		// render UI data if any, loop data: call lookup w render callback passing in findings: S.lookupN(wl.getnews.i, rendernews(s.newsfindings))
		UI.renderArtistAlbums(d.artistAlbums);
		for (var i = 0; i < d.artistAlbums.length; i++) {
			Spotify.lookupArtistAlbums(d.artistAlbums[i].artist,d.artistAlbums[i].album,i,UI.renderArtistAlbumsFindings);
		}
	},
	checkRemote:function() {
		UI.dispLoggedin();
		$('#syncLink').html('You are connected');
		// we might have remote data, check for it
		WL.getRemote(RS.userAddress, function(data){
			if (data) {
				data = JSON.parse(data);
				L.log('remote data',data,'date');
				// compare remote updatedAt w local d.updatedAt - if remote newer update local
				var remoteD = Date.parse(data.updatedAt);
				L.log('remote date',data.updatedAt,remoteD);
				var localD = Date.parse(WL.getData().updatedAt);
				if (isNaN(localD)) localD = 0;
				L.log('local date',localD);
				if (remoteD > localD) {
					L.log('remote newer, updating');
					WL.data = data;
					WL.data.updatedAt = data.updatedAt;
					Store.local.setItem('WL-data',JSON.stringify(WL.data));
					//TODO: only render curr tab
					App.renderNews();
					App.renderArtistAlbums();
				}	
			}
		});
	},
	resetLocalData:function() {
		Store.local.remove('WL-data');
		Store.local.remove('WL-lastfmuser');
		Store.local.remove('RS.token');
		Store.local.remove('RS.userAddress');
		Store.local.remove('WL-CURRTABKEY');
		WL.clear();
		App.init();
	}
	
};
