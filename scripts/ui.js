define(["jquery","logger","m/store","m/watchlist","util"],function($,L,Store,WL,Util) {
	
	var CURRTAB_KEY="WL-CURRTABKEY";
	
	function showError(msg) {
		showError(msg, 3000);
	}
	
	function showError(msg, time) {
		$('#statusMessage').html('Error: '+msg);
		$('#statusMessage').css('background-color','pink');
		$('#statusMessage').show('fast');
		setTimeout("$('#statusMessage').hide('fast')", time);
	}	
	
	function showInfo(msg) {
		$('#statusMessage').html(msg);
		$('#statusMessage').css('background-color','yellow');
		$('#statusMessage').show('fast');
		setTimeout("$('#statusMessage').hide('fast')", 3000);
	}
	
	function bind() {
		L.log('ui binding');
		
		// start
		$('#lastfmusername').bind("keypress", function (e) {
			if (e.keyCode==13) {
				//startController.setLastFMUser($('#lastfmusername').val());
				//r.route('setlastfmun/'+$('#lastfmusername').val());
				window.location.hash = 'setlastfmun/'+$('#lastfmusername').val();
				return false;
			}
		});
		$('#lastfmBtn').bind("click", function (e) {
			//startController.setLastFMUser($('#lastfmusername').val());
			window.location.hash = 'setlastfmun/'+$('#lastfmusername').val();
			return false;
		});
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
			window.location.hash = 'dropFromSpotify/'+e.originalEvent.dataTransfer.getData('text');
		});
		
		// news 
		$('#artistNews').bind("keypress", function (e) {
			if (e.keyCode==13) {
				window.location.hash = 'news/add/'+(this.value);
				return false;
			}
		});
		$('#addANBtn').bind("click", function (e) {
			window.location.hash = 'news/add/'+$('#artistNews').val();
			return false;
		});
		
		// artist albums
		$('#addAABtn').bind("click", function (e) {
			window.location.hash = 'aa/add/'+$('#artist').val()+'/'+$('#album').val();
			return false;
		});
		$('#artist').bind("keypress", function (e) {
			if (e.keyCode==13) {
				window.location.hash = 'aa/add/'+$('#artist').val()+'/'+$('#album').val();
				return false;
			}
		});
		$('#album').bind("keypress", function (e) {
			if (e.keyCode==13) {
				window.location.hash = 'aa/add/'+$('#artist').val()+'/'+$('#album').val();
				return false;
			}
		});
		
		// settings
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
				r.readAsText(f); // takes optional 2nd param encoding
			}
		});
		$('#impBtn').click(function (e) {
			window.location.hash = 'settings/import';
		});	
		$('#expLink').bind("click", function (e) {
			$('#expC').toggle('fast');
			$('#expta').html(JSON.stringify(WL.getData()));
			return false;
		});
		$('#expta').bind("click", function (e) {
			$('#expta').focus();$('#expta').select();
		});
		// downloadurl type to allow for drop on desktop (local file system) only works in chrome
		$('#expta').bind("dragstart", function (e) {
			console.log(e.originalEvent.dataTransfer); // our event is wrapped... 
			e.originalEvent.dataTransfer.setData("DownloadURL", "text/plain; charset=UTF-8:WatchList.backup."+Util.dformat(new Date())+".txt:data:image/png;base64," + btoa($('#expta').val()));
		});
		$('#loginBtn').bind("click", function (e) {
			Store.local.setItem('RS.userAddress',$('#email').val());
			// call WL.setRemoteKey here too
			WL.setRemoteKey($('#email').val());
			$('#loginMsg').html('');
			$('#loginC').hide('fast');
			window.location.hash = 'settings/connect';
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
	}
	
	function setCurrTab(tab) {
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
		Store.local.setItem(CURRTAB_KEY, tab)
	}
	
	function setConnected() {
		$('#connectedState').attr('src','img/connect-icon.png');
		$('#syncLink').html('You are connected');
	}
	
	return {
		CURRTAB_KEY:CURRTAB_KEY,
		bind:bind,
		showInfo:showInfo,
		showError:showError,
		setCurrTab:setCurrTab,
		setConnected:setConnected
	}
})