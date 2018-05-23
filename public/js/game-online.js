window.addEventListener('load', function(){

	let socket = io.connect(window.location.host);


	let authGameInfo = function()
	{
		let gameInfos = sessionStorage.getItem('gameInfos');
		socket.emit('authGameInfo', gameInfos);
		sessionStorage.clear();
	}

	authGameInfo();

	/*socket.on('sendPlayerIndex', function(playerIndex)
	{
		console.log(playerIndex);
	});*/

});