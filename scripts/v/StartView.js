define(["jquery","spotify","logger",],function($,Spotify,L) {

	function renderLastFMFindings(findings){
		$('#findingsLastFM').html('<h3>Watch List suggestions</h3>');
		$('#findingsLastFMOnSpotify').html('<h3>New stuff you might like on Spotify</h3>');
		for (var i = 0; i < findings.length; i++) {
			$('#findingsLastFM').append('<div id="lfmw'+i+'" onmouseout="$(\'#cp'+i+'\').toggle();" onmouseover="$(\'#cp'+i+'\').toggle();"  class="captionWrapper"><img style="width:0px;height:0px;" id="lastFMCover'+i+'"/></div>');
			$('#lastFMCover'+i).attr('src',findings[i].image);
			Spotify.lookupArtistAlbums(findings[i].artist,findings[i].album,function(sfindings,artist,album,j){
				if (sfindings.length > 0) {
					$('#findingsLastFMOnSpotify').append($('#lfmw'+j));
					$('#lfmw'+j).append('<div style="display:none" id="cp'+j+'" class="captionDesc"><p id="lfmtxt'+j+'" class="descCon">' + artist + ' - ' + album + '</p></div>');
					$('#lastFMCover'+j).wrap('<a href="'+sfindings[0].href+'">');
					$('#lastFMCover'+j).css('width','128px');
					$('#lastFMCover'+j).css('height','128px');
				} else {					
					$('#lfmw'+j).append('<div style="display:none" id="cp'+j+'" class="captionDesc"><p id="lfmtxt'+j+'" class="descCon">' + artist + ' - ' + album + '</p></div>');
					$('#lfmtxt'+j).append('<br/><a style="color:white;font-size:11px;" href="javascript:void(0)" onclick="window.location.hash=\'aa/add/'+artist+'/'+album+'\';"><strong>+</strong>Add to Watchlist</a>');
					$('#lastFMCover'+j).css('width','128px');
					$('#lastFMCover'+j).css('height','128px');
				}
			},i);							
		}
	}
	
	function setLastFMUN(un) {
		$('#lastfmusername').val(un)
	}
	
	return {
		renderLastFMFindings:renderLastFMFindings,
		setLastFMUN:setLastFMUN
	}
});