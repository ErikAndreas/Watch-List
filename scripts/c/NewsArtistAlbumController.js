"use strict";
define(["logger","v/NewsView","m/watchlist","spotify","ui","util","v/ArtistAlbumView"],function(L,newsView,WL,Spotify,UI,Util,artistAlbumView) {
	
	function startNews() {
		UI.setCurrTab('tab1');
		renderNews();
	}
	
	function addNews(a) {
		if (WL.containsNews(a)) {
			UI.showError('Skipping, already got "'+a+'" in list');
			UI.clearNewsInput();
			window.location.hash = 'news';
		} else if (a.length > 0 ) {
			L.log('app add news', a);
			WL.addNews({"artist": a, "added": Util.dformat()});
			UI.clearNewsInput();
			UI.showInfo('"'+a+'" added to Watchlist');
			window.location.hash = 'news';
		} else {
			UI.showError('Please supply an Artist');
		}
	}
	
	function rmNews(i) {
		L.log('app rm', i);
		WL.removeNews(i);
		UI.showInfo('News removed');
		window.location.hash = 'news';
	}
	
	function hide(href) {
		L.log('hiding ' + href);
		WL.addIgnoreRelease(href);
		window.location.hash = 'news';
	}
	
	function clearIgnoreReleaseList() {
		WL.clearIgnoreReleaseList();
		window.location.hash = 'news';
	}
	
	// private
	function renderNews() {
		var d = WL.getData();
		newsView.renderNews(d.news);
		for (var i = 0; i < d.news.length; i++) {
			Spotify.lookupNews(d.news[i].artist,newsView.renderNewsFindings,i,WL.getData().ignoreReleaseList);
		}
	}
	
	// private
	function renderArtistAlbums(){
		var d = WL.getData();
		artistAlbumView.renderArtistAlbums(d.artistAlbums);
		for (var i = 0; i < d.artistAlbums.length; i++) {
			Spotify.lookupArtistAlbums(d.artistAlbums[i].artist,d.artistAlbums[i].album,artistAlbumView.renderArtistAlbumsFindings,i);
		}
	}
	
	function startArtistAlbums() {
		UI.setCurrTab('tab2');
		renderArtistAlbums();
	}
	
	function addArtistAlbum(ar,al) {
		if (WL.containsArtistAlbum(ar,al)) {
			UI.showError('Skipping, already got "'+ar+' - '+al+'" in list');
			UI.clearAAInput();
			window.location.hash = 'albums';
		} else if (ar.length > 0 && al.length > 0) {
			WL.addArtistAlbum({"artist": ar, "album": al, "added": Util.dformat()});
			UI.clearAAInput();
			UI.showInfo('"'+ar+' - '+al+'" added to Watchlist');
			window.location.hash = 'albums';
		} else {
			UI.showError('Please supply Artist and Album');
		}
	}
	
	function rmArtistAlbum(i) {
		L.log('app rm', i);
		WL.removeArtistAlbum(i);
		UI.showInfo('Artist album removed');
		window.location.hash = 'albums';
	}
	
	return {
		startNews:startNews,
		addNews:addNews,
		rmNews:rmNews,
		hide:hide,
		clearIgnoreReleaseList:clearIgnoreReleaseList,
		startArtistAlbums:startArtistAlbums,
		addArtistAlbum:addArtistAlbum,
		rmArtistAlbum:rmArtistAlbum
	}
})