"use strict";

let game;

window.addEventListener("load", () => {

    game = new Game(17);
    game.start();



    let handleMouseClick = function(event) {
        let pos = game.renderer.calcPosition(event);

        if ( game.board.isValidAndFree(pos[0], pos[1]) ) {
            game.board.setStone(CrossState.BLACK, pos[0], pos[1]);

            if ( game.board.gameOver(CrossState.BLACK) ) {
                game.stop(true);
            } else {
                pos = game.calculator.calculate(game.board.grid);
                if ( game.board.isValidAndFree(pos[0], pos[1]) ) {
                    game.board.setStone(CrossState.WHITE, pos[0], pos[1]);
                    if ( game.board.gameOver(CrossState.WHITE) ) {
                        game.stop(false);
                    }
                }
            }
        }

        if ( !game.isRunning ) {
            game.renderer.board.removeEventListener("click", handleMouseClick);
        }
    }

    game.renderer.board.addEventListener("click", handleMouseClick);

});

class Game {
    constructor(gridSize) {
        this.board = new Board(gridSize);
        this.renderer = new Renderer(gridSize);
        this.calculator = new Calculator(gridSize);
        this.isRunning = false;
    }

    start() {
        this.renderer.drawBoard();
        this.isRunning = true;
    }

    stop(win) {
        this.isRunning = false;
        setTimeout(()=> {
            if ( win ) {
                alert("Congratulations, You win!"); 
            } else {
                alert("Sorry, You loose!")
            }}, 0);
        }
}

const CrossState = {
    EMPTY: 1,
    WHITE: 2,
    BLACK: 3,
    OUTSIDE_OF_BOARD: 4
};

class Grid {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.grid = new Array(gridSize).fill(CrossState.free).map(()=>new Array(gridSize).fill(CrossState.free));
    }

    at(x, y) {
        if ( x > 0 && x < gridSize && y > 0 && y < this.gridSize) {
            return this.grid[x][y];
        }
    }

    atp(p) {
        if ( p[0] > 0 && p[0] < gridSize && p[1] > 0 && p[1] < this.gridSize) {
            return this.grid[p[0]][p[1]];
        }
        return 
    }
}

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

        for ( let x = 1; x < this.gridSize-4; x++ ) {
            for ( let y = 1; y < this.gridSize-4; y++ ) {
                if ( g[x][y] == stone ) {
                    if ( g[x+1][y] == stone && g[x+2][y] == stone && g[x+3][y] == stone && g[x+4][y] == stone 
                        || g[x+1][y+1] == stone && g[x+2][y+2] == stone && g[x+3][y+3] == stone && g[x+4][y+4] == stone 
                        || g[x][y+1] == stone && g[x][y+2] == stone && g[x][y+3] == stone && g[x][y+4] == stone ) {
                            return true;
                        }

                    if ( x > 4 ) {
                        if (g[x-1][y+1] == stone && g[x-2][y+2] == stone && g[x-3][y+3] == stone && g[x-4][y+4] == stone 
                            || g[x-1][y] == stone && g[x-2][y] == stone && g[x-3][y] == stone && g[x-4][y] == stone ) {
                            return true;
                        }
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
    
        stoneElement.src = (stone == CrossState.WHITE) ? "white-stone.png" : "black-stone.png";
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
                if ( res >= 0 ) {
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

        let vN = this.validNeighbors(x, y);
        for ( let i = 0 ; i < vN.length; i++ ) {
            if ( grid[vN[i][0]][vN[i][1]] == CrossState.BLACK ) {
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

const Direction = {
    WEST: 0,
    SOUTH_WEST: 1,
    SOUTH: 2,
    SOUTH_EAST: 3
};

class Path {
    constructor(grid, color, x, y, direction) {
        this.grid = grid;
        this.color = color;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.length = 0;
    }

    getNext(p) {
        switch(this.direction) {
            case WEST:
                return [p[0]++, p[1]];
            case SOUTH_WEST:
                return [p[0]++, p[1]++];
            case SOUTH:
                return [p[0], p[1]++];
            case SOUTH_EAST:
                return [p[0]--, p[1]++];
        }
    }

    getLength() {
        let g = this.grid;
        let p = [this.x, this.y];

        for ( i in [1, 2, 3, 4] ) {
            p = this.getNext(p);
            if ( g[p[0]][p[1]] != this.color) {
                return i;
            }
        }
        return 5;
    }
}

class Valuation {
    constructor(color) {
        this.color = color;
        this.five = 0;
        this.fourOpen = 0;
        this.fourHalfOpen = 0;
        this.threeOpen = 0;
        this.threeHalfOpen = 0;
        this.twoOpen = 0;
        this.twoHalfOpen = 0;
    }

    value(g) {
        let gridSize = g[0].length;
        for ( let x = 1; x < gridSize; x++ ) {
            for ( let y = 1; y < gridSize; y++ ) {
                if ( g[x][y] == this.color )
                    paths = getPaths(g, x, y)
                    paths.forEach((p)=>{
                        
                    });
            }
        }
    }

    getPaths(g, x, y) {
        let gridSize = g[0].length;
        let paths = [];
        let c = this.color;

        if ( g[x][y] != c ) {
            return paths;
        }

        // west path
        if ( g[x-1][y] != c && x < gridSize - 4 ) {
                paths.push(new Path(g, c, x, y, Direction.WEST));
        }

        // south west path
        if ( g[x-1][y-1] != c && x < gridSize - 4 && y < gridSize - 4 ) {
            paths.push(new Path(g, c, x, y, Direction.SOUTH_WEST));
        }

        // south path
        if ( g[x][y-1] != c && y < gridSize - 4 ) {
            paths.push(new Path(g, c, x, y, Direction.SOUTH));
        }

        // south east path
        if ( (x == gridSize-1 || g[x-1][y-1] != c) && x < gridSize - 4 && y < gridSize - 4 ) {
            paths.push(new Path(g, c, x, y, Direction.SOUTH_EAST));
        }

        return paths;
    }
}