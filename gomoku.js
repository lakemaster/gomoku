"use strict";

let game;

window.addEventListener("load", () => {

    game = new Game(17);
    game.start();


    game.renderer.board.addEventListener("click", function(event) {
        console.log(event);
        let pos = game.renderer.calcPosition(event);
        console.log(pos);

        if ( pos[0] > 0 && pos[1] > 0 ) {
            game.board.setStone(CrossState.black, pos[0], pos[1]);
        }
    })

});

class Game {
    constructor(gridSize) {
        this.board = new Board(gridSize);
        this.renderer = new Renderer(gridSize);
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
        if ( x <= 0 || x >= this.gridSize || y <= 0 || y >= this.gridSize) {
            alert("Error: (" + x + "," + y + ") out of range (" + this.gridSize + ")");
            return;
        }
        if ( this.grid[x][y] != CrossState.free ) {
            alert("Error: Position (" + x + "," + y + ") occupied");
            return;
        }
        this.grid[x][y] = stone;
        game.renderer.drawStone(stone, x, y);
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


