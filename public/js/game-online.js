window.addEventListener('load', function(){

	let socket = io.connect(window.location.host);


	let initGame = function()
	{
		let gameInfos = sessionStorage.getItem('gameInfos');
		socket.emit('authGameInfo', gameInfos);
		// Avatar.
		gameInfos = JSON.parse(gameInfos)
		players[0].color = avatars[gameInfos[3]];
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

	initGame();

});