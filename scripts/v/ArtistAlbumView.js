"use strict";
define(["logger","lastfm"],function(L,LastFM) {
	
	function renderArtistAlbums(o){
		$('#findingsAA').html('');
		$('#outAA').html('');
		var out = '';
		if (o && o.length > 0) out += ('<table class="listTable"><tr><th>Status</th><th>Artist</th><th>Album</th><th>Added</th><th>Delete</th></tr>');
		for (var i = 0; o && i < o.length; i++) {
			out += ('<tr><td id="aals'+i+'"><img src="img/error.gif"/></td><td id="aai'+i+'">'+o[i].artist + '</td><td>'+o[i].album + '</td><td>' + o[i].added + '</td><td><a href="javascript:void(0)" onclick="window.location.hash=\'aa/rm/'+i+'\';"><img src="img/trash.png"/></a></td></tr>');
		}
		if (o && o.length > 0) out += ('</table>');
		$('#outAA').html(out);
	}
	
	function renderArtistAlbumsFindings(findings, artist,album, i){
		if (findings.length > 0) {
			$('#aals'+i).html('<img src="img/spotify.png"/>');
			for (var j = 0; j < findings.length; j++) {
				$('#findingsAA').append('<div class="captionWrapper"><a href="'+findings[j].href+'"><img style="width:128px;height:128px" id="aaCover'+findings[j].href.split(':')[2]+'"/><div class="captionDesc"><p class="descCon">' + findings[j].artist + ' - ' + findings[j].album + '</p></div></a></div>');
				LastFM.albumCover(findings[j].artist,findings[j].album,findings[j].href.split(':')[2],function(img,ref) {
					if (!img || img.toString().substring(0,4) != 'http') img = 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_album_medium.png';
					$('#aaCover'+ref).attr('src',img);
				}); 
			}
		}
	}
	
	return {
		renderArtistAlbums:renderArtistAlbums,
		renderArtistAlbumsFindings:renderArtistAlbumsFindings
	}
})