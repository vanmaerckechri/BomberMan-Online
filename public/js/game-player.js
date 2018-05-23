let avatars = ['black', 'red', 'blue', 'yellow', 'green', 'purple'];
let playerIndex;
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

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e)
{
    //joueur 1
	if(e.keyCode == 68)
	{
	    players[playerIndex].rightPressed = true;
	}
	else if(e.keyCode == 81)
	{
	    players[playerIndex].leftPressed = true;
	}
	else if(e.keyCode == 83)
	{
	    players[playerIndex].bottomPressed = true;
	}
	else if(e.keyCode == 90)
	{
	    players[playerIndex].topPressed = true;
	}
	else if(e.keyCode == 32 && players[playerIndex].spaceStopPressed == true)
	{
	    players[playerIndex].spacePressed = true;
	    players[playerIndex].spaceStopPressed = false;
	}
}
function keyUpHandler(e)
{    console.log(players)

    //joueur 1
    if(e.keyCode == 68)
    {
        players[playerIndex].rightPressed = false;
    }
    else if(e.keyCode == 81)
    {
        players[playerIndex].leftPressed = false;
    }
    else if(e.keyCode == 83)
    {
        players[playerIndex].bottomPressed = false;
    }
    else if(e.keyCode == 90)
    {
        players[playerIndex].topPressed = false;
    }
    else if(e.keyCode == 32)
    {
        players[playerIndex].spacePressed = false;
      	players[playerIndex].spaceStopPressed = true;
    }
}

function drawPlayer()
{
    for (let i = 0, playersLength = players.length; i < playersLength; i++)
    {
        let index = i;
        let playerPosArrayCol;
        let playerPosArrayRow;
        let playerMovingSpeed = tileSize / 16;
        // MOVE TOP
        if (players[i].moving == false && players[i].topPressed == true)
        {
            playerPosArrayCol = players[i].posX / tileSize;
            playerPosArrayRow = players[i].posY / tileSize;

            if (mapBoards[playerPosArrayRow - 1][playerPosArrayCol].wall < 1)
            {
                players[i].moving = true;
                players[i].playerMovingTempo = setInterval(function()
                {
                    players[i].posY -= playerMovingSpeed;
                    if (players[i].posY % tileSize === 0)
                    {
                        players[i].moving = false;
                        clearInterval(players[i].playerMovingTempo);
                    }
                },10);
            }
        }
        // MOVE BOTTOM
        if (players[i].moving == false && players[i].bottomPressed == true)
        {
            playerPosArrayCol = players[i].posX / tileSize;
            playerPosArrayRow = players[i].posY / tileSize;

            if (mapBoards[playerPosArrayRow + 1][playerPosArrayCol].wall < 1)
            {
                players[i].moving = true;
                players[i].playerMovingTempo = setInterval(function()
                {
                    players[i].posY += playerMovingSpeed;
                    if (players[i].posY % tileSize === 0)
                    {
                        players[i].moving = false;
                        clearInterval(players[i].playerMovingTempo);
                    }
                },10);
            }
        }
        // MOVE RIGHT
        if (players[i].moving == false && players[i].rightPressed == true)
        {
            playerPosArrayCol = players[i].posX / tileSize;
            playerPosArrayRow = players[i].posY / tileSize;
            if (mapBoards[playerPosArrayRow][playerPosArrayCol + 1].wall < 1)
            {
                players[i].moving = true;
                players[i].playerMovingTempo = setInterval(function()
                {
                    players[i].posX += playerMovingSpeed;
                    if (players[i].posX % tileSize === 0)
                    {
                        players[i].moving = false;
                        clearInterval(players[i].playerMovingTempo);
                    }
                },10);
            }
        }
        // MOVE LEFT
        if (players[i].moving == false && players[i].leftPressed == true)
        {
            playerPosArrayCol = players[i].posX / tileSize;
            playerPosArrayRow = players[i].posY / tileSize;

            if (mapBoards[playerPosArrayRow][playerPosArrayCol -1].wall < 1)
            {
                players[i].moving = true;
                players[i].playerMovingTempo = setInterval(function()
                {
                    players[i].posX -= playerMovingSpeed;
                    if (players[i].posX % tileSize === 0)
                    {
                        players[i].moving = false;
                        clearInterval(players[i].playerMovingTempo);
                    }
                },10);
            }
        }
        // DROP BOMB
        let playerPosRow = players[i].posY / tileSize;
        playerPosRow = parseInt(playerPosRow);
        let playerPosCol = players[i].posX / tileSize;
        playerPosCol = parseInt(playerPosCol);
        if (players[i].bombsNumber > 0 && players[i].spacePressed == true && mapBoards[playerPosRow][playerPosCol].wall == 0)
        {
            players[i].bombsNumber--;
            players[i].spacePressed = false;
            dropBombs(index, playerPosRow, playerPosCol);
        }
        ctx.beginPath();
        ctx.rect(players[i].posX, players[i].posY, tileSize, tileSize);
        ctx.fillStyle = players[i].color;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}
