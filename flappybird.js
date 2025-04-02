let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let gameStarted = false;

let pipeInterval;
let backgroundMusic = new Audio("./bgm_mario.mp3");
let jumpSound = new Audio("./sfx_jump.mp3");
let scoreSound = new Audio("./sfx_point.mp3");

backgroundMusic.loop = true;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    document.getElementById("startButton").addEventListener("click", startGame);
    document.getElementById("retryButton").addEventListener("click", restartGame);
    document.addEventListener("keydown", handleKeyPress);
};

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameOver = false;
        score = 0;
        bird.y = birdY;
        velocityY = 0;
        pipeArray = [];

        document.getElementById("startButton").style.display = "none";
        document.getElementById("retryButton").style.display = "none";
        document.getElementById("gameOverText").style.display = "none";

        clearInterval(pipeInterval);
        pipeInterval = setInterval(placePipes, 1500);

        backgroundMusic.currentTime = 0;
        backgroundMusic.play();

        requestAnimationFrame(update);
    }
}

function update() {
    if (!gameStarted || gameOver) return;
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        endGame();
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            scoreSound.play();
        }

        if (detectCollision(bird, pipe)) {
            endGame();
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird() {
    if (!gameStarted || gameOver) return;
    velocityY = -6;
    jumpSound.play();
}

function handleKeyPress(e) {
    if (e.code === "Space") {
        if (!gameStarted) {
            startGame();
        } else if (gameOver) {
            restartGame();
        } else {
            moveBird();
        }
    }
}

function endGame() {
    gameOver = true;
    gameStarted = false;
    clearInterval(pipeInterval);

    backgroundMusic.pause();

    document.getElementById("retryButton").style.display = "block";
    document.getElementById("gameOverText").style.display = "block";
}

function restartGame() {
    document.getElementById("retryButton").style.display = "none";
    document.getElementById("gameOverText").style.display = "none";
    startGame();
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
