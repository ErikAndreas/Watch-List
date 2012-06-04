$(document).ready(function() {
	App.init();
});

window.addEventListener('message', function(event) {
	if (event.origin == location.protocol +'//'+ location.host) {
		console.log('Received an OAuth token: ' + event.data);
		localStorage.setItem('RS.token',event.data);
		RS.token = event.data;
		RS.isConnected = true;
		App.checkRemote();
		$('#connectedState').attr('src','img/connect-icon.png');
	}
}, false);

var L = window.console;
//var L = {log:function(){}};