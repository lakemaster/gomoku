"use strict";

const BOARD_SIZE = 17;

const DIRECTION_WEST = 1;
const DIRECTION_SOUTH_WEST = 2;
const DIRECTION_SOUTH = 3;
const DIRECTION_SOUTH_EAST = 4;

const TILE_FREE = 1;
const TILE_WHITE = 2;
const TILE_BLACK = 3;
const TILE_OUTSIDE_OF_BOARD = 4;

let game;

window.addEventListener("load", () => {

    game = new Game(BOARD_SIZE);
    game.start();

    let handleMouseClick = function(event) {
        let pos = game.renderer.calcPosition(event);

        if ( game.board.isValidAndFree(pos[0], pos[1]) ) {
            game.board.setStone(TILE_BLACK, pos[0], pos[1]);

            if ( game.board.gameOver(TILE_BLACK) ) {
                game.stop(true);
            } else {
                pos = game.calculator.calculate(game.board.grid);
                if ( game.board.isValidAndFree(pos[0], pos[1]) ) {
                    game.board.setStone(TILE_WHITE, pos[0], pos[1]);
                    if ( game.board.gameOver(TILE_WHITE) ) {
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


class Grid {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.grid = new Array(gridSize).fill(TILE_FREE).map(()=>new Array(gridSize).fill(TILE_FREE));
    }

    at(x, y) {
        let result = TILE_OUTSIDE_OF_BOARD;
        if ( x > 0 && x < this.gridSize && y > 0 && y < this.gridSize) {
            result = this.grid[x][y];
        }
        //console.log("Grid.at: " + x + "," + y + " = ", result);
        return result;
    }

    atp(p) {
        if ( p[0] > 0 && p[0] < this.gridSize && p[1] > 0 && p[1] < this.gridSize) {
            return this.grid[p[0]][p[1]];
        }
        return TILE_OUTSIDE_OF_BOARD;
    }

    setAt(x, y, c) {
        if ( x > 0 && x < this.gridSize && y > 0 && y < this.gridSize) {
            this.grid[x][y] = c;
        }
    }

    setAtp(p, c) {
        if ( p[0] > 0 && p[0] < this.gridSize && p[1] > 0 && p[1] < this.gridSize) {
            grid[p[0]][p[1]] = c;
        }
    }
}

class Board {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.grid = new Grid(gridSize);
    }

    setStone(stone, x, y) {
        if ( !this.isValid(x, y) ) {
            alert("Error: (" + x + "," + y + ") out of range (" + this.gridSize + ")");
            return;
        }
        if ( ! this.isFree(x, y) ) {
            alert("Error: Position (" + x + "," + y + ") occupied");
            return;
        }
        // console.log("set stone at " + x +"," + y);
        this.grid.setAt(x, y, stone);
        game.renderer.drawStone(stone, x, y);
    }

    isValid(x, y) {
        return  x > 0 && x < this.gridSize && y > 0 && y < this.gridSize;
    }

    isFree(x, y) {
        return this.grid.at(x,y) == TILE_FREE;
    }

    isValidAndFree(x, y) {
        return  this.isValid(x, y) && this.isFree(x, y);
    }

    gameOver(stone) {
        let valuation = new Valuation(stone);
        return valuation.value() >= 10000;
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
    
        stoneElement.src = (stone == TILE_WHITE) ? "white-stone.png" : "black-stone.png";
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

    testPosition(grid, x, y, color) {
        if ( grid.at(x,y) != TILE_FREE ) {
            return -1;
        }

        let vN = this.validNeighbors(x, y);
        for ( let i = 0 ; i < vN.length; i++ ) {
            if ( grid.atp(vN[i]) == TILE_BLACK ) {
                return 0;
            }
        }

        return -1;
    }


    valuate(color) {
        valuation = new Valuation(color);
        return valuation.value();
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


class Position {
    constructor(x, y) {
        this.grid = game.board.grid;
        this.x = x;
        this.y = y;
    }

    isFree() {
        if ( this.grid.at(this.x, this.y) == TILE_FREE ) {
            return true;
        }
        return false;
    }

    is(stone) {
        if ( this.grid.at(this.x, this.y) == stone ) {
            return true;
        }
        return false;
    }

    isValid() {
        if ( this.x > 0 && this.x < BOARD_SIZE && this.y > 0 && this.y < BOARD_SIZE )
            return true;

        return false;
    }

    next(direction) {
        if ( direction == DIRECTION_WEST )
            return new Position(this.x+1, this.y);
        if ( direction == DIRECTION_SOUTH_WEST )
            return new Position(this.x+1, this.y+1);
        if ( direction == DIRECTION_SOUTH )
            return new Position(this.x, this.y+1);
        if ( direction == DIRECTION_SOUTH_EAST )
            return new Position(this.x-1, this.y+1);

        console.log("return no Position");
    }

    prior(direction) {
        if ( direction == DIRECTION_WEST )
            return new Position(this.x-1, this.y);
        if ( direction == DIRECTION_SOUTH_WEST )
            return new Position(this.x-1, this.y-1);
        if ( direction == DIRECTION_SOUTH )
            return new Position(this.x, this.y-1);
        if ( direction == DIRECTION_SOUTH_EAST )
            return new Position(this.x+1, this.y-1);

        console.log("return no Position");
    }   
}

// todo: does not work
Position.prototype.toString = function positionToString() {
    const ret = "[" + this.x + "," + this.y + "]";
    return ret;
};



class Path {
    constructor(color, position, direction) {
        this.grid = game.board.grid;
        this.color = color;
        this.position = position;
        this.direction = direction;
        this.length = this.getLength();
    }

    isFive() {
        if ( this.length >= 5 ) {
            return true;
        }
        return false;
    }

    isExpandable() {
        let length = this.length;

        // look in front of path
        for ( let p = this.position.prior(this.direction); length < 5 && p.isValid() && (p.isFree() || p.is(this.color)); p = p.prior(this.direction) )
            length++;

        // look behind path
        for ( let p = this.getEndPosition().next(this.direction); length < 5 && p.isValid() && (p.isFree() || p.is(this.color)); p = p.next(this.direction) )
            length++;

        if ( length >= 5 ) 
            return true;
        
        return false;
    }

    getEndPosition() {
        let endPosition = this.position;
        for ( let p = this.position.next(this.direction); p.isValid() && p.is(this.color); p = p.next(this.direction) )
            endPosition = p;

        return endPosition;
    }

    getLength() {
        let length = 1;
        for ( let p = this.position.next(this.direction); p.isValid() && p.is(this.color); p = p.next(this.direction) )
            length++;

        return length;
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
        this.neighbor = 0;
    }

    value() {
        console.log("valuation of " + this.color);

        let g = game.board.grid;
        for ( let x = 1; x < BOARD_SIZE; x++ ) {
            for ( let y = 1; y < BOARD_SIZE; y++ ) {
                let p = new Position(x,y);
                if ( p.is(this.color) ) {
                    Valuation.getPaths(p, this.color).forEach((p)=>{
                        console.log(p);
                        if ( p.isFive() ) {
                            this.five++;
                        }
                    });
                }
            }
        }

        let value = this.five * 10000
            + this.fourOpen * 1000
            + this.fourHalfOpen * 100
            + this.threeOpen * 10
            + this.threeHalfOpen * 5
            + this.twoOpen * 3
            + this.twoHalfOpen * 2
            + this.neighbor * 1;

        console.log("valuation of " + this.color +  " = " + value);
        return value;
    }

    static getPaths(position, color) {
        let paths = [];

        // stating position has to be of this color
        if ( !position.is(color) ) {
            return paths;
        }

        for ( let direction of [DIRECTION_WEST, DIRECTION_SOUTH_WEST, DIRECTION_SOUTH, DIRECTION_SOUTH_EAST] ) {
            if ( !position.prior(direction).is(color) ) {
                let path = new Path(color, position, direction);
                if ( path.isExpandable() || path.isFive() ) {
                    paths.push(path);
                }
            }
        }

       return paths;
    }
}