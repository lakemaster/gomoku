"use strict";

const BOARD_SIZE = 17;
const CrossState = {
    EMPTY: 1,
    WHITE: 2,
    BLACK: 3,
    OUTSIDE_OF_BOARD: 4
};

let game;

window.addEventListener("load", () => {

    game = new Game(BOARD_SIZE);
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


class Grid {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.grid = new Array(gridSize).fill(CrossState.EMPTY).map(()=>new Array(gridSize).fill(CrossState.EMPTY));
    }

    at(x, y) {
        let result = CrossState.OUTSIDE_OF_BOARD;
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
        return CrossState.OUTSIDE_OF_BOARD;
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
        console.log("set stone at " + x +"," + y);
        this.grid.setAt(x, y, stone);
        game.renderer.drawStone(stone, x, y);
    }

    isValid(x, y) {
        return  x > 0 && x < this.gridSize && y > 0 && y < this.gridSize;
    }

    isFree(x, y) {
        return this.grid.at(x,y) == CrossState.EMPTY;
    }

    isValidAndFree(x, y) {
        return  this.isValid(x, y) && this.isFree(x, y);
    }


    // todo: is buggy - improve
    gameOver(stone) {
        let g = this.grid;

        for ( let x = 1; x < this.gridSize-4; x++ ) {
            for ( let y = 1; y < this.gridSize-4; y++ ) {
                if ( g.at(x,y) == stone ) {
                    if ( g.at(x+1,y) == stone && g.at(x+2,y) == stone && g.at(x+3,y) == stone && g.at(x+4,y) == stone 
                        || g.at(x+1,y+1) == stone && g.at(x+2,y+2) == stone && g.at(x+3,y+3) == stone && g.at(x+4,y+4) == stone 
                        || g.at(x,y+1) == stone && g.at(x,y+2) == stone && g.at(x,y+3) == stone && g.at(x,y+4) == stone ) {
                            return true;
                        }

                    if ( x > 4 ) {
                        if (g.at(x-1,y+1) == stone && g.at(x-2,y+2) == stone && g.at(x-3,y+3) == stone && g.at(x-4,y+4) == stone 
                            || g.at(x-1,y) == stone && g.at(x-2,y) == stone && g.at(x-3,y) == stone && g.at(x-4,y) == stone ) {
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
        if ( grid.at(x,y) != CrossState.EMPTY ) {
            return -1;
        }

        let vN = this.validNeighbors(x, y);
        for ( let i = 0 ; i < vN.length; i++ ) {
            if ( grid.atp(vN[i]) == CrossState.BLACK ) {
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

const Directions = {
    WEST: 0,
    SOUTH_WEST: 1,
    SOUTH: 2,
    SOUTH_EAST: 3
};

class Position {
    constructor(x, y) {
        this.grid = game.board.grid;
        this.x = x;
        this.y = y;
    }

    isFree() {
        if ( this.grid.at(x,y) == CrossState.EMPTY ) {
            return true;
        }
        return false;
    }

    is(stone) {
        if ( this.grid.at(x,y) == stone ) {
            return true;
        }
        return false;
    }

    next(direction) {
        switch(this.direction) {
            case WEST:
                return new Position(x++, y);
            case SOUTH_WEST:
                return new Position(x++, y++);
            case SOUTH:
                return new Position(x, y++);
            case SOUTH_EAST:
                return new Position(x--, y++);
        }
    }

    prior(direction) {
        switch(this.direction) {
            case WEST:
                return new Position(x--, y);
            case SOUTH_WEST:
                return new Position(x--, y--);
            case SOUTH:
                return new Position(x, y--);
            case SOUTH_EAST:
                return new Position(x++, y--);
        }
    }
}

class Path {
    constructor(color, x, y, direction) {
        this.grid = game.board.grid;
        this.color = color;
        this.position = new Position(x, y);
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
        length = this.length;

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
        endPosition = this.position;
        for ( let p = this.position.next(this.direction); p.isValid() && p.is(this.color); p = p.next(this.direction) )
            endPosition = p;

        return endPosition;
    }

    getLength() {
        length = 1;
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
    }

    value() {
        let g = game.board.grid;
        for ( let x = 1; x < BOARD_SIZE; x++ ) {
            for ( let y = 1; y < BOARD_SIZE; y++ ) {
                p = new Position(x,y);
                if ( p.is(this.color) )
                    paths = getPaths(p)
                    paths.forEach((p)=>{
                        if ( p.isFive ) {
                            this.five++;
                        }
                    });
            }
        }
        
        return this.five * 10000
            + this.fourOpen * 1000
            + this.fourOpen * 100
            + this.threeOpen * 10
            + this.threeHalfOpen * 5
            + this.twoOpen * 3
            + this.twoHalfOpen * 2
            + this.neighbor * 1;
    }

    getPaths(position) {
        let paths = [];
        let c = this.color;

        // stating position has to be of this color
        if ( !position.is(c) ) {
            return paths;
        }

        for ( direction in Directions ) {
            if ( !position.prior().is(direction) ) {
                path = new Path(c, x, y, direction);
                if ( path.isExpandable() || path.isFive() ) {
                    paths.push(path);
                }
            }
        }

       return paths;
    }
}