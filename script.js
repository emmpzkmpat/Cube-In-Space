const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajuste del tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Tamaño y velocidad del jugador y las figuras
const playerSize = 20;
const obstacleSize = 60;
const distractorSize = 2; // Tamaño de los distractores
const playerSpeed = 50;
const obstacleSpeed = 20;
const spawnInterval = 140; // Intervalo de aparición de obstáculos en milisegundos
const distractorInterval = 10; // Intervalo de aparición de distractores

const gameAreaHeight = canvas.height * 0.87; // Altura del área de juego (60% del canvas)
const gameAreaY = (canvas.height - gameAreaHeight) / 2; // Coordenada Y de la zona de juego

let player = {
    x: 50,
    y: canvas.height / 2 - playerSize / 2,
    width: playerSize,
    height: playerSize,
    dy: 0
};

let obstacles = [];
let distractors = [];
let score = 0;
let lastObstacleSpawnTime = 0;
let lastDistractorSpawnTime = 0;
let gameRunning = true;
let highScore = 0; // Para almacenar el récord más alto

// Función para dibujar los objetos
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el área de juego (opcional, para visualización)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, gameAreaY, canvas.width, gameAreaHeight);

    // Dibujar el jugador
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Dibujar los obstáculos
    ctx.fillStyle = 'red';
    for (const obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Dibujar los distractores
    ctx.fillStyle = 'gray';
    for (const distractor of distractors) {
        ctx.fillRect(distractor.x, distractor.y, distractor.width, distractor.height);
    }

    // Mostrar el marcador
    document.getElementById('score').textContent = `Tiempo: ${Math.floor(score / 1000)}`;
}

// Función para mover los objetos
function move() {
    // Mover obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obstacle = obstacles[i];
        obstacle.x -= obstacleSpeed;

        // Eliminar obstáculos fuera de la pantalla
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
        }

        // Detectar colisiones
        if (collisionDetection(player, obstacle)) {
            gameRunning = false; // Termina el juego si hay colisión
        }
    }

    // Mover distractores
    for (let i = distractors.length - 1; i >= 0; i--) {
        let distractor = distractors[i];
        distractor.x -= obstacleSpeed;

        // Eliminar distractores fuera de la pantalla
        if (distractor.x + distractor.width < 0) {
            distractors.splice(i, 1);
        }
    }

    // Actualizar el puntaje
    if (gameRunning) {
        score += 16; // Incremento del puntaje (16 ms * 60 fps = 960 ms = 1 segundo aproximadamente)
    }
}

// Función de detección de colisiones
function collisionDetection(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Función para generar obstáculos
function spawnObstacle() {
    const y = Math.random() * (gameAreaHeight - obstacleSize) + gameAreaY;
    obstacles.push({
        x: canvas.width,
        y: y,
        width: obstacleSize,
        height: obstacleSize
    });
}

// Función para generar distractores
function spawnDistractor() {
    const y = Math.random() * (gameAreaHeight - distractorSize) + gameAreaY;
    distractors.push({
        x: canvas.width,
        y: y,
        width: distractorSize,
        height: distractorSize
    });
}

// Función para manejar el movimiento del jugador
function handleMovement(event) {
    if (event.key === 'ArrowUp' || event.touches) {
        player.dy = -playerSpeed;
    } else if (event.key === 'ArrowDown') {
        player.dy = playerSpeed;
    }
}

// Función para manejar eventos táctiles
function handleTouch(event) {
    const touchY = event.touches[0].clientY;
    if (touchY < player.y) {
        player.dy = -playerSpeed;
    } else if (touchY > player.y + player.height) {
        player.dy = playerSpeed;
    }
}

// Función para actualizar la posición del jugador
function updatePlayerPosition() {
    player.y += player.dy;

    // Limitar el movimiento del jugador dentro del área de juego
    if (player.y < gameAreaY) player.y = gameAreaY;
    if (player.y + player.height > gameAreaY + gameAreaHeight) player.y = gameAreaY + gameAreaHeight - player.height;

    // Detener el movimiento cuando se sueltan las teclas o el evento táctil
    player.dy = 0;
}

// Función para iniciar el juego
function startGame() {
    document.getElementById('score').textContent = 'Tiempo: 0';
    score = 0;
    obstacles = [];
    distractors = [];
    gameRunning = true;
    lastObstacleSpawnTime = Date.now();
    lastDistractorSpawnTime = Date.now();
    gameLoop();
}

// Bucle principal del juego
function gameLoop() {
    if (gameRunning) {
        draw();
        move();
        updatePlayerPosition();

        const now = Date.now();

        // Generar nuevos obstáculos
        if (now - lastObstacleSpawnTime > spawnInterval) {
            spawnObstacle();
            lastObstacleSpawnTime = now;
        }

        // Generar nuevos distractores
        if (now - lastDistractorSpawnTime > distractorInterval) {
            spawnDistractor();
            lastDistractorSpawnTime = now;
        }

        requestAnimationFrame(gameLoop);
    } else {
        // Mostrar mensaje de Game Over
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);

        // Mostrar mensaje de nuevo récord si aplica
        if (Math.floor(score / 1000) >= 65) {
            ctx.font = '24px Arial';
            ctx.fillText('¡Felicidades, Nuevo Récord de Jugador!', canvas.width / 2, canvas.height / 2 + 50);
        }
    }
}

// Manejar entrada del teclado
document.addEventListener('keydown', (event) => {
    handleMovement(event);
});

// Manejar entrada táctil
canvas.addEventListener('touchmove', (event) => {
    handleTouch(event);
});

// Iniciar el juego
startGame();