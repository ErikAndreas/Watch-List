var Spotify = {
	m:{},
	v:{},
	artistAlbumsFindings:[],
	shouldMemoize:true,
	// memoize calls
	newsMem:{},
	aaMem:{},
	userCountry:'SE',
	ignoreAlbumList:[{'artist':'Necro','album':'The Circle of Tyrants'}],
	lookupNews:function(artist,i,callback) {
		if (Spotify.shouldMemoize && Spotify.newsMem[artist]) { 
			L.log('spotify memoize hit for '+artist);
			callback(i, Spotify.newsMem[artist]);
		} else {
			$.ajax({
				url: 'http://ws.spotify.com/search/1/album.json?q=tag:new%20AND%20artist:%22'+artist.replace(/&/g,'%26')+'%22',
				dataType: 'json',
				success: function(data) {
					Spotify.hln(data,artist,i,callback);
				},
				error: function(jXHR, textStatus, errorThrown) {
					Spotify.handleError(jXHR, textStatus, errorThrown);				
				}
			});
		}
	},
	hln:function(data,artist,i,callback) {
		var findings = [];
		if (data.info.num_results > 0) {
			for (j = 0; j < data.albums.length; j++) {
				if (data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase() &&
					Spotify.checkAvail(data.albums[j].availability.territories) &&
					!Spotify.shouldIgnore(data.albums[j].artists[0].name, data.albums[j].name)) {
					findings.push({
						'artist':data.albums[j].artists[0].name,
						'album':data.albums[j].name,
						'href':data.albums[j].href
					});
				}
			}
		}
		if (Spotify.shouldMemoize) Spotify.newsMem[artist] = findings;
		if (callback)
			callback(i,findings);
	},
	lookupArtistAlbums:function(artist,album,i,callback) {
		if (Spotify.shouldMemoize && Spotify.aaMem[artist+'_'+album]) { 
			L.log('spotify memoize hit for '+artist+'_'+album);
			callback(i, Spotify.aaMem[artist+'_'+album],artist,album);
		} else {
			$.ajax({
				url: 'http://ws.spotify.com/search/1/album.json?q='+album.replace(/&/g,'%26')+'%20AND%20artist:%22'+artist.replace(/&/g,'%26')+'%22',
				dataType: 'json',
				success: function(data) {
					Spotify.hlaa(data, artist,album, i,callback);
				},
				error: function(jXHR, textStatus, errorThrown) {
					Spotify.handleError(jXHR, textStatus, errorThrown);				
				}
			});
		}
	},
	hlaa:function(data,artist,album,i,callback) {
		var findings = [];
		if (data.info.num_results > 0) {
			for (j = 0; j < data.albums.length; j++) {	
				if (data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase()
					//data.albums[j].name.toLowerCase() == album.toLowerCase() && 
					&& Spotify.checkAvail(data.albums[j].availability.territories) &&
					!Spotify.shouldIgnore(data.albums[j].artists[0].name, data.albums[j].name)
					) {					
					findings.push({
						'artist':data.albums[j].artists[0].name,
						'album':data.albums[j].name,
						'href':data.albums[j].href
					});
				}
			}
		}
		if (Spotify.shouldMemoize) Spotify.aaMem[artist+'_'+album] = findings;
		if (callback)
			callback(i,findings,artist,album);
	},
	lookupArtist:function(uri,callback) {
		$.ajax({
			url: 'http://ws.spotify.com/lookup/1/.json?uri='+uri,
			dataType: 'json',
			success: function(data) {
				Spotify.hla(data,callback);
			},
			error: function(jXHR, textStatus, errorThrown) {
				Spotify.handleError(jXHR, textStatus, errorThrown);				
			}
		});
	},
	hla:function(data,callback) {
		L.log(data);
		if (data.artist)
			callback(data.artist.name);
		else if (data.album) 
			callback(data.album.artist,data.album.name);
	},
	checkAvail:function(cs) {
		return cs.indexOf(Spotify.userCountry) >= 0 || cs == 'worldwide';
	},
	shouldIgnore:function(artist, album) {
		for (i = 0; Spotify.ignoreAlbumList && i < Spotify.ignoreAlbumList.length; i++) {
			if (Spotify.ignoreAlbumList[i].artist.toLowerCase() == artist.toLowerCase() && 
				Spotify.ignoreAlbumList[i].album.toLowerCase() == album.toLowerCase()) {
				L.log('ignoring ' + artist + ' - ' + album);
				return true;
			}
		}
		return false;
	},
	handleError:function(jXHR, textStatus, errorThrown) {			
		L.log("Error calling spotify, status: " + jXHR.status + " textstatus: " + textStatus);
	}	
};