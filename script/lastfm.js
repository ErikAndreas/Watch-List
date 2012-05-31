var LastFM =  {
	userName:'',
	shouldMemoize:false,
	mem:{},
	/*newReleases:function(userrecs,callback) {
		if (!userrecs) userrecs = 0;
		if (LastFM.shouldMemoize && LastFM.mem['']) { 
			callback(LastFM.mem['']);
		} else {
			$.ajax({
				url: 'http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs='+userrecs+'&user='+LastFM.userName+'&api_key='+Settings.lastfm.apiKey,
				dataType: 'json',
				success: function(data) {
					LastFM.h(data,callback);
				},
				error: function(jXHR, textStatus, errorThrown) {
					LastFM.handleError(jXHR, textStatus, errorThrown);				
				}
			});
		}
	},
	h:function(data,callback) {
		var findings = [];
		if (data.albums.album && data.albums.album.length > 0) {
			for (var i = 0; i < data.albums.album.length; i++) {
				findings.push({'artist':data.albums.album[i].artist.name,'album':data.albums.album[i].name});
			}
			//L.log(findings);
		}
		if (LastFM.shouldMemoize) LastFM.mem[''] = findings;
		if (callback) callback(findings);
	},*/
	newsMerged:function(callback) {
		var a1 = $.ajax({
				url: 'http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=1&user='+LastFM.userName+'&api_key='+Settings.lastfm.apiKey,
				dataType: 'json'				
			});
		var a2 = $.ajax({
				url: 'http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=0&user='+LastFM.userName+'&api_key='+Settings.lastfm.apiKey,
				dataType: 'json'				
			});
		$.when(a1, a2).done(function(r1, r2){
			LastFM.hm(r1,r2,callback);
		});
		a1.fail(LastFM.handleError);
		a2.fail(LastFM.handleError);
	},
	hm:function(r1,r2,callback) {
		L.log(r1,r2);
		var findings = [];
		for (var i = 0; i < r1[0].albums.album.length; i++) {
			findings.push({'artist':r1[0].albums.album[i].artist.name,'album':r1[0].albums.album[i].name,'image':r1[0].albums.album[i].image[2]['#text']});
		}
		for (var i = 0; i < r2[0].albums.album.length; i++) {
			findings.push({'artist':r2[0].albums.album[i].artist.name,'album':r2[0].albums.album[i].name,'image':r2[0].albums.album[i].image[2]['#text']});
		}
		L.log(findings);
		if (callback) callback(findings);
	},
	albumCover:function(artist, album, ref, callback) {
		$.ajax({
			url: 'http://ws.audioscrobbler.com/2.0/?method=album.getInfo&format=json&artist='+artist.replace(/&/g,'%26')+'&album='+album.replace(/&/g,'%26')
+'&api_key='+Settings.lastfm.apiKey,
			dataType: 'json',
			success: function(data) {
				LastFM.hC(data,ref,callback);
			},
			error: function(jXHR, textStatus, errorThrown) {
				LastFM.handleError(jXHR, textStatus, errorThrown);				
			}
		});
	},
	hC:function(data,ref,callback) {
		var img = {};
		if (data.album && data.album.image[2]["#text"].length > 0) {
			img = data.album.image[2]["#text"];
		}
		if (callback) callback(img,ref);
	},
	handleError:function(jXHR, textStatus, errorThrown) {			
		L.log("Error calling last.fm, status: " + jXHR.status + " textstatus: " + textStatus);
	}
};