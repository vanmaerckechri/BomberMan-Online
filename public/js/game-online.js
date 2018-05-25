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

let loadUI = function()
{
	let uiDiv = document.querySelector('.ui');
	for (let i = 0, pplInGame = gameInfos[4]; i < pplInGame; i++)
	{
		let playerNumber = i + 1;
		let avatarImg = (gameInfos[6][i]) + 1;
		let avatar = '<img src="assets/img/avatar'+avatarImg+'.png" alt="">';
		uiDiv.innerHTML += '<div class="player player'+playerNumber+'">'+avatar+'Player'+playerNumber+': '+gameInfos[5][i]+'</div>';
	}
}

let initGamePlayers = function(avatarsAndNames)
{
	let avatarsList = avatarsAndNames.avatars;
	let namesList = avatarsAndNames.names;
	gameInfos = JSON.parse(gameInfos);
	gameInfos.push(namesList);
	gameInfos.push(avatarsList);
	playerIndex = gameInfos[3];
	for (let i = 0, pplInGame = gameInfos[4]; i < pplInGame; i++)
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
	loadUI();
	engine();
	// 25 images/sec pour le déplacement des autres joueurs.
	setInterval(drawOtherPlayer, 40);
}

socket.on('launchInitGame', function(avatarsAndNames)
{
	initGamePlayers(avatarsAndNames);
});

socket.emit('authGameInfo', gameInfos);
