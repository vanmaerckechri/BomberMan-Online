let tileSize = 32;
let tileNumberByRow = 15;
let tileNumberByCol = 15;
let mapBoards = [];
// 20 cases / 20 cases
let map01 = [
	9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
	9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9,
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
	9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9,
	9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9
	];
let floor1 = new Image();
floor1.src = 'assets/img/normal1.svg';
let floor2 = new Image();
floor2.src = 'assets/img/normal2.svg';
let unbreakBlock = new Image();
unbreakBlock.src = 'assets/img/unbreak.svg';
let box = new Image();
box.src = 'assets/img/box1.svg';
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
    let switchTemp;
    let switchImg = [floor1, floor2];
	for(let r = 0; r < tileNumberByRow; r++)
    {
        for(let c = 0; c < tileNumberByCol; c++)
        {
            tileType = mapBoards[r][c].type;
           	tileX = c  * tileSize;
    		tileY = r  * tileSize;
            switchTemp = switchImg[0];
            switchImg[0] = switchImg[1];
            switchImg[1] = switchTemp;
            //sol.
            if(tileType == 0)
            {
                ctx.drawImage(switchImg[0], tileX, tileY, tileSize, tileSize);
            }
            //murs destructibles.
            if(tileType == 2)
            {
                ctx.drawImage(box, tileX, tileY, tileSize, tileSize);
            }
            //murs indestructibles.
            if(tileType == 9)
            {
                ctx.drawImage(unbreakBlock, tileX, tileY, tileSize, tileSize);
            }
            if (mapBoards[r][c].wall === 3)
            {
                mapBoards[r][c].wall = 0;
            }
        }
    }
    if (players)
    {
        for (let i = 0, length = players.length; i < length; i++)
        {
            if (players[i].alive > 0)
            {
                let x = Math.floor(players[i].posX / tileSize);
                let y = Math.floor(players[i].posY / tileSize);
                if (mapBoards[y][x].wall === 0)
                {
                    mapBoards[y][x].wall = 3;
                }
                x = Math.ceil(players[i].posX / tileSize);
                y = Math.ceil(players[i].posY / tileSize);
                if (mapBoards[y][x].wall === 0)
                {
                    mapBoards[y][x].wall = 3;
                }        
            }
        }
    }
}