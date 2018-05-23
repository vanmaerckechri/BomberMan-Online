var tileSize = 32;
var tileNumberByRow = 15;
var tileNumberByCol = 15;
var mapBoards = [];
// 20 cases / 20 cases
var map01 = [
	9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
	9, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9,
	9, 0, 9, 2, 9, 2, 9, 0, 9, 0, 9, 0, 9, 0, 9,
	9, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9,
	9, 2, 9, 2, 9, 2, 9, 0, 9, 0, 9, 0, 9, 0, 9,
	9, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9,
	9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9,
	9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9,
	9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9,
	9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 9,
	9, 0, 9, 0, 9, 0, 9, 0, 9, 2, 9, 2, 9, 2, 9,
	9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 9,
	9, 0, 9, 0, 9, 0, 9, 0, 9, 2, 9, 2, 9, 0, 9,
	9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 9,
	9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9
	];
// transforme les tableaux map de dimension unique en tableau à deux dimensions (row / col)
function genMapBoard()
{
	let mapIndex = 0;
	for(let r = 0; r < tileNumberByRow; r++)
	{
		mapBoards[r] = [];
        for(let c = 0; c < tileNumberByCol; c++)
        {
			mapBoards[r][c] = {wall: 0, type: 0};
            //murs indestructibles.
			if (map01[mapIndex] == 9)
			{
				mapBoards[r][c].wall = 2;
			}
            //murs desctructibles.
            else if (map01[mapIndex] == 2) 
            {
                mapBoards[r][c].wall = 1;
            }
			mapBoards[r][c].type = map01[mapIndex];
			mapIndex++;
		}
    }
}

function drawMap()
{
	let tile;
	let tileX;
    let tileY;
	for(var r = 0; r < tileNumberByRow; r++)
    {
        for(var c = 0; c < tileNumberByCol; c++)
        {
            tileType = mapBoards[r][c].type;
           	tileX = c  * tileSize;
    		tileY = r  * tileSize;
            //sol.
            if(tileType < 3)
            {
    	        ctx.beginPath();
                ctx.rect(tileX, tileY, tileSize, tileSize);
                ctx.fillStyle = 'rgb(125, 125, 125)';
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.fill();
                ctx.stroke();
                ctx.closePath(); 
            }
            //murs destructibles.
            if(tileType == 2)
            {
                ctx.beginPath();
                ctx.rect(tileX, tileY, tileSize, tileSize);
                ctx.fillStyle = 'rgb(100, 75, 50)';
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.fill();
                ctx.stroke();
                ctx.closePath(); 
            }
            //murs indestructibles.
            if(tileType == 9)
            {
    	        ctx.beginPath();
                ctx.rect(tileX, tileY, tileSize, tileSize);
                ctx.fillStyle = 'rgb(50, 50, 60)';
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.fill();
                ctx.stroke();
                ctx.closePath(); 
            }
        }
    }
}