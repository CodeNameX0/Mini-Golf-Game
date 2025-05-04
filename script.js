document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ball = {
    x: 100,
    y: 200,
    radius: 10,
    color: 'red',
    dx: 0,
    dy: 0,
    speed: 7, // 공의 기본 속도
  };

  const hole = {
    x: 700,
    y: 200,
    radius: 15,
    color: 'black',
  };

  const obstacles = [
    { x: 300, y: 150, width: 20, height: 100 },
    { x: 500, y: 250, width: 20, height: 100 },
  ];

  let score = 0;
  let level = 1;
  let keys = {};

  // 키보드 입력 처리
  document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
  });

  document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
  });

  function handleKeyboardInput() {
    if (keys['ArrowUp']) ball.dy = -ball.speed;
    if (keys['ArrowDown']) ball.dy = ball.speed;
    if (keys['ArrowLeft']) ball.dx = -ball.speed;
    if (keys['ArrowRight']) ball.dx = ball.speed;
  }

  // 터치 이벤트 처리
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const touchSpeedFactor = ball.speed / 50; // 터치 속도를 화살표 키 속도에 맞춤
    ball.dx = (mouseX - ball.x) * touchSpeedFactor;
    ball.dy = (mouseY - ball.y) * touchSpeedFactor;
  });

  function resetGame() {
    do {
      ball.x = Math.random() * (canvas.width - ball.radius * 2) + ball.radius;
      ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
    } while (
      obstacles.some((obstacle) =>
        ball.x + ball.radius > obstacle.x &&
        ball.x - ball.radius < obstacle.x + obstacle.width &&
        ball.y + ball.radius > obstacle.y &&
        ball.y - ball.radius < obstacle.y + obstacle.height
      )
    );

    ball.dx = 0;
    ball.dy = 0;

    do {
      hole.x = Math.random() * (canvas.width - hole.radius * 2) + hole.radius;
      hole.y = Math.random() * (canvas.height - hole.radius * 2) + hole.radius;
    } while (
      obstacles.some((obstacle) =>
        hole.x + hole.radius > obstacle.x &&
        hole.x - hole.radius < obstacle.x + obstacle.width &&
        hole.y + hole.radius > obstacle.y &&
        hole.y - hole.radius < obstacle.y + obstacle.height
      )
    );

    if (level % 2 === 0) {
      obstacles.push({
        x: Math.random() * (canvas.width - 90),
        y: Math.random() * (canvas.height - 120),
        width: 20,
        height: 100,
      });
    }

    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${score} | Level: ${level}`;
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
  }

  function drawHole() {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fillStyle = hole.color;
    ctx.fill();
    ctx.closePath();
  }

  function drawFlag() {
    const flagX = hole.x + hole.radius + 5;
    const flagY = hole.y - hole.radius - 10;

    ctx.beginPath();
    ctx.moveTo(flagX, hole.y);
    ctx.lineTo(flagX, flagY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(flagX, flagY);
    ctx.lineTo(flagX + 15, flagY + 5);
    ctx.lineTo(flagX, flagY + 10);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  }

  function drawObstacles() {
    obstacles.forEach((obstacle) => {
      ctx.fillStyle = 'blue';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  }

  function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 마찰 효과
    ball.dx *= 0.98;
    ball.dy *= 0.98;

    if (Math.abs(ball.dx) < 0.05) ball.dx = 0;
    if (Math.abs(ball.dy) < 0.05) ball.dy = 0;

    // 벽 충돌 처리
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.dx = -ball.dx;
    } else if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.dx = -ball.dx;
    }

    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.dy = -ball.dy;
    } else if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.dy = -ball.dy;
    }

    // 장애물 충돌 처리
    obstacles.forEach((obstacle) => {
      if (
        ball.x + ball.radius > obstacle.x &&
        ball.x - ball.radius < obstacle.x + obstacle.width &&
        ball.y + ball.radius > obstacle.y &&
        ball.y - ball.radius < obstacle.y + obstacle.height
      ) {
        if (ball.x < obstacle.x || ball.x > obstacle.x + obstacle.width) {
          ball.dx = -ball.dx;
          ball.x = ball.x < obstacle.x
            ? obstacle.x - ball.radius
            : obstacle.x + obstacle.width + ball.radius;
        }
        if (ball.y < obstacle.y || ball.y > obstacle.y + obstacle.height) {
          ball.dy = -ball.dy;
          ball.y = ball.y < obstacle.y
            ? obstacle.y - ball.radius
            : obstacle.y + obstacle.height + ball.radius;
        }
      }
    });

    // 홀에 들어갔는지 확인
    const dist = Math.sqrt((ball.x - hole.x) ** 2 + (ball.y - hole.y) ** 2);
    if (dist < ball.radius + hole.radius) {
      score += 10;
      level++;
      resetGame();
    }
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleKeyboardInput();
    drawHole();
    drawFlag();
    drawBall();
    drawObstacles();
    update();
    requestAnimationFrame(gameLoop);
  }

  resetGame();
  gameLoop();
});
