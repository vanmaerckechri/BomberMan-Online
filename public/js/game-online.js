window.addEventListener('load', function(){

	let socket = io.connect(window.location.host);


	let authGameInfo = function()
	{
		let gameInfos = sessionStorage.getItem('gameInfos');
		socket.emit('authGameInfo', gameInfos);
		sessionStorage.clear();
	}

	let test = function()
	{
		socket.emit('test');
	}

	socket.on('test', function(users)
	{
		console.log(users)
	});
	authGameInfo();
	test();

	/*socket.on('sendPlayerIndex', function(playerIndex)
	{
		console.log(playerIndex);
	});*/

});