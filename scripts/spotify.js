define(["jquery", "logger","util"], function($,L,Util){
	var artistAlbumsFindings = [];
	var shouldMemoize = true;
	// memoize calls
	var newsMem = {};
	var aaMem = {};
	var userCountry = 'SE';
	
	function lookupNews(artist,callback,i,ignoreReleaseList) {
		if (shouldMemoize && newsMem[artist]) { 
			//L.log('spotify memoize hit for '+artist);			
				callback(newsMem[artist],i,ignoreReleaseList);
		} else {
			$.ajax({
				url: 'http://ws.spotify.com/search/1/album.json?q=tag:new%20AND%20artist:%22'+artist.replace(/&/g,'%26')+'%22',
				dataType: 'json',
				success: function(data) {
					hln(data,artist,callback,i,ignoreReleaseList);
				},
				error: function(jXHR, textStatus, errorThrown) {
					handleError(jXHR, textStatus, errorThrown);				
				}
			});
		}
	}
	
	function hln(data,artist,callback,i,ignoreReleaseList) {
		var findings = [];
		if (data.info.num_results > 0) {
			for (j = 0; j < data.albums.length; j++) {
				if (data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase() &&
					checkAvail(data.albums[j].availability.territories) &&
					!Util.shouldIgnore(ignoreReleaseList,data.albums[j].href)) {
					findings.push({
						'artist':data.albums[j].artists[0].name,
						'album':data.albums[j].name,
						'href':data.albums[j].href
					});
				}
			}
		}
		if (shouldMemoize) {
			newsMem[artist] = findings;
		}
		if (callback) {
			callback(findings,i);
		}
	}
	
	function lookupArtistAlbums(artist, album, callback, i) {
		if (shouldMemoize && aaMem[artist+'_'+album]) { 
			//L.log('spotify memoize hit for '+artist+'_'+album);
			callback(aaMem[artist+'_'+album],artist,album,i);
		} else {
			$.ajax({
				url: 'http://ws.spotify.com/search/1/album.json?q='+album.replace(/&/g,'%26')+'%20AND%20artist:%22'+artist.replace(/&/g,'%26')+'%22',
				dataType: 'json',
				success: function(data) {
					hlaa(data, artist,album, callback, i);
				},
				error: function(jXHR, textStatus, errorThrown) {
					handleError(jXHR, textStatus, errorThrown);				
				}
			});
		}
	}
	
	function hlaa(data,artist,album,callback,i) {
		var findings = [];
		if (data.info.num_results > 0) {
			for (j = 0; j < data.albums.length; j++) {	
				if (data.albums[j].artists[0].name.toLowerCase() == artist.toLowerCase()
					&& checkAvail(data.albums[j].availability.territories) 					
					) {					
					findings.push({
						'artist':data.albums[j].artists[0].name,
						'album':data.albums[j].name,
						'href':data.albums[j].href
					});
				}
			}
		}
		if (shouldMemoize) {
			aaMem[artist+'_'+album] = findings;
		}
		if (callback) {
			callback(findings,artist,album,i);
		}
	}
	
	function lookupArtist(uri, callback) {
		$.ajax({
			url: 'http://ws.spotify.com/lookup/1/.json?uri='+uri,
			dataType: 'json',
			success: function(data) {
				hla(data,callback);
			},
			error: function(jXHR, textStatus, errorThrown) {
				handleError(jXHR, textStatus, errorThrown);				
			}
		});
	}
	
	function hla(data,callback) {
		L.log(data);
		if (data.artist) {
			callback(data.artist.name);
		}
		else if (data.album) {
			callback(data.album.artist, data.album.name);
		}
	}	
	
	function checkAvail(cs) {
		return cs.indexOf(userCountry) >= 0 || cs == 'worldwide';
	}	
	
	function handleError(jXHR, textStatus, errorThrown) {			
		L.log("Error calling spotify, status: " + jXHR.status + " textstatus: " + textStatus);
	}	
	
	return {
		userCountry:userCountry,
		shouldMemoize:shouldMemoize,
		lookupNews:lookupNews,
		lookupArtistAlbums:lookupArtistAlbums,
		lookupArtist:lookupArtist
	}
});