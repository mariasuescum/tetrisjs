//Get the canvas from the HTML
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
//Size of the matrix
const board = matrix(12, 20);
//Size of each square in the matrix
context.scale(20, 20);

//Create the matrix full of 0's
function matrix(w, h) {
    const matrix = [];
     //While h isnt 0 a new row full of 0's will appear. Its decrement h++ would be increment
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
// Draw the created matrix
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}
// Draw the figures
function draw() {
    context.fillStyle = 'lightblue';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(board, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

//Collisions
function collide(board, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] &&
                board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
//Rows dissapear 
function disappear() {
    var rowCount = 1; 
    outer: for (let y = board.length -1; y > 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;

        player.score += rowCount * 10; //score system
        rowCount *= 2;

    }

}

function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
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
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        playerReset();
        disappear();
        updateScore();

    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(board, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {

    const pieces = 'TJLOSZI';
    player.matrix = figures(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (board[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);

    if (collide(board, player)) {

        board.forEach(row => row.fill(0));

        updateScore();

        alert("Su puntuación final es: " + player.score + " puntos");
        setInterval(function(){

        });
        player.score = 0;
    }

}


function playerRotate(dir) {
    const pos = player.pos.x;
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
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    lastTime = time;
    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    event.preventDefault();

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

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

function playgameStart(){
    const player = {
        pos: {x: 0, y: 0},
        matrix: null,
        score: 0,
    };
    playerReset();
    updateScore();
    update();
};


const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};
