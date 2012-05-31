var UI = {
	CURRTAB_KEY:"WL-CURRTABKEY",
	bind:function() {
		$('#artistNews').bind("keypress", function (e) {
			if (e.keyCode==13) {
				App.addNews(this.value);
				return false;
			}
		});
		$('#addANBtn').bind("click", function (e) {
			App.addNews($('#artistNews').val());
			return false;
		});
		$('#addAABtn').bind("click", function (e) {
			App.addArtistAlbum($('#artist').val(),$('#album').val());
			return false;
		});
		$('#artist').bind("keypress", function (e) {
			if (e.keyCode==13) {
				App.addArtistAlbum($('#artist').val(),$('#album').val());
				return false;
			}
		});
		$('#album').bind("keypress", function (e) {
			if (e.keyCode==13) {
				App.addArtistAlbum($('#artist').val(),$('#album').val());
				return false;
			}
		});
		$('#impLink').bind("click", function (e) {
			$('#impC').toggle('fast');
			return false;
		});
		$('#impta').bind('dragover', function (e) {
			e.originalEvent.stopPropagation();
			e.originalEvent.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = 'copy';
		});
		$('#impta').bind('drop', function(e) {
			console.log('drop');
			e.originalEvent.stopPropagation();
			e.originalEvent.preventDefault();
			var files = e.originalEvent.dataTransfer.files; // FileList object.
			var f=files[0];
			if (f) {
				console.log(f.name);
				var r = new FileReader();
				r.onload = function(e) {
					var contents = e.target.result;
					$('#impta').val(contents);
				}
				r.onerror = function(e) {
					console.log(e);
				}
				r.readAsText(f);
			}
		});
		$('#impBtn').click(function (e) {
			App.importData();
		});	
		$('#expLink').bind("click", function (e) {
			$('#expC').toggle('fast');
			$('#expta').html(JSON.stringify(WL.getData()));
			return false;
		});
		$('#expta').bind("click", function (e) {
			$('#expta').focus();$('#expta').select();
		});
		// downloadurl type to allow for drop on desktop (local file system) only works in chrome, spotify uses chromium...
		$('#expta').bind("dragstart", function (e) {
			console.log(e.originalEvent.dataTransfer); // our event is wrapped... 
			e.originalEvent.dataTransfer.setData("DownloadURL", "text/plain:dragged.txt:data:image/png;base64," + btoa($('#expta').val()));
		});
		$('#loginBtn').bind("click", function (e) {
			localStorage.setItem('RS.userAddress',$('#email').val());
			$('#loginC').hide('fast');
			RS.connect();
			return false;
		});
		$('#syncLink').bind("click", function (e) {
			$('#loginC').show('fast');
			return false;
		});
		$('#cancelLoginBtn').bind("click", function (e) {
			$('#loginC').hide('fast');
			return false;
		});
		$('#lastfmusername').bind("keypress", function (e) {
			if (e.keyCode==13) {
				App.setLastFMUser($('#lastfmusername').val());
				return false;
			}
		});
		$('#lastfmBtn').bind("click", function (e) {
			App.setLastFMUser($('#lastfmusername').val());
			return false;
		});
		$('#resetLink').bind("click", function (e) {
			$('#resetC').toggle('fast');
			return false;
		});
		$('#resetBtn').bind("click", function (e) {
			App.resetLocalData();
			return false;
		});
		$('#m1').bind("click", function (e) {
			UI.setCurrTab('tab4');
			return false;
		});
		$('#m2').bind("click", function (e) {
			UI.setCurrTab('tab1');
			return false;
		});
		$('#m3').bind("click", function (e) {
			UI.setCurrTab('tab2');
			return false;
		});
		$('#m4').bind("click", function (e) {
			UI.setCurrTab('tab3');
			return false;
		});
		if (App.getLastFMUser()) {
			$('#lastfmusername').val(App.getLastFMUser());
		}
		$('#dropZone').bind('dragover', function (e) {
			e.originalEvent.stopPropagation();
			e.originalEvent.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = 'copy';
		});
		$('#dropZone').bind('drop', function (e) {
			console.log('drop');
			e.originalEvent.stopPropagation();
			e.originalEvent.preventDefault();
			console.log(e.originalEvent.dataTransfer.getData('text'));
			Spotify.lookupArtist(e.originalEvent.dataTransfer.getData('text'),function(artist,album){
				if (album)
					App.addArtistAlbum(artist,album);
				else 
					App.addNews(artist);
			});
		});
	},
	renderNews:function(o) {
		$('#findings').html('');
		$('#out').html('');
		var out = '';
		if (o && o.length > 0) out += ('<table class="listTable"><tr><th>Status</th><th>Artist</th><th>Added</th><th>Delete</th></tr>');
		for (i = 0; o && i < o.length; i++) {
			out += ('<tr><td id="nls'+i+'"><img src="img/error.gif"/></td><td id="ni'+i+'">'+o[i].artist + '</td><td>' + o[i].added + '</td><td><a href="#" onclick="App.rmNews('+i+');return false;"><img src="img/trash.png"/></a></td></tr>');
		}
		if (o && o.length > 0) out += ('</table>');
		$('#out').html(out);
	},
	renderNewsFindings:function(i,findings){
		if (findings.length > 0) {
			$('#nls'+i).html('<img src="img/spotify.png"/>');
			for (var j = 0; j < findings.length; j++) {
				$('#findings').append('<div class="captionWrapper"><a href="'+findings[j].href+'"><img style="width:128px;height:128px" id="newsCover'+findings[j].href.split(':')[2]+'"/><div class="captionDesc"><p class="descCon">' + findings[j].artist + ' - ' + findings[j].album + '</p></div></a></div>');
				/*var al = Spotify.m.Album.fromURI(findings[j].href,function(a){
					$('#newsCover'+a.data.uri.split(':')[2]).attr('src',a.data.cover);
				});*/
				LastFM.albumCover(findings[j].artist,findings[j].album,findings[j].href.split(':')[2],function(img,ref) {
					$('#newsCover'+ref).attr('src',img);
				});
			}
		}
	}, 
	renderArtistAlbums:function(o) {
		$('#findingsAA').html('');
		$('#outAA').html('');
		var out = '';
		if (o && o.length > 0) out += ('<table class="listTable"><tr><th>Status</th><th>Artist</th><th>Album</th><th>Added</th><th>Delete</th></tr>');
		for (i = 0; o && i < o.length; i++) {
			out += ('<tr><td id="aals'+i+'"><img src="img/error.gif"/></td><td id="aai'+i+'">'+o[i].artist + '</td><td>'+o[i].album + '</td><td>' + o[i].added + '</td><td><a href="#" onclick="App.rmArtistAlbum('+i+');return false;"><img src="img/trash.png"/></a></td></tr>');
		}
		if (o && o.length > 0) out += ('</table>');
		$('#outAA').html(out);
	},
	renderArtistAlbumsFindings:function(i,findings){
		if (findings.length > 0) {
			$('#aals'+i).html('<img src="img/spotify.png"/>');
			for (var j = 0; j < findings.length; j++) {
				$('#findingsAA').append('<div class="captionWrapper"><a href="'+findings[j].href+'"><img style="width:128px;height:128px" id="aaCover'+findings[j].href.split(':')[2]+'"/><div class="captionDesc"><p class="descCon">' + findings[j].artist + ' - ' + findings[j].album + '</p></div></a></div>');
				/*var al = Spotify.m.Album.fromURI(findings[j].href,function(a){
					$('#aaCover'+a.data.uri.split(':')[2]).attr('src',a.data.cover);
				});*/
				LastFM.albumCover(findings[j].artist,findings[j].album,findings[j].href.split(':')[2],function(img,ref) {
					$('#aaCover'+ref).attr('src',img);
				}); 
			}
		}
	}, 	
	dispLoggedin:function(){L.log('logged in');},
	dispLogin:function(){L.log('no login');},
	showError:function(msg) {
		$('#statusMessage').html('Error: '+msg);
		$('#statusMessage').css('background-color','pink');
		$('#statusMessage').show('fast');
		setTimeout("$('#statusMessage').hide('fast')", 3000);
	},
	showInfo:function(msg) {
		$('#statusMessage').html(msg);
		$('#statusMessage').css('background-color','yellow');
		$('#statusMessage').show('fast');
		setTimeout("$('#statusMessage').hide('fast')", 3000);
	},
	setCurrTab:function(tab) {
		if ('tab1' == tab) {
			$('#newsTab').show();
			$('#albumsTab').hide();
			$('#settingsTab').hide();
			$('#welcomeTab').hide();
		} else if ('tab2' == tab) {
			$('#newsTab').hide();
			$('#albumsTab').show();
			$('#settingsTab').hide();
			$('#welcomeTab').hide();
		} else if ('tab3' == tab) {
			$('#newsTab').hide();
			$('#albumsTab').hide();
			$('#settingsTab').show();
			$('#welcomeTab').hide();
		} else if ('tab4' == tab) {
			$('#welcomeTab').show();
			$('#newsTab').hide();
			$('#albumsTab').hide();
			$('#settingsTab').hide();
		}
		Store.local.setItem(UI.CURRTAB_KEY, tab)
	}
};