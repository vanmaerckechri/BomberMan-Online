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
		console.log(otherPlayerInfos);
		players[otherPlayerInfos.order] = otherPlayerInfos.playerInfos;
	});


	document.addEventListener("keydown", sendPlayerPos, false);

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
