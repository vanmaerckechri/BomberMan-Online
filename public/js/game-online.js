let socket = io.connect(window.location.host);

let updatePlayerPosition = function()
{
	let sendPlayerPos = function()
	{
		let gameInfos = sessionStorage.getItem('gameInfos');
		gameInfos = JSON.parse(gameInfos);
		let order = gameInfos[3];
		socket.emit('sendPlayerPos', { playerInfos: players[playerIndex], order: playerIndex });
	}

	socket.on('updateOtherPlayerPos', function(otherPlayerInfos)
	{
		players[otherPlayerInfos.order].posX = otherPlayerInfos.playerInfos.posX;
		players[otherPlayerInfos.order].posY = otherPlayerInfos.playerInfos.posY;
		players[otherPlayerInfos.order].topPressed = otherPlayerInfos.playerInfos.topPressed;
		players[otherPlayerInfos.order].rightPressed = otherPlayerInfos.playerInfos.rightPressed;
		players[otherPlayerInfos.order].bottomPressed = otherPlayerInfos.playerInfos.bottomPressed;
		players[otherPlayerInfos.order].leftPressed = otherPlayerInfos.playerInfos.leftPressed;
		players[otherPlayerInfos.order].spacePressed = otherPlayerInfos.playerInfos.spacePressed;
		players[otherPlayerInfos.order].spaceStopPressed = otherPlayerInfos.playerInfos.spaceStopPressed;
		players[otherPlayerInfos.order].moving = otherPlayerInfos.playerInfos.moving;
		players[otherPlayerInfos.order].bombsNumberMax = otherPlayerInfos.playerInfos.bombsNumberMax;
		players[otherPlayerInfos.order].bombsNumber = otherPlayerInfos.playerInfos.bombsNumber;
	});


	document.addEventListener("keydown", sendPlayerPos, false);
	document.addEventListener("keyup", sendPlayerPos, false);
}

let initGamePlayers = function(avatarsList)
{
	let gameInfos = sessionStorage.getItem('gameInfos');
	gameInfos = JSON.parse(gameInfos)
	playerIndex = gameInfos[3];
	for (let i = 0; i < gameInfos[4]; i++)
	{
		// Cloner l'objet player.
		playerTemp = JSON.parse(JSON.stringify(player));
		// Ajouter ce dernier dans l'array players.
		players.push(playerTemp);
		// Mettre à jour ce nouvel objet.
		players[i].color = avatars[avatarsList[i]];
		switch(i)
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
	console.log(players);
	updatePlayerPosition();
}

socket.on('launchInitGame', function(avatarsList)
{
	initGamePlayers(avatarsList);
});

	let gameInfos = sessionStorage.getItem('gameInfos');
	socket.emit('authGameInfo', gameInfos);
