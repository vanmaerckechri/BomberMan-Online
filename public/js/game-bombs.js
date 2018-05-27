let bombsInGame = [];
let bombImg = new Image();
bombImg.src = 'assets/img/bomb.svg';
let fireImg = new Image();
fireImg.src = 'assets/img/fire.svg';

function exploseBomb(bomb, bombPosX, bombPosY)
{
	let returnUseless = drawExplosion(bombPosX, bombPosY, bomb, 2, 2);
	//drawExplosion(bombPosX - tileSize / 2, bombPosY - tileSize / 2, bomb);
	let explosionLenght = 1;
	let explosionLenghtMax = bomb.explosionLenghtMax + 1;
    //distance explosion N-S-O-E
    while (explosionLenght < explosionLenghtMax)
    {
    	let bombPosRow = bomb.posRow;
    	let bombPosCol = bomb.posCol;
    	//north
    	if (bombPosRow > 1 && bomb.north >= explosionLenght)
    	{
    		if (explosionLenght < bomb.explosionLenghtMax)
    		{
    			bomb.north = drawExplosion(bombPosX, bombPosY - (explosionLenght * tileSize), bomb, explosionLenght, bomb.north, 0, 32);
    		}
    		else
     		{
    			bomb.north = drawExplosion(bombPosX, bombPosY - (explosionLenght * tileSize), bomb, explosionLenght, bomb.north, 0, 0);
    		}   			
    	}
    	//east
    	if (bombPosCol < (tileNumberByCol - 2) && bomb.east >= explosionLenght)
    	{
    		if (explosionLenght < bomb.explosionLenghtMax)
    		{
    			bomb.east = drawExplosion(bombPosX + (explosionLenght * tileSize), bombPosY, bomb, explosionLenght, bomb.east, 32, 32);
    		}
    		else
    		{
    		    bomb.east = drawExplosion(bombPosX + (explosionLenght * tileSize), bombPosY, bomb, explosionLenght, bomb.east, 32, 0);	
    		}
    	}
    	//south
    	if (bombPosRow < (tileNumberByRow - 2) && bomb.south >= explosionLenght)
    	{    	
    		if (explosionLenght < bomb.explosionLenghtMax)
    		{
    			bomb.south = drawExplosion(bombPosX, bombPosY + (explosionLenght * tileSize), bomb, explosionLenght, bomb.south, 64, 32);
    		}
    		else
    		{
    			bomb.south = drawExplosion(bombPosX, bombPosY + (explosionLenght * tileSize), bomb, explosionLenght, bomb.south, 64, 0);
    		}			
    	}
    	//west
    	if (bombPosCol > 1 && bomb.west >= explosionLenght)
    	{
    		if (explosionLenght < bomb.explosionLenghtMax)
    		{
    			bomb.west = drawExplosion(bombPosX - (explosionLenght * tileSize), bombPosY, bomb, explosionLenght, bomb.west, 96, 32);
    		}
    		else
    		{
    			bomb.west = drawExplosion(bombPosX - (explosionLenght * tileSize), bombPosY, bomb, explosionLenght, bomb.west, 96, 0);
    		}
    	}
    	explosionLenght++;
    }

	//timing terminer explosion
	if (bomb.status == 2 && bomb.cycle == 0)
    {
    	bomb.cycle = 1;
       	if (bomb.fromPlayer == playerIndex)
		{
			socket.emit('finishExplosionBomb', bomb.id);
		}
	}
}

function dropBombs(index, playerPosRow, playerPosCol)
{
	let bomb = {
		status: 1,
		cycle: 0,
		posCol: 0,
		posRow: 0,
		explosionLenghtMax: 2,
		north: 2,
		east: 2,
		south: 2,
		west: 2,
		TimingExplosion: '',
		fromPlayer: index,
		id: 0
	};
	//bomb col
	bomb.posCol = playerPosCol;
	//bomb row
	bomb.posRow = playerPosRow;
	//passe la case en élément infranchissable
	mapBoards[bomb.posRow][bomb.posCol].wall = 1;
	bombsInGame.push(bomb);
}

function drawBombs()
{
	//draw bomb
	for (let i = 0; i < bombsInGame.length; i++)
	{
		let bomb = bombsInGame[i];
		bomb.id = i;
		//si la bombe est active (status 5 = bombe déjà explosée => inactive).
		if (bomb.status !=5)
		{
			let bombPosX = bomb.posCol * tileSize;
			let bombPosY = bomb.posRow * tileSize;
			let bombTimingEndOfExplosion;

			if (bomb.status == 1)
			{
				ctx.drawImage(bombImg, bombPosX, bombPosY, tileSize, tileSize);
				/*
			    ctx.beginPath();
			    ctx.arc(bombPosX, bombPosY, tileSize / 2, 0, 2 * Math.PI, false);
			    ctx.fillStyle = 'orange';
			    ctx.fill();
			    ctx.lineWidth = 2;
			    ctx.strokeStyle = '#003300';
			    ctx.stroke();*/
			    //timing avant explosion
			    if (bomb.cycle == 0)
	            {
	            	bomb.cycle = 1;
					if (bomb.fromPlayer == playerIndex)
					{
						socket.emit('exploseBomb', i);
					}
	            }
			}

			if (bomb.status == 2)
			{
				exploseBomb(bomb, bombPosX, bombPosY);
			}
		}
	}
}
function checkExplosionCollisions(exploDisX, exploDisY, bomb, stopThisExplosionLenght, dontChangeExplosionLenght)
{
	//collisions avec les bombes => arrêt propagation explosion dans cette direction mais on dessine sur cette case et on active l'explosion de la bombe touchée.
	for (let i = 0; i < bombsInGame.length; i++)
	{
		if (bombsInGame[i].posCol == (exploDisX / tileSize) && bombsInGame[i].posRow == (exploDisY / tileSize) && bombsInGame[i].status < 2 && bombsInGame[i] != bomb)
		{
	       	bombsInGame[i].status = 2;
	       	bombsInGame[i].cycle = 0;
	        mapBoards[bombsInGame[i].posRow][bombsInGame[i].posCol].wall = 0;
	        clearTimeout(bombsInGame[i].TimingExplosion);
	        return stopThisExplosionLenght;
		}
	}
	//collisions avec les murs indestructibles => arrêt propagation explosion dans cette direction et eviter de dessiner sur cette case.
	if (mapBoards[exploDisY / tileSize][exploDisX / tileSize].wall == 2)
	{
		return stopThisExplosionLenght - 1;
	}
	//collisions avec les murs destructibles => arrêt propagation explosion mais on dessine sur cette case.
	if (mapBoards[exploDisY / tileSize][exploDisX / tileSize].wall == 1)
	{
		mapBoards[exploDisY / tileSize][exploDisX / tileSize].type = 0;
		mapBoards[exploDisY / tileSize][exploDisX / tileSize].wall = 0;
		return stopThisExplosionLenght;
	}
	// collisions avec un joueur.
	for (let i = 0, playersLength = players.length; i < playersLength; i++)
	{
		let playCol = Math.round(players[i].posX / tileSize);
		let playRow = Math.round(players[i].posY/ tileSize);
		if (playCol == (exploDisX / tileSize) && playRow == (exploDisY / tileSize))
		{
			players[i].alive = 0;
			players[i].posX = -1 * tileSize;
			players[i].posY = -1 * tileSize;
			if (i == playerIndex)
			{
				socket.emit('countPlayersAlive');
			}
		}
	}
	return dontChangeExplosionLenght;
}

function drawExplosion(exploDisX, exploDisY, bomb, stopThisExplosionLenght, dontChangeExplosionLenght, fireImgX, fireImgY)
{
	//test les collisions.
	let testDraw = checkExplosionCollisions(exploDisX, exploDisY, bomb, stopThisExplosionLenght, dontChangeExplosionLenght);
	//si on ne se retrouve pas au dessus d'un élément indestructible => dessin de l'explosion.
	// 1 -> 4: fireEnd (haut, droit, bas, gauche).
	// 5 -> 8: fireCenter (haut, droit, bas, gauche).
	if (testDraw == dontChangeExplosionLenght)
	{
		ctx.beginPath();
		ctx.rect(exploDisX, exploDisY, tileSize, tileSize);
		ctx.fillStyle = 'orange';
		ctx.fill();
		ctx.closePath();
		ctx.drawImage(fireImg, fireImgX, fireImgY, 32, 32, exploDisX, exploDisY, tileSize, tileSize);
	}
	return testDraw;
}
