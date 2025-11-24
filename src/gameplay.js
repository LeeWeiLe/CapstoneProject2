// ======================================== PINBALL GAME ========================================

// ===== CONFIG =====
const CONFIG = {
  canvas: { w:500, h:700 },
  ball: { r:10, minVel:5, maxVel:20, g:0.2, damp:0.9},
  spawn: { x:475, y:620 },
  flipper: { length:90, width:12, 
    leftrestAng:25, leftactiveAng:-25, // left flipper angles
    rightrestAng:180-25, rightactiveAng:180+25, // right flipper angles
    speed:0.25, y:620, leftX:150, rightX:350 
  },
  rectWalls: [
    { x:20, y:300, w:30, h:300 },  // left side wall
    { x:435, y:300, w:30, h:300 }  // right side wall
  ],
  ramps: [ // tilted walls
    { x: 50, y: 620 - 34, len:120, angDeg: 20,  th:12, side:'left'  }, 
    { x: 435, y: 620 - 34, len:120, angDeg:180-20,  th:12, side:'right' }, 
    { x: 500, y: 300, len:120, angDeg:260,  th:12, side:'right' }
  ],
  pointballs: [ 
    { x:250, y:260, r:26, points:100, color:'#ff4d4d', cooldown:350, lastHit:0 },
    { x:200, y:180, r:20, points:50, color:'#ffd24d', cooldown:300, lastHit:0 },
    { x:300, y:180, r:20, points:50, color:'#4dd2ff', cooldown:300, lastHit:0 }
  ]
};

// ===== STATE =====
const state = {
  ball: { x: CONFIG.spawn.x, y: CONFIG.spawn.y, vx:0, vy:0 },
  charging:false, launched:false, power:0,
  leftActive:false, rightActive:false,
  leftFlipper:{ angle:CONFIG.flipper.leftrestAng, target:CONFIG.flipper.leftrestAng },
  rightFlipper:{ angle:CONFIG.flipper.rightrestAng, target:CONFIG.flipper.rightrestAng },
  score:0
};

// ===== DOM =====
const canvas = document.getElementById('gaming_area');
canvas.width = CONFIG.canvas.w; canvas.height = CONFIG.canvas.h;
const ctx = canvas.getContext('2d');
const powerFill = document.getElementById('powerFill');
const scoreEl = document.getElementById('score');


// ===== INPUT =====
document.addEventListener('keydown', e=>{
  if (e.code==='Space' && !state.charging && !state.launched) { state.charging=true; state.power=0; }
  if (e.code==='ArrowLeft') state.leftActive = true;
  if (e.code==='ArrowRight') state.rightActive = true;
});
document.addEventListener('keyup', e=>{
  if (e.code==='Space' && state.charging) launchBall();
  if (e.code==='ArrowLeft') state.leftActive = false;
  if (e.code==='ArrowRight') state.rightActive = false;
});

setInterval(()=>{ if (state.charging){ state.power = Math.min(1, state.power + 0.05); powerFill.style.width = (state.power*100)+'%'; } }, 50);

// ===== UTIL: line-segment closest point =====
function closestPointOnSegment(ax,ay,bx,by,px,py){
  const vx = bx-ax, vy = by-ay, l2 = vx*vx + vy*vy;
  if (l2===0) return {x:ax,y:ay,t:0};
  let t = ((px-ax)*vx + (py-ay)*vy)/l2;
  t = Math.max(0, Math.min(1,t));
  return { x: ax + t*vx, y: ay + t*vy, t };
}
function reflect(vx,vy,nx,ny){ const d = vx*nx + vy*ny; return { vx: vx - 2*d*nx, vy: vy - 2*d*ny }; }
function now(){ return performance.now(); }

// ===== LAUNCH / RESET =====
function launchBall(){
  state.launched = true; state.charging = false;
  const vel = CONFIG.ball.minVel + state.power * (CONFIG.ball.maxVel - CONFIG.ball.minVel);
  state.ball.vx = 0; state.ball.vy = -vel; state.power = 0; powerFill.style.width='0%';
}
function resetBall(){
  state.ball = { x:CONFIG.spawn.x, y:CONFIG.spawn.y, vx:0, vy:0 };
  state.launched = false; state.power = 0; powerFill.style.width='0%';
}

// ===== DRAW =====
function drawRectWalls(){
  ctx.fillStyle = '#444';
  CONFIG.rectWalls.forEach(w=> ctx.fillRect(w.x, w.y, w.w, w.h));
}
function drawRamps(){
  ctx.fillStyle = '#666';
  CONFIG.ramps.forEach(r=>{
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angDeg * Math.PI/180);
    ctx.fillRect(0, -r.th/2, r.len, r.th);
    ctx.restore();
  });
}
function drawFlippers(){
  const f = CONFIG.flipper;
  // left flipper pivot at leftX, draw from 0->len (same style as before)
  ctx.save();
  ctx.translate(f.leftX, f.y);
  ctx.rotate(state.leftFlipper.angle * Math.PI/180);
  ctx.fillStyle='#ff9900';
  ctx.fillRect(0, -f.width/2, f.length, f.width);
  ctx.restore();

  ctx.save();
  ctx.translate(f.rightX, f.y);
  ctx.rotate(state.rightFlipper.angle * Math.PI/180);
  ctx.fillStyle='#ff9900';
  ctx.fillRect(0, -f.width/2, f.length, f.width);
  ctx.restore();
}
function drawPointBalls(){
  CONFIG.pointballs.forEach(b=>{
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.fillStyle = b.color; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  });
}
function drawBall(){
  const b = state.ball;
  ctx.beginPath();
  ctx.arc(b.x, b.y, CONFIG.ball.r, 0, Math.PI*2);
  ctx.fillStyle='#0df'; ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
}

function render(){
  ctx.clearRect(0,0,CONFIG.canvas.w,CONFIG.canvas.h);
  drawRectWalls(); drawRamps(); drawFlippers(); drawPointBalls(); drawBall();
}

// ===== COLLISIONS & PHYSICS =====
function handleRectWallCollision(){
  const b = state.ball, r = CONFIG.ball;
  CONFIG.rectWalls.forEach(w=>{
    if (b.x + r.r > w.x && b.x - r.r < w.x + w.w &&
        b.y + r.r > w.y && b.y - r.r < w.y + w.h){
      // minimal overlap correction
      const ol = (b.x + r.r) - w.x;
      const or = (w.x + w.w) - (b.x - r.r);
      const ot = (b.y + r.r) - w.y;
      const ob = (w.y + w.h) - (b.y - r.r);
      const minO = Math.min(ol,or,ot,ob);
      if (minO===ol) { b.vx *= -r.damp; b.x = w.x - r.r; }
      else if (minO===or) { b.vx *= -r.damp; b.x = w.x + w.w + r.r; }
      else if (minO===ot) { b.vy *= -r.damp; b.y = w.y - r.r; }
      else { b.vy *= -r.damp; b.y = w.y + w.h + r.r; }
    }
  });
}
// ramps collision: treat ramp as thick line segment from p1->p2
function handleRampCollision(){
  const b = state.ball;
  CONFIG.ramps.forEach(r=>{
    const ang = r.angDeg * Math.PI/180;
    const x1 = r.x, y1 = r.y;
    const x2 = x1 + Math.cos(ang) * r.len, y2 = y1 + Math.sin(ang) * r.len;
    const cp = closestPointOnSegment(x1,y1,x2,y2,b.x,b.y);
    const dx = b.x - cp.x, dy = b.y - cp.y;
    const dist = Math.hypot(dx,dy);
    const minDist = CONFIG.ball.r + r.th/2;
    if (dist < minDist && dist>0){
      // push ball out
      const nx = dx / dist, ny = dy / dist;
      // reflect velocity and apply small boost away from ramp
      const refl = reflect(b.vx, b.vy, nx, ny);
      b.vx = refl.vx * 0.95; b.vy = refl.vy * 0.95;
      // correct position so it's not stuck
      b.x = cp.x + nx * minDist;
      b.y = cp.y + ny * minDist;
    }
  });
}

// flipper collision (approximate using closest point on flipper line)
function handleFlipperCollision(){
  const b = state.ball, fb = CONFIG.flipper;  // helper to process one flipper
  function proc(pivotX, pivotY, angleDeg, active){
    const ang = angleDeg * Math.PI/180;
    const x1 = pivotX, y1 = pivotY;
    const x2 = x1 + Math.cos(ang) * fb.length, y2 = y1 + Math.sin(ang) * fb.length;
    const cp = closestPointOnSegment(x1,y1,x2,y2,b.x,b.y);
    const dx = b.x - cp.x, dy = b.y - cp.y;
    const dist = Math.hypot(dx,dy);
    const minDist = CONFIG.ball.r + fb.width/2;
    if (dist < minDist && dist>0){
      const nx = dx/dist, ny = dy/dist;
      const refl = reflect(b.vx, b.vy, nx, ny);
      b.vx = refl.vx * (active?1.6:1.0);
      b.vy = refl.vy * (active?1.6:1.0);
      b.x = cp.x + nx*minDist; b.y = cp.y + ny*minDist;
    }
  }
  proc(CONFIG.flipper.leftX, CONFIG.flipper.y, state.leftFlipper.angle, state.leftActive);
  proc(CONFIG.flipper.rightX, CONFIG.flipper.y, state.rightFlipper.angle, state.rightActive);
}
function handlePointBalls(){
  const b = state.ball, nowT = now();
  CONFIG.pointballs.forEach(bumper=>{
    const dx = b.x - bumper.x, dy = b.y - bumper.y, dist = Math.hypot(dx,dy);
    const minDist = CONFIG.ball.r + bumper.r;
    if (dist < minDist){
      // prevent repeated scoring via cooldown
      if (nowT - bumper.lastHit > bumper.cooldown){
        bumper.lastHit = nowT;
        state.score += bumper.points;
        scoreEl.textContent = state.score;
      }
      // simple bounce away from pointball center
      const nx = dx / (dist || 1), ny = dy / (dist || 1);
      const refl = reflect(b.vx, b.vy, nx, ny);
      // apply stronger bounce from pointballs
      b.vx = refl.vx * 1.1;
      b.vy = refl.vy * 1.1;
      // push out so it doesn't stick
      b.x = bumper.x + nx * minDist;
      b.y = bumper.y + ny * minDist;
    }
  });
}

// ===== PHYSICS UPDATE =====
function updateFlippers(){
  const f = CONFIG.flipper;
  state.leftFlipper.target = state.leftActive ? f.leftactiveAng : f.leftrestAng;
  state.leftFlipper.angle += (state.leftFlipper.target - state.leftFlipper.angle) * f.speed;
  state.rightFlipper.target = state.rightActive ? f.rightactiveAng : f.rightrestAng;
  state.rightFlipper.angle += (state.rightFlipper.target - state.rightFlipper.angle) * f.speed;
}

function updateBall(){
  const b = state.ball, c = CONFIG.canvas, r = CONFIG.ball;
  b.x += b.vx; b.y += b.vy; b.vy += r.g;
  // side walls
  if (b.x - r.r < 0) { b.vx *= -r.damp; b.x = r.r; }
  if (b.x + r.r > c.w) { b.vx *= -r.damp; b.x = c.w - r.r; }
  if (b.y - r.r < 0) { b.vy *= -r.damp; b.y = r.r; }

  handleRectWallCollision();
  handleRampCollision();
  handleFlipperCollision();
  handlePointBalls();

  // floor -> reset
  if (b.y + r.r >= c.h) resetBall();
}

// ===== GAME LOOP =====
function loop(){
  render();
  updateFlippers();
  if (state.launched) updateBall();
  requestAnimationFrame(loop);
}

// start
loop();