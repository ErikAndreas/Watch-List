define(["logger","lastfm","util"],function(L,LastFM,Util) {

	function renderNews(o) {
		$('#findings').html('');
		$('#out').html('');
		var out = '';
		if (o && o.length > 0) out += ('<table class="listTable"><tr><th>Status</th><th>Artist</th><th>Added</th><th>Delete</th></tr>');
		for (i = 0; o && i < o.length; i++) {
			out += ('<tr><td id="nls'+i+'"><img src="img/error.gif"/></td><td id="ni'+i+'">'+o[i].artist + '</td><td>' + o[i].added + '</td><td><a href="javascript:void(0)" onclick="window.location.hash=\'news/rm/'+i+'\';"><img src="img/trash.png"/></a></td></tr>');
		}
		if (o && o.length > 0) out += ('</table>');
		$('#out').html(out);
	}
	
	function renderNewsFindings(findings,i,ignoreReleaseList){
		if (findings.length > 0) {
			$('#nls'+i).html('<img src="img/spotify.png"/>');
			for (var j = 0; j < findings.length; j++) {
				if (!Util.shouldIgnore(ignoreReleaseList,findings[j].href)) {
					$('#findings').append('<div class="captionWrapper"><a href="'+findings[j].href+'"><img style="width:128px;height:128px" id="newsCover'+findings[j].href.split(':')[2]+'"/><div class="captionDesc"><p class="descCon">' + findings[j].artist + ' - ' + findings[j].album + ' <a href="javascript:void(0)" onclick="window.location.hash=\'news/hide/'+findings[j].href+'\';">hide</a></p></div></a></div>');
					LastFM.albumCover(findings[j].artist,findings[j].album,findings[j].href.split(':')[2],function(img,ref) {
						if (!img || img.toString().substring(0,4) != 'http') img = 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_album_medium.png';
						$('#newsCover'+ref).attr('src',img);
					});
				}
			}
		}
	}
	
	return {
		renderNews:renderNews,
		renderNewsFindings:renderNewsFindings
	}
})