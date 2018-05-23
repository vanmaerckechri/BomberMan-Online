let socket = io.connect(window.location.host);

let updatePlayerPosition = function()
{
	let sendPlayerPos = function()
	{
		let gameInfos = sessionStorage.getItem('gameInfos');
		gameInfos = JSON.parse(gameInfos);
		let order = gameInfos[3];
		socket.emit('sendPlayerPos', { posX: players[playerIndex].posX, posY: players[playerIndex].posY, avatar: players[playerIndex].color, order: playerIndex });
	}

	socket.on('updateOtherPlayerPos', function(otherPlayerInfos)
	{
		console.log(otherPlayerInfos);
		players[otherPlayerInfos.order].color = otherPlayerInfos.avatar;
		players[otherPlayerInfos.order].posX = otherPlayerInfos.posX;
		players[otherPlayerInfos.order].posY = otherPlayerInfos.posY;
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
		players.push(Object.create(player));
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
