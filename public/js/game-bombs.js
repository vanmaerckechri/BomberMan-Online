var bombsInGame = [];

function exploseBomb(bomb, bombPosX, bombPosY)
{
	let returnUseless = drawExplosion(bombPosX - tileSize / 2, bombPosY - tileSize / 2, bomb, 2, 2);
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
    		bomb.north = drawExplosion(bombPosX - tileSize / 2, bombPosY - tileSize / 2 - (explosionLenght * tileSize), bomb, explosionLenght, bomb.north);
    	}
    	//east
    	if (bombPosCol < (tileNumberByCol - 2) && bomb.east >= explosionLenght)
    	{
    		bomb.east = drawExplosion(bombPosX - tileSize / 2 + (explosionLenght * tileSize), bombPosY - tileSize / 2, bomb, explosionLenght, bomb.east);
    	}
    	//south
    	if (bombPosRow < (tileNumberByRow - 2) && bomb.south >= explosionLenght)
    	{
    		bomb.south = drawExplosion(bombPosX - tileSize / 2, bombPosY - tileSize / 2 + (explosionLenght * tileSize), bomb, explosionLenght, bomb.south);

    	}
    	//west
    	if (bombPosCol > 1 && bomb.west >= explosionLenght)
    	{
    		bomb.west = drawExplosion(bombPosX - tileSize / 2 - (explosionLenght * tileSize), bombPosY - tileSize / 2, bomb, explosionLenght, bomb.west);
    	}
    	explosionLenght++;
    }

	//timing terminer explosion
	if (bomb.status == 2 && bomb.cycle == 0)
    {
    	bomb.cycle = 1;
	    bomb.TimingExplosion = setTimeout(function()
        {
            bomb.status = 5;
            bomb.cycle = 5;
            clearTimeout(bomb.TimingExplosion);
        },1000);
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
		fromPlayer: index
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
		//si la bombe est active (status 5 = bombe déjà explosée => inactive).
		if (bomb.status !=5)
		{
			let bombPosX = bomb.posCol * tileSize + (tileSize / 2);
			let bombPosY = bomb.posRow * tileSize + (tileSize / 2);
			let bombTimingEndOfExplosion;

			if (bomb.status == 1)
			{
			    ctx.beginPath();
			    ctx.arc(bombPosX, bombPosY, tileSize / 2, 0, 2 * Math.PI, false);
			    ctx.fillStyle = 'orange';
			    ctx.fill();
			    ctx.lineWidth = 2;
			    ctx.strokeStyle = '#003300';
			    ctx.stroke();
			    //timing avant explosion
			    if (bomb.cycle == 0)
	            {
	            	bomb.cycle = 1;
				    bomb.TimingExplosion = setTimeout(function()
		            {
	                   	bomb.status = 2;
	                   	bomb.cycle = 0;
	                    players[bomb.fromPlayer].bombsNumber++;
	                    mapBoards[bomb.posRow][bomb.posCol].wall = 0;
	                    clearTimeout(bomb.TimingExplosion);
		            },2000);
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
	        players[bombsInGame[i].fromPlayer].bombsNumber++;
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
	return dontChangeExplosionLenght;
}
function drawExplosion(exploDisX, exploDisY, bomb, stopThisExplosionLenght, dontChangeExplosionLenght)
{
	//test les collisions.
	let testDraw = checkExplosionCollisions(exploDisX, exploDisY, bomb, stopThisExplosionLenght, dontChangeExplosionLenght);
	//si on ne se retrouve pas au dessus d'un élément indestructible => dessin de l'explosion.
	if (testDraw == dontChangeExplosionLenght)
	{
		ctx.beginPath();
		ctx.rect(exploDisX, exploDisY, tileSize, tileSize);
		ctx.fillStyle = 'orange';
		ctx.fill();
		ctx.closePath();
	}
	return testDraw;
}
