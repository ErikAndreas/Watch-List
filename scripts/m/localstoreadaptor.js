/* could use http://westcoastlogic.com/lawnchair */
define(function() {
	return {
		getItem:function(key) {
			return localStorage.getItem(key);
		},
		setItem:function(key, val) {
			localStorage.setItem(key, val);
		},
		remove:function(key) {
			localStorage.removeItem(key);
		}
	}
})