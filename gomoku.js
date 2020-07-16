"use strict";

window.addEventListener("load", () => {
    let gridSize = 17;
    
    let board = document.getElementById("board");

    let width = board.clientWidth;
    let height = board.clientHeight;
    let tileWidth = Math.round(width / gridSize);
    let tileHeight = Math.round(height / gridSize);

    let setStone = (white, x, y) => {
        let stone = document.createElement("img");
    
        stone.src = white ? "white-stone.png" : "black-stone.png";
        stone.style.position = "absolute";
        stone.style.left = x * tileWidth - Math.round(tileWidth/2)+1;
        stone.style.top = y * tileHeight - Math.round(tileHeight/2)+1;
        stone.style.width = tileWidth;
        stone.style.height = tileHeight;
    
        board.appendChild(stone);
    }
    
    for ( let i=0; i < width-gridSize; i += tileWidth) {
        for ( let j=0; j < height-gridSize; j += tileHeight) {
            let tile = document.createElement("div");
            tile.style.position = "absolute";
            tile.style.left = i;
            tile.style.top = j;
            tile.style.width = tileWidth;
            tile.style.height = tileHeight;
            tile.style.border = "thin solid #000000"
            board.appendChild(tile);
        }
    }

    setStone(false, 5, 5);
    setStone(true, 4, 5);
    setStone(false, 5, 4);
    setStone(true, 4, 4);
    setStone(false, 4, 6);
    setStone(true, 5, 6);


});