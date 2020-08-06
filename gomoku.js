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

    game = new Game();
    game.start();

    let handleMouseClick = function(event) {
        let pos = game.renderer.calcPosition(event);

        if ( pos.isValidAndFree() ) {
            game.board.setStone(TILE_BLACK, pos);

            if ( game.board.gameOver(TILE_BLACK) ) {
                game.stop(true);
            } else {
                let result = game.calculator.calculate(game.board.grid);

                if ( result.position.isValidAndFree() ) {
                    game.board.setStone(TILE_WHITE, result.position);
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
    constructor() {
        this.board = new Board();
        this.renderer = new Renderer();
        this.calculator = new Calculator(TILE_WHITE, true, true);
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
                alert("Congratulations, You won!"); 
            } else {
                alert("Sorry, You lost!")
            }}, 0);
        }
}


class Grid {
    constructor() {
        this.grid = new Array(BOARD_SIZE).fill(TILE_FREE).map(()=>new Array(BOARD_SIZE).fill(TILE_FREE));
    }

    get(p) {
        if ( p.x > 0 && p.x < BOARD_SIZE && p.y > 0 && p.y < BOARD_SIZE) {
            return this.grid[p.x][p.y];
        }
        return TILE_OUTSIDE_OF_BOARD;
    }

    set(p, stone) {
        if ( p.x > 0 && p.x < BOARD_SIZE && p.y > 0 && p.y < BOARD_SIZE) {
            this.grid[p.x][p.y] = stone;
        }
    }
}


class Position {
    constructor(x, y) {
        this.grid = game.board.grid;
        this.x = x;
        this.y = y;
    }

    isFree() {
        if ( this.grid.get(this) == TILE_FREE ) {
            return true;
        }
        return false;
    }

    is(stone) {
        if ( this.grid.get(this) == stone ) {
            return true;
        }
        return false;
    }

    isValid() {
        if ( this.x > 0 && this.x < BOARD_SIZE && this.y > 0 && this.y < BOARD_SIZE )
            return true;

        return false;
    }

    isValidAndFree() {
        return this.isValid() && this.isFree();
    }

    isInValidOrOccupied() {
        return !this.isValid() || !this.isFree();
    }

    set(stone) {
        this.grid.set(this, stone);
    }

    isWhite() {
        return this.is(TILE_WHITE);
    }

    isBlack() {
        return this.is(TILE_BLACK);
    }

    setWhite() {
        this.set(TILE_WHITE);
    }

    setBlack() {
        this.set(TILE_BLACK);
    }

    setFree() {
        this.set(TILE_FREE);
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

    toString() {
        const ret = "[" + this.x + "," + this.y + "]";
        return ret;
    }

    static of(x, y) {
        return new Position(x, y);
    }

    isInExtendedNeighborhood() {
        let validNeighbors = Position.validNeighbors(this, true, false);
        for ( let i = 0; i < validNeighbors.length; i++ ) {
            if ( !validNeighbors[i].isFree() ) {
                return true;
            }
        }

        return false;
    }
    
    static validNeighbors(p, extended, checkFree) {
        let neighbors = [
            Position.of(p.x-1, p.y-1),
            Position.of(p.x, p.y-1),
            Position.of(p.x+1, p.y-1),
            Position.of(p.x-1, p.y),
            Position.of(p.x+1, p.y),
            Position.of(p.x-1, p.y+1),
            Position.of(p.x, p.y+1),
            Position.of(p.x+1, p.y+1)
        ];

        if ( extended ) {
            let extendedNeighbors = [
                Position.of(p.x-2, p.y-2),
                Position.of(p.x-2, p.y-1),
                Position.of(p.x-2, p.y),
                Position.of(p.x-2, p.y+1),
                Position.of(p.x-2, p.y+2),
                Position.of(p.x-1, p.y-2),
                Position.of(p.x-1, p.y+2),
                Position.of(p.x, p.y-2),
                Position.of(p.x, p.y+2),
                Position.of(p.x+1, p.y-2),
                Position.of(p.x+1, p.y+2),
                Position.of(p.x+2, p.y-2),
                Position.of(p.x+2, p.y-1),
                Position.of(p.x+2, p.y),
                Position.of(p.x+2, p.y+1),
                Position.of(p.x+2, p.y+2),
            ];
            neighbors = neighbors.concat(extendedNeighbors);
        }

        let validNeighbors = [];
        neighbors.forEach((pos)=>{
            if ( pos.isValid() && (!checkFree || pos.isFree()) ) {
                    validNeighbors.push(pos);
            }
        });
        return validNeighbors;
    }

}

class Board {
    constructor() {
        this.grid = new Grid();
    }

    setStone(stone, p) {
        p.set(stone);
        game.renderer.drawStone(stone, p);
    }

    gameOver(stone) {
        let valuation = new Valuation(stone);
        return valuation.value() >= 10000;
    }
}

class Renderer {

    constructor() {
        this.board = document.getElementById("board");
        this.width = board.clientWidth;
        this.height = board.clientHeight;
        this.tileWidth = Math.round(this.width / BOARD_SIZE);
        this.tileHeight = Math.round(this.height / BOARD_SIZE);

    }

    drawBoard() {
        for ( let i=0; i < this.width-BOARD_SIZE; i += this.tileWidth) {
            for ( let j=0; j < this.height-BOARD_SIZE; j += this.tileHeight) {
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

    drawStone(stone, p) {
        let stoneElement = document.createElement("img");
    
        stoneElement.src = (stone == TILE_WHITE) ? "white-stone.png" : "black-stone.png";
        stoneElement.style.position = "absolute";
        stoneElement.style.left = p.x * this.tileWidth - Math.round(this.tileWidth/2)+1;
        stoneElement.style.top = p.y * this.tileHeight - Math.round(this.tileHeight/2)+1;
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

        return( Position.of(Math.round(x/10), Math.round(y/10)) );
    }
}

class CalculationResult {
    constructor(position, value) {
        this.position = position;
        this.value = value;
    }

    toString() {
        return position.toString() + " - " + value;
    }
}

class Calculator {
    constructor(color, firstInNeighborhood, calculateCounterMove) {
        this.color = color;
        this.firstWhite = firstInNeighborhood;
        this.calculateCounterMove = calculateCounterMove;
    }

    calculate(grid) {
        // workaround to prevent starting in upper left corner
        if ( this.firstWhite ) {
            this.firstWhite = false;
            return new CalculationResult(this.putInNeighborhood(), 0);
        }

        let resultPosition;
        let highestValue = -10000000;
        for ( let x = 1; x < BOARD_SIZE; x++) {
            for ( let y = 1; y < BOARD_SIZE; y++) {
                let p = new Position(x, y);
                if ( p.isFree() && p.isInExtendedNeighborhood()) {
                    p.set(this.color);
                    let value = (new Valuation(this.color)).value(); 

                    // calculate countermove
                    if ( this.calculateCounterMove ) {
                        let c = this.color == TILE_WHITE ? TILE_BLACK : TILE_WHITE;
                        let cmCalculator = new Calculator(c, false, false);
                        let cmResult = cmCalculator.calculate(grid);
                        value = value - cmResult.value;
                    }

                    // save highest score
                    if ( value > highestValue) {
                        //console.log("new highest of " + value + " for position " + p.toString());
                        highestValue = value;
                        resultPosition = p;
                    }
                    p.setFree();
                }
            }
        }

        let calculationResult = new CalculationResult(resultPosition, highestValue);
        //console.log(calculationResult);
        return calculationResult;
    }

    putInNeighborhood() {
        console.log("putInNeighborhood called");
        for ( let x = 1; x < BOARD_SIZE; x++) {
            for ( let y = 1; y < BOARD_SIZE; y++) {
                let p = new Position(x, y);
                if ( p.isBlack() ) {
                    let vn = Position.validNeighbors(p, true, true);
                    let i = Math.floor(Math.random() * vn.length);
                    return vn[i];
                }
            }
        }
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

    isFive() {
        return this.length >= 5;
    }

    isXOpen(len) {
        return this.length == len
            && this.getEndPosition().next(this.direction).isValidAndFree() 
            && this.position.prior(this.direction).isValidAndFree();
    }

    isXHalfOpen(len) {
        if ( this.length != len ) {
            return false;
        }

        return (this.getEndPosition().next(this.direction).isValidAndFree() 
                && this.position.prior(this.direction).isInValidOrOccupied())
            || (this.getEndPosition().next(this.direction).isInValidOrOccupied() 
                && this.position.prior(this.direction).isValidAndFree());
    }
    
    isFourOpen() {
        return this.isXOpen(4);
    }

    isFourHalfOpen() {
        return this.isXHalfOpen(4);
    }
    
    isThreeOpen() {
        return this.isXOpen(3);
    }

    isThreeHalfOpen() {
        return this.isXHalfOpen(3);
    }

    isTwoOpen() {
        return this.isXOpen(2);
    }

    isTwoHalfOpen() {
        return this.isXHalfOpen(2);
    }

    isNeighbor() {
        return false;
    }

    toString() {
        return "Position: " + this.position.toString() + " direction=" + this.direction + " color=" + this.color + " length=" + this.length;
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

        this.valuate();
    }

    valuate() {
        let g = game.board.grid;
        for ( let x = 1; x < BOARD_SIZE; x++ ) {
            for ( let y = 1; y < BOARD_SIZE; y++ ) {
                let p = new Position(x,y);
                if ( p.is(this.color) ) {
                    Valuation.getPaths(p, this.color).forEach((path)=>{
                        //console.log(path);
                        if ( path.isFive() )
                            this.five++;
                        else if ( path.isFourOpen() )
                            this.fourOpen++;
                        else if ( path.isFourHalfOpen() )
                            this.fourHalfOpen++;
                        else if ( path.isThreeOpen() )
                            this.threeOpen++;
                        else if ( path.isThreeHalfOpen() )
                            this.threeHalfOpen++;
                        else if ( path.isTwoOpen() )
                            this.twoOpen++;
                        else if ( path.isTwoHalfOpen() )
                            this.twoHalfOpen++;
                        else if ( path.isNeighbor() )
                            this.neighbor++;
                    });
                }
            }
        }
    }

    value() {
        return this.five * 10000
            + this.fourOpen * 1000
            + this.fourHalfOpen * 100
            + this.threeOpen * 10
            + this.threeHalfOpen * 5
            + this.twoOpen * 3
            + this.twoHalfOpen * 2
            + this.neighbor * 1;
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