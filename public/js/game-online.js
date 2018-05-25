let gameInfos = sessionStorage.getItem('gameInfos');
let drawOtherPlayer = function()
{
	let order = gameInfos[3];
	socket.emit('sendPlayerPos', { playerInfos: players[playerIndex], order: playerIndex });
}

socket.on('updateOtherPlayerPos', function(otherPlayerInfos)
{
	players[otherPlayerInfos.order].posX = otherPlayerInfos.playerInfos.posX;
	players[otherPlayerInfos.order].posY = otherPlayerInfos.playerInfos.posY;
});

socket.on('updateBombFromOtherPl', function(bombInfos)
{
	dropBombs(bombInfos.playerIndex, bombInfos.playerPosRow, bombInfos.playerPosCol);
});

let initGamePlayers = function(avatarsAndNames)
{
	let avatarsList = avatarsAndNames.avatars;
	let namesList = avatarsAndNames.names;
	gameInfos = JSON.parse(gameInfos);
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
	engine();
	// 25 images/sec pour le déplacement des autres joueurs.
	setInterval(drawOtherPlayer, 40);
}

socket.on('launchInitGame', function(avatarsAndNames)
{
	initGamePlayers(avatarsAndNames);
});

socket.emit('authGameInfo', gameInfos);
