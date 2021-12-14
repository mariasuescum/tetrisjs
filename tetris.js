//Get the canvas from the HTML
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
//Size of the matrix
const board = matrix(12, 20);
//Size of each square in the matrix
context.scale(20, 20);

//Create the matrix 
function matrix(w, h) {
    //start the array
    const matrix = [];
     //While h isnt 0 a new row full of 0's will appear. It's decrement, h++ would be increment
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
//Create tetris figures
function figures(type)
{
    if (type == 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type == 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type == 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type == 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type == 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type == 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type == 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

// Draw the matrix
function draw() {
    context.fillStyle = "lightblue"; // background color
    context.fillRect(0, 0, canvas.width, canvas.height); //color each square of the matrix
    drawMatrix(board, {x: 0, y: 0}); 
    drawMatrix(player.matrix, player.pos); //board determine position 
}


//Random figures and score
function figureRandom() {

    const pieces = 'TJLOSZI'; //figures
    player.matrix = figures(pieces[pieces.length * Math.random() | 0]);//Selects a random figure
    player.pos.y = 0; //position on y of the figure
    player.pos.x = (board[0].length / 2 | 0) -  //position on x of the figure
                   (player.matrix[0].length / 2 | 0);

    if (collide(board, player)) { // collision that finish the game

        board.forEach(row => row.fill(0));

        updateScore();

        alert("Su puntuación final es: " + player.score + " puntos");
        setInterval(function(){ 
        }); // alert when the game is over
        player.score = 0; // score starts at 0
    }

}
// Draw the figures in the matrix
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {  
        row.forEach((value, x) => {
            if (value !== 0) { // we check if the value isnt zero
                context.fillStyle = colors[value]; //if value not 0 we paint it accordingly to the colors given in the final 
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

//Collisions
function collide(board, player) {
    const m = player.matrix; //Determine the figure
    const o = player.pos; // determine it position 
    for (let y = 0; y < m.length; y++) { //iterate the figure position vertically
        for (let x = 0; x < m[y].length; x ++) { //do the same but horizontally
            if (m[y][x] !== 0 && //this check if the position of the figure isnt zero 
               (board[y + o.y] &&  //checks if rows exist
                board[y + o.y][x + o.x]) !== 0) { //to check collision with ano ther figures
                return true; //determine the limits to the figure
            }
        }
    }
    return false; // no collision
}
//Rows dissapear 
function disappear() {
    let rowCount = 1; 
    outer: for (let y = board.length -1; y > 0; --y) { //iterate over the whole board starting at the bottom
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] == 0) { //if theres a 0 then the row isnt full
                continue outer; //finish the actual iteration and start a new one
            }
        }

        const row = board.splice(y, 1)[0].fill(0); //if row is full, change the content of the array for 0 
        board.unshift(row);  //push the squares down when a row is eliminated
        y++;

        player.score += rowCount * 10; //score system
        rowCount *= 2;

    }

}

function merge(board, player) {   //This stick the figure final position to the board
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {  //this stick figure final position in the board
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse()); // with the reverse method rows are converted into columns    
    } else {
        matrix.reverse();
    }
}
//Figure fall
function playerDrop() {
    player.pos.y++; //move it down
    if (collide(board, player)) { //if theres a collision
        player.pos.y--; //figure cant keep going that side
        merge(board, player); //combine the figure with the board
        figureRandom(); // keep updating new random fingures
        disappear(); // update the board after figures disappear    
        updateScore(); //update score 

    }
    dropCounter = 0; //reset dropcounter 
}

function playerMove(offset) { //movement of the figure when falling 
    player.pos.x += offset;
    if (collide(board, player)) {
        player.pos.x -= offset;
    }
}

function playerRotate(dir) { //rotation of the figures
    const pos = player.pos.x; //position on x
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 500; //speed out figures drop
let lastTime = 0;

function update(time = 0) { //starts our game 
    const deltaTime = time - lastTime; 
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) { //this move our figure down y
        playerDrop();
    }
    lastTime = time;
    draw(); //draw is called
    requestAnimationFrame(update); 
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => { //teclas para mover las fichas
    if (event.key == "ArrowLeft" || event.key == "a") {
        playerMove(-1);
    } else if (event.key == "ArrowRight" || event.key == "d") {
        playerMove(1);
    } else if (event.key == "ArrowDown" || event.key == "s") {
        playerDrop();
    } else if (event.key == "q") {
        playerRotate(-1);
    } else if (event.key == "ArrowUp" || event.key == "w") {
        playerRotate(1);
    }
});

const colors = [ // colores figuras 
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

//starting values
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};
figureRandom();
updateScore();
update();
