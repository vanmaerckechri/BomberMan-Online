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
	players[otherPlayerInfos.order].animationX = otherPlayerInfos.playerInfos.animationX;
	players[otherPlayerInfos.order].animationXIndex = otherPlayerInfos.playerInfos.animationXIndex;
	players[otherPlayerInfos.order].animationY = otherPlayerInfos.playerInfos.animationY;
	players[otherPlayerInfos.order].alive = otherPlayerInfos.playerInfos.alive;
	players[otherPlayerInfos.order].bombsNumberMax = otherPlayerInfos.playerInfos.bombsNumberMax;
	players[otherPlayerInfos.order].bombsNumber = otherPlayerInfos.playerInfos.bombsNumber;
	players[otherPlayerInfos.order].explosionLenghtMax = otherPlayerInfos.playerInfos.explosionLenghtMax;


});

socket.on('updateBombFromOtherPl', function(bombInfos)
{
	dropBombs(bombInfos.playerIndex, bombInfos.playerPosRow, bombInfos.playerPosCol);
});

socket.on('callNextRound', function(scores)
{
	gameInfos.scores = scores;
	sessionStorage.setItem("gameInfos", JSON.stringify(gameInfos));

	let form = document.createElement("form");
	form.setAttribute("method", "POST");
	form.setAttribute("action", "game");
	document.body.appendChild(form);
	form.submit();
});

// Bombes.
socket.on('exploseBomb', function(bombIndex)
{
	if (bombsInGame[bombIndex])
	{
		let bomb = 	bombsInGame[bombIndex];
		let bombPosX = bomb.posCol * tileSize;
		let bombPosY = bomb.posRow * tileSize;
	   	bomb.status = 2;
	   	bomb.cycle = 0;
	    mapBoards[bomb.posRow][bomb.posCol].wall = 0;
		if (playerIndex == bomb.fromPlayer)
		{    				
			players[bomb.fromPlayer].bombsNumber++;
		}			
		exploseBomb(bomb, bombPosX, bombPosY);
	}
});
socket.on('endExplosion', function(bombIndex)
{
	if (bombsInGame[bombIndex])
	{
		let bomb = 	bombsInGame[bombIndex];
		bomb.status = 5;
		bomb.cycle = 5;
	}
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
		let playerImg = new Image();
		//playerImg.src = 'assets/img/player_'+avatars[gameInfos.avatars[i]]+'.png';
		playerImg.src = 'assets/img/player.png';
		players[i].color = playerImg;
		// Mettre à jour ce nouvel objet avec les coordonnées initiales de position des joueurs.
		switch(i)
		{
		    case 0:
		        players[0].posX = tileSize;
		        players[0].posY = tileSize;
		        break;
		    case 1:
		        players[1].posX = (tileNumberByCol * tileSize) - (2 * tileSize);
		        players[1].posY = (tileNumberByRow * tileSize) - (2 * tileSize);
		        break;
		    case 2:
		        players[2].posX = (tileNumberByCol * tileSize) - (2 * tileSize);
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
	// 40 pour 25 images/sec pour le déplacement des autres joueurs.
	// 17 pour 60 images/sec...
	setInterval(sharePlayerInfos, 16);
}

socket.on('initGame', function()
{
	initGame();
});

socket.emit('authGameInfo', gameInfos);