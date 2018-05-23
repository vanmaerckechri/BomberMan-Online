let avatars = ['black', 'red', 'blue', 'yellow', 'green', 'purple'];
let player = {
    playerMovingTempo: '',
    moving: false,
    posX: tileSize,
    posY: tileSize,
    bombsNumberMax: 1,
    bombsNumber: 2,
    topPressed: false,
    rightPressed: false,
    bottomPressed: false,
    leftPressed: false,
    spacePressed: false,
    spaceStopPressed: true,
    color: ''
    };
let players = [];
players.push(player);
players.push(player);

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e)
{
    //joueur 1
	if(e.keyCode == 68)
	{
	    player.rightPressed = true;
	}
	else if(e.keyCode == 81)
	{
	    player.leftPressed = true;
	}
	else if(e.keyCode == 83)
	{
	    player.bottomPressed = true;
	}
	else if(e.keyCode == 90)
	{
	    player.topPressed = true;
	}
	else if(e.keyCode == 32 && player.spaceStopPressed == true)
	{
	    player.spacePressed = true;
	    player.spaceStopPressed = false;
	}
}
function keyUpHandler(e)
{
    //joueur 1
    if(e.keyCode == 68)
    {
        player.rightPressed = false;
    }
    else if(e.keyCode == 81)
    {
        player.leftPressed = false;
    }
    else if(e.keyCode == 83)
    {
        player.bottomPressed = false;
    }
    else if(e.keyCode == 90)
    {
        player.topPressed = false;
    }
    else if(e.keyCode == 32)
    {
        player.spacePressed = false;
      	player.spaceStopPressed = true;
    }
}

function drawPlayer()
{
    for (i = 0; i < players.length; i++)
    {
        let player = players[i];
        let index = i;
        let playerPosArrayCol;
        let playerPosArrayRow;
        let playerMovingSpeed = tileSize / 16;
        // MOVE TOP
        if (player.moving == false && player.topPressed == true)
        {
            playerPosArrayCol = player.posX / tileSize;
            playerPosArrayRow = player.posY / tileSize;

            if (mapBoards[playerPosArrayRow - 1][playerPosArrayCol].wall < 1)
            {
                player.moving = true;
                player.playerMovingTempo = setInterval(function()
                {
                    player.posY -= playerMovingSpeed;
                    if (player.posY % tileSize === 0)
                    {
                        player.moving = false;
                        clearInterval(player.playerMovingTempo);
                    }
                },10);
            }
        }
        // MOVE BOTTOM
        if (player.moving == false && player.bottomPressed == true)
        {
            playerPosArrayCol = player.posX / tileSize;
            playerPosArrayRow = player.posY / tileSize;

            if (mapBoards[playerPosArrayRow + 1][playerPosArrayCol].wall < 1)
            {
                player.moving = true;
                player.playerMovingTempo = setInterval(function()
                {
                    player.posY += playerMovingSpeed;
                    if (player.posY % tileSize === 0)
                    {
                        player.moving = false;
                        clearInterval(player.playerMovingTempo);
                    }
                },10);
            }
        }
        // MOVE RIGHT
        if (player.moving == false && player.rightPressed == true)
        {
            playerPosArrayCol = player.posX / tileSize;
            playerPosArrayRow = player.posY / tileSize;
            if (mapBoards[playerPosArrayRow][playerPosArrayCol + 1].wall < 1)
            {
                player.moving = true;
                player.playerMovingTempo = setInterval(function()
                {
                    player.posX += playerMovingSpeed;
                    if (player.posX % tileSize === 0)
                    {
                        player.moving = false;
                        clearInterval(player.playerMovingTempo);
                    }
                },10);
            }
        }
        // MOVE LEFT
        if (player.moving == false && player.leftPressed == true)
        {
            playerPosArrayCol = player.posX / tileSize;
            playerPosArrayRow = player.posY / tileSize;

            if (mapBoards[playerPosArrayRow][playerPosArrayCol -1].wall < 1)
            {
                player.moving = true;
                player.playerMovingTempo = setInterval(function()
                {
                    player.posX -= playerMovingSpeed;
                    if (player.posX % tileSize === 0)
                    {
                        player.moving = false;
                        clearInterval(player.playerMovingTempo);
                    }
                },10);
            }
        }
        // DROP BOMB
        let playerPosRow = player.posY / tileSize;
        playerPosRow = parseInt(playerPosRow);
        let playerPosCol = player.posX / tileSize;
        playerPosCol = parseInt(playerPosCol);
        if (player.bombsNumber > 0 && player.spacePressed == true && mapBoards[playerPosRow][playerPosCol].wall == 0)
        {
            player.bombsNumber--;
            player.spacePressed = false;
            dropBombs(index, playerPosRow, playerPosCol);
        }
        ctx.beginPath();
        ctx.rect(player.posX, player.posY, tileSize, tileSize);
        ctx.fillStyle = player.color;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}