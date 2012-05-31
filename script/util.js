var Util = {
	dformat:function(date) {
		if (!date) date = new Date();
		var dd = date.getDate();
		var mm = date.getMonth() + 1;
		var yyyy = date.getFullYear();
		if (dd < 10) {dd = '0' + dd}
		if (mm < 10) {mm = '0' + mm}
		return yyyy + '-' + mm + '-' + dd;
	}	
};