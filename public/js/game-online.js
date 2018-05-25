let gameInfos = sessionStorage.getItem('gameInfos');

let sharePlayerInfos = function()
{
	let order = gameInfos.order;
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

// LANCEMENT DE LA PARTIE!

let loadUI = function()
{
	let uiDiv = document.querySelector('.ui');
	for (let i = 0, pplInGame = gameInfos.userNames.length; i < pplInGame; i++)
	{
		let playerNumber = i + 1;
		let avatarImg = (gameInfos.avatars[i]) + 1;
		let avatar = '<img src="assets/img/avatar'+avatarImg+'.png" alt="">';
		uiDiv.innerHTML += '<div class="uiPlayer uiPlayer'+playerNumber+'">'+avatar+'<div class="uiPlayerInfos"><p><b>Player'+playerNumber+':</b> '+gameInfos.userNames[i]+'</p><p><b>Score: </b>'+gameInfos.scores[i]+'</p></div></div>';

	}
}

let initGame = function()
{
	gameInfos = JSON.parse(gameInfos);
	playerIndex = gameInfos.playerIndex;
	// Afficher les joueurs à leurs positions initiales avec le bon avatar.
	for (let i = 0, pplInGame = gameInfos.userNames.length; i < pplInGame; i++)
	{
		// Cloner l'objet player.
		playerTemp = JSON.parse(JSON.stringify(player));
		// Ajouter ce dernier dans l'array players.
		players.push(playerTemp);
		// Lier les avatars aux joueurs.
		players[i].color = avatars[gameInfos.avatars[i]];
		// Mettre à jour ce nouvel objet avec les coordonnées initiales de position des joueurs.
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
	setInterval(sharePlayerInfos, 40);
}

socket.on('initGame', function()
{
	initGame();
});

socket.emit('authGameInfo', gameInfos);
