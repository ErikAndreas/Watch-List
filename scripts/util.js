define(["logger"],function(L) {

	function dformat(date) {
		if (!date) date = new Date();
		var dd = date.getDate();
		var mm = date.getMonth() + 1;
		var yyyy = date.getFullYear();
		if (dd < 10) {dd = '0' + dd}
		if (mm < 10) {mm = '0' + mm}
		return yyyy + '-' + mm + '-' + dd;
	}	
	
	function shouldIgnore(ignoreReleaseList,href) {
		for (i = 0; ignoreReleaseList && i < ignoreReleaseList.length; i++) {
			if (href && ignoreReleaseList[i].toLowerCase() == href.toLowerCase()) {
				L.log('ignoring release ' + href);
				return true;
			}
		}
		return false;
	}
	
	return {
		dformat:dformat,
		shouldIgnore:shouldIgnore
	}
})