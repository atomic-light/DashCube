const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const coin = document.getElementById("coin");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const gameContainer = document.getElementById("game");

// 🎵 Sounds
const jumpSound = new Audio("jump.mp3");
const pointSound = new Audio("point.mp3");
const gameOverSound = new Audio("gameover.mp3");

// 📦 Spielzustände
let posY = 50;
let velocityY = 0;
let gravity = -0.25;
let isJumping = false;
let gameOver = false;
let gameStarted = false;
let isDashing = false;
let rotation = 0;

const playerX = 50; // Spieler bleibt links
let gameSpeed = 2;

obstacleX = gameContainer.clientWidth;
coinX = gameContainer.clientWidth;
let coinY = 120;

let score = 0;
let highscore = parseInt(localStorage.getItem("highscore")) || 0;
highscoreDisplay.textContent = highscore;

function update() {
  if (!gameStarted || gameOver) return;

  velocityY += gravity;
  posY += velocityY;

  if (posY <= 50) {
    posY = 50;
    velocityY = 0;
    isJumping = false;
  }

  player.style.bottom = posY + "px";
  player.style.left = playerX + "px";

  moveObstacle();
  moveCoin();
  checkCollision();
  checkCoinCollision();

  requestAnimationFrame(update);
}

function moveObstacle() {
  obstacleX -= gameSpeed;

  if (obstacleX < -40) {
    obstacleX = gameContainer.clientWidth;
    score++;
    scoreDisplay.textContent = score;

    if (score > highscore) {
      highscore = score;
      highscoreDisplay.textContent = highscore;
      localStorage.setItem("highscore", highscore);
    }

    pointSound.currentTime = 0;
    pointSound.play();
  }

  obstacle.style.left = obstacleX + "px";
}

function moveCoin() {
  coinX -= gameSpeed;

  if (coinX < -20) {
    resetCoin();
  }

  coin.style.left = coinX + "px";
  coin.style.bottom = coinY + "px";
}

function resetCoin() {
  const maxJumpHeight = 130;
  const coinMin = 60;
  const coinMax = coinMin + maxJumpHeight - 20;

  const buffer = 50; // Mindestabstand zum Hindernis

  let validPosition = false;

  while (!validPosition) {
    coinX = gameContainer.clientWidth + Math.random() * 200; // Zufällige Position
    coinY = Math.floor(Math.random() * (coinMax - coinMin)) + coinMin;

    // Prüfen, ob der Coin nicht auf dem Hindernis liegt
    if (Math.abs(coinX - obstacleX) > buffer) {
      validPosition = true;
    }
  }
}


function checkCollision() {
  const playerBox = player.getBoundingClientRect();
  const obstacleBox = obstacle.getBoundingClientRect();

  const hit = !(
    playerBox.right < obstacleBox.left ||
    playerBox.left > obstacleBox.right ||
    playerBox.bottom < obstacleBox.top ||
    playerBox.top > obstacleBox.bottom
  );

  if (hit && !isDashing) {
    gameOver = true;
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    alert("💥 Game Over!\nDein Score: " + score);
  }
}

function checkCoinCollision() {
  const playerBox = player.getBoundingClientRect();
  const coinBox = coin.getBoundingClientRect();

  const collected = !(
    playerBox.right < coinBox.left ||
    playerBox.left > coinBox.right ||
    playerBox.bottom < coinBox.top ||
    playerBox.top > coinBox.bottom
  );

  if (collected) {
    score++;
    scoreDisplay.textContent = score;

    if (score > highscore) {
      highscore = score;
      highscoreDisplay.textContent = highscore;
      localStorage.setItem("highscore", highscore);
    }

    pointSound.currentTime = 0;
    pointSound.play();

    resetCoin();
  }
}

// ✨ Partikel horizontal (links vom Spieler)
function createParticle(x, y) {
  const particle = document.createElement("div");
  particle.classList.add("particle");
  particle.style.left = x + "px";
  particle.style.top = y + "px";
  gameContainer.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 400);
}

// 🎮 Steuerung
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted) {
      gameStarted = true;
      update();
      return;
    }

    if (!isJumping && !gameOver) {
      velocityY = 10;
      isJumping = true;
      jumpSound.currentTime = 0;
      jumpSound.play();
      rotation += 90;
      player.style.transform = `rotateZ(${rotation}deg)`;
    }
  }

  // For mouse click and touch input
  document.getElementById("game").addEventListener("click", () => {
    if (gameStarted) {
      jump();
    }
  });

  // For touch devices (mobile)
  document.getElementById("game").addEventListener("touchstart", (e) => {
    if (gameStarted) {
      jump();
      e.preventDefault(); // Verhindert Scrollen bei Touch
    }
  });

  // 💨 Dash (Welt wird schneller + Partikel nach links)
  if (e.code === "ShiftLeft" && !isDashing && gameStarted && !gameOver) {
    isDashing = true;
    const originalSpeed = gameSpeed;
    gameSpeed += 5;
    player.style.transform = `scale(1.1) rotateZ(${rotation}deg)`;


    const dashTrail = setInterval(() => {
      const playerBox = player.getBoundingClientRect();
      const gameBox = gameContainer.getBoundingClientRect();

      const x = playerBox.left - gameBox.left - 5; // links vom Spieler
      const y = playerBox.top - gameBox.top + playerBox.height / 2;

      createParticle(x, y);
    }, 30);

    setTimeout(() => {
      clearInterval(dashTrail);
      gameSpeed = originalSpeed;
      player.style.transform = `rotateZ(${rotation}deg)`; // wieder normal
      isDashing = false;
    }, 300);
  }
});

// ⏱️ Spieltempo steigt alle 10 Sekunden
setInterval(() => {
  if (gameStarted && !gameOver) {
    gameSpeed += 0.5;
    console.log("🚀 gameSpeed:", gameSpeed);
  }
}, 10000);

// Coin initial setzen
resetCoin();
