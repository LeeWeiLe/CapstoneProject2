const canvas = document.getElementById('gameCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let ball = { x: 300, y: 100, dx: 3, dy: 2, radius: 10, gravity: 0.2, bounce: -0.8 };
  let score = 0;

  function update() {
    ball.dy += ball.gravity;
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce walls
    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) ball.dx *= -1;
    if (ball.y < ball.radius) ball.dy *= ball.bounce;

    // Bottom reset
    if (ball.y > canvas.height - ball.radius) {
      ball.y = 100;
      ball.dy = 0;
      score = 0;
    }

    draw();
    requestAnimationFrame(update);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'cyan';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.fillText("Score: " + score, 10, 20);
  }

  update();
}
