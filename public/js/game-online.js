window.addEventListener('load', function(){

	let socket = io.connect(window.location.host);

	let initGame = function()
	{
		let gameInfos = sessionStorage.getItem('gameInfos');
		socket.emit('authGameInfo', gameInfos);
		gameInfos = JSON.parse(gameInfos)
		// Players.
		for (let i = 0; i < gameInfos[4]; i++)
		{
			players.push(player);
		}
		// Avatar.
		players[0].color = avatars[gameInfos[2]];
		// Positions.
		switch(gameInfos[3])
		{
		    case 0:
		        players[0].posX = tileSize;
		        players[0].posY = tileSize;
		        break;
		    case 1:
		        players[1].posX = (tileNumberByRow * tileSize) - (2 * tileSize);
		        players[1].posY = (tileNumberByRow * tileSize) - (2 * tileSize);
		        break;
		    case 2:
		        players[2].posX = (tileNumberByRow * tileSize) - (2 * tileSize);
		        players[2].posY = tileSize;
		        break;
		    case 3:
		        players[3].posX = tileSize;
		        players[3].posY = (tileNumberByRow * tileSize) - (2 * tileSize);
		        break;
		} 
	}

	let sendPlayerPos = function()
	{
		let gameInfos = sessionStorage.getItem('gameInfos');
		gameInfos = JSON.parse(gameInfos);
		let order = gameInfos[3];
		socket.emit('sendPlayerPos', { posX: players[0].posX, posY: players[0].posY, avatar: players[0].color, order: order });
	}

	socket.on('updateOtherPlayerPos', function(otherPlayerInfos)
	{
		console.log(otherPlayerInfos);
		players[otherPlayerInfos.order].color = otherPlayerInfos.avatar;
		players[otherPlayerInfos.order].posX = otherPlayerInfos.posX;
		players[otherPlayerInfos.order].posY = otherPlayerInfos.posY;
	});

	initGame();

	document.addEventListener("keydown", sendPlayerPos, false);

});