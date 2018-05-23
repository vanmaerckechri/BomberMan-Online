var canvas = document.getElementById("scene");
var ctx = canvas.getContext("2d");

canvas.height = tileSize * tileNumberByRow;
canvas.width = tileSize * tileNumberByCol;

function engine()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
    drawBombs();
    drawOtherPlayer();
    requestAnimationFrame(engine);
}

genMapBoard();
engine()