"use strict";

let game;

window.addEventListener("load", () => {

    game = new Game(17);
    game.start();


    game.renderer.board.addEventListener("click", function(event) {
        let pos = game.renderer.calcPosition(event);

        if ( game.board.isValidAndFree(pos[0], pos[1]) ) {
            game.board.setStone(CrossState.black, pos[0], pos[1]);

            if ( !game.board.gameOver(CrossState.black) ) {
                pos = game.calculator.calculate(game.board.grid);
                if ( game.board.isValidAndFree(pos[0], pos[1]) ) {
                    game.board.setStone(CrossState.white, pos[0], pos[1]);
                }
            }
            if ( game.board.gameOver(CrossState.white) || game.board.gameOver(CrossState.black) ) {
                alert("Game over");
                document.location.reload();
            }
        }
    })

});

class Game {
    constructor(gridSize) {
        this.board = new Board(gridSize);
        this.renderer = new Renderer(gridSize);
        this.calculator = new Calculator(gridSize);
    }

    start() {
        this.renderer.drawBoard();
    }
}

const CrossState = {
    free: 1,
    white: 2,
    black: 3
};

class Board {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.grid = new Array(gridSize).fill(CrossState.free).map(()=>new Array(gridSize).fill(CrossState.free));
    }

    setStone(stone, x, y) {
        if ( !this.isValid(x, y) ) {
            alert("Error: (" + x + "," + y + ") out of range (" + this.gridSize + ")");
            return;
        }
        if ( ! this.isFree(x,y) ) {
            alert("Error: Position (" + x + "," + y + ") occupied");
            return;
        }
        this.grid[x][y] = stone;
        game.renderer.drawStone(stone, x, y);
        console.log(this.grid);
    }

    isValid(x, y) {
        return  x > 0 && x < this.gridSize && y > 0 && y < this.gridSize;
    }

    isFree(x, y) {
        return this.grid[x][y] == CrossState.free;
    }

    isValidAndFree(x, y) {
        return  this.isValid(x, y) && this.isFree(x, y);
    }


    // todo: is buggy - improve
    gameOver(stone) {
        let g = this.grid;

        for ( let x = 5; x < this.gridSize-4; x++ ) {
            for ( let y = 1; y < this.gridSize-4; y++ ) {
                if ( g[x][y] == stone ) {
                    if ( g[x+1][y] == stone && g[x+2][y] == stone && g[x+3][y] == stone && g[x+4][y] == stone 
                        || g[x+1][y+1] == stone && g[x+2][y+2] == stone && g[x+3][y+3] == stone && g[x+4][y+4] == stone 
                        || g[x][y+1] == stone && g[x][y+2] == stone && g[x][y+3] == stone && g[x][y+4] == stone 
                        || g[x-1][y+1] == stone && g[x-2][y+2] == stone && g[x-3][y+3] == stone && g[x-4][y+4] == stone 
                        || g[x-1][y] == stone && g[x-2][y] == stone && g[x-3][y] == stone && g[x-4][y] == stone ) {
                            return true;
                    }
                }
            }
        }
        return false;
    }
}

class Renderer {

    constructor(gridSize) {
        this.gridSize = gridSize;
        this.board = document.getElementById("board");
        this.width = board.clientWidth;
        this.height = board.clientHeight;
        this.tileWidth = Math.round(this.width / gridSize);
        this.tileHeight = Math.round(this.height / gridSize);

    }

    drawBoard(gridSize) {
        for ( let i=0; i < this.width-this.gridSize; i += this.tileWidth) {
            for ( let j=0; j < this.height-this.gridSize; j += this.tileHeight) {
                let tile = document.createElement("div");
                tile.style.position = "absolute";
                tile.style.left = i;
                tile.style.top = j;
                tile.style.width = this.tileWidth;
                tile.style.height = this.tileHeight;
                tile.style.border = "thin solid #000000"
                board.appendChild(tile);
            }
        }
    }

    drawStone(stone, x, y) {
        let stoneElement = document.createElement("img");
    
        stoneElement.src = (stone == CrossState.white) ? "white-stone.png" : "black-stone.png";
        stoneElement.style.position = "absolute";
        stoneElement.style.left = x * this.tileWidth - Math.round(this.tileWidth/2)+1;
        stoneElement.style.top = y * this.tileHeight - Math.round(this.tileHeight/2)+1;
        stoneElement.style.width = this.tileWidth;
        stoneElement.style.height = this.tileHeight;
    
        this.board.appendChild(stoneElement);
    }

    calcPosition(clickEvent) {
        let xpx = clickEvent.clientX - this.board.offsetLeft;
        let ypx = clickEvent.clientY - this.board.offsetTop;

        let x = 10 * xpx / this.tileWidth;
        let y = 10 * ypx / this.tileHeight;

        let xm = x % 10;
        let ym = y % 10;
        if ( (xm >= 4 && xm <= 6) || (xm >= 4 && xm <= 6) ) {
            return [-1, -1];
        }

        return( [Math.round(x/10), Math.round(y/10)] );
    }
}

class Calculator {
    constructor(gridSize) {
        this.gridSize = gridSize;
    }

    calculate(grid) {
        for ( let x = 1; x < this.gridSize; x++) {
            for ( let y = 1; y < this.gridSize; y++) {
                let res = this.testPosition(grid, x, y);
                console.log("res: " + res);
                if ( res >= 0 ) {
                    console.log("calculated: " + x + ", " + y);
                    return [x, y];
                }
            }
        }
        return [-1, -1];
    }

    testPosition(grid, x, y) {
        if ( grid[x][y] != CrossState.free ) {
            return -1;
        }
        console.log("Check: " + x + ","+ y);

        let vN = this.validNeighbors(x, y);
        console.log("valid neighbors: " + vN);
        for ( let i = 0 ; i < vN.length; i++ ) {
            console.log("Check VN: " + vN[i]);
            if ( grid[vN[i][0]][vN[i][1]] == CrossState.black ) {
                console.log("found neighbor: " + vN[i] + " of " + x + ", "+ y);
                return 0;
            }
        }

        return -1;
    }

    validNeighbors(x, y) {
        let neighbors = [
            [x-1, y-1],
            [x, y-1],
            [x+1, y-1],
            [x-1, y],
            [x+1, y],
            [x-1, y+1],
            [x, y+1],
            [x+1, y+1]
        ];

        let validNeighbors = [];
        neighbors.forEach((pos)=>{
            if ( game.board.isValid(pos[0], pos[1]) ) {
                    validNeighbors.push(pos);
            }
        });
        return validNeighbors;
    }
}


