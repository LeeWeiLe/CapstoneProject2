// ======================================== QUESTION GAME ========================================

"use strict";

// --- UI gating (Question vs Pinball) ---
// (pinball permission is controlled by GameFSM state)
let buttonClickHandler = null;         // persistent handler reference across restarts
let QuestionNumber = 1;                // Start from question 1
let FinalScore = 0;                    // No difficulty selected at the start
let difficulty = 0;

const pinballCanvasEl  = document.getElementById('pinball_area');
const questionCanvasEl = document.getElementById('question_area');
const answerButtonsEl  = document.getElementById('answer_buttons');

// --- Finite State Machine (FSM) ---
// States: QUESTION (answering) -> PINBALL (playing) -> QUESTION ...
const GameFSM = {
    state: 'BOOT',
    enter: {},
    exit: {},
    transition(next, payload = {}) {
        if (this.state === next) return;
        if (this.exit[this.state]) this.exit[this.state](payload);
        this.state = next;
        if (this.enter[next]) this.enter[next](payload);
    },
    is(state) { return this.state === state; }
};

// Derive permissions from state (single source of truth)
function pinballEnabled() { return GameFSM.is('PINBALL'); }

// Robust show/hide without requiring CSS changes
function setHidden(el, hidden) {
    if (!el) return;
    el.style.display = hidden ? 'none' : 'block';
}

function showQuestionMode() {
    setHidden(questionCanvasEl, false);
    setHidden(answerButtonsEl, false);
    setHidden(pinballCanvasEl, true);
}

function showPinballMode() {
    setHidden(questionCanvasEl, true);
    setHidden(answerButtonsEl, true);
    setHidden(pinballCanvasEl, false);
}


// --- FSM enter/exit actions ---
GameFSM.enter.QUESTION = () => {
    showQuestionMode();
    QuestionGame();
};

GameFSM.enter.PINBALL = () => {
    showPinballMode();
    // pinball loop is already running; input & physics are gated by pinballEnabled()
};

GameFSM.enter.GAME_OVER = ({ finalScore } = {}) => {
    // Persist / display score handled elsewhere (existing code uses alert)
    showQuestionMode();
};

// Bootstrap: start in QUESTION state once DOM is ready
window.addEventListener('load', () => {
    GameFSM.transition('QUESTION');
});


function QuestionGame() { // code for the question game
    // Canvas setup
    const questioncanvas = document.getElementById('question_area');
    const questionctx = questioncanvas.getContext('2d');


    // QUESTION UI is shown by FSM on entry
    let difficulties_Choosen = false;
    let CorrectButton = '';
    let answer = '';
    // use to set canvas background image
    function setCanvasBackground(imagePath) {
        const img = new Image();
        img.onload = function() {
            questionctx.clearRect(0, 0, questioncanvas.width, questioncanvas.height);
            questionctx.drawImage(img, 0, 0, questioncanvas.width, questioncanvas.height);
        };
        img.src = imagePath;
    }
    
    // Example: Set an initial background for choosing difficulty
    setCanvasBackground('questions_bank/ChooseYourDifficulty.png');

    // use to select difficulty from each button
    function SelectDifficulty(buttonId) {
        switch (buttonId) {
            case 'btnA':
                difficulty = 1;
                alert('You have selected Easy difficulty!');
                break;
            case 'btnB':
                difficulty = 2;
                alert('You have selected Intermediate difficulty!');
                break;
            case 'btnC':
                difficulty = 3;
                alert('You have selected Hard difficulty!');
                break;
            case 'btnD':
                difficulty = 4;
                alert('You have selected Very Hard difficulty!');
                break;
            default:
                alert('No difficulty assigned?');
        }
        updatePointBallsForDifficulty(difficulty);
    }

    // use to search for questions when difficulties selected
    function SearchForQuestions(DifficultySelected, QuestionNumber) {
        if (DifficultySelected == 1) {
            setCanvasBackground(`questions_bank/Easy/Q${QuestionNumber}.png`);
            if (QuestionNumber == 1) {
                CorrectButton = 'btnC'; 
            } else if (QuestionNumber == 2) {
                CorrectButton = 'btnA'; 
            } else if (QuestionNumber == 3) {
                CorrectButton = 'btnD'; 
            } else if (QuestionNumber == 4) {
                CorrectButton = 'btnB'; 
            } else if (QuestionNumber == 5) {
                CorrectButton = 'btnB'; 
            } else {
                alert("Error: Difficulty Easy Question: Question number not found.");
            }
        } else if (DifficultySelected == 2) {
            setCanvasBackground(`questions_bank/Intermediate/Q${QuestionNumber}.png`);
            if (QuestionNumber == 1) {
                CorrectButton = 'btnC'; 
            } else if (QuestionNumber == 2) {
                CorrectButton = 'btnA'; 
            } else if (QuestionNumber == 3) {
                CorrectButton = 'btnD'; 
            } else if (QuestionNumber == 4) {
                CorrectButton = 'btnD'; 
            } else if (QuestionNumber == 5) {
                CorrectButton = 'btnA'; 
            } else {
                alert("Error: Difficulty Intermediate: Question number not found.");
            }
        } else if (DifficultySelected == 3) {
            setCanvasBackground(`questions_bank/Hard/Q${QuestionNumber}.png`);
            if (QuestionNumber == 1) {
                CorrectButton = 'btnC'; 
            } else if (QuestionNumber == 2) {
                CorrectButton = 'btnB'; 
            } else if (QuestionNumber == 3) {
                CorrectButton = 'btnA'; 
            } else if (QuestionNumber == 4) {
                CorrectButton = 'btnD'; 
            } else if (QuestionNumber == 5) {
                CorrectButton = 'btnC'; 
            } else {
                alert("Error: Difficulty Hard: Question number not found.");
            }
        } else if (DifficultySelected == 4) {
            setCanvasBackground(`questions_bank/Very_Hard/Q${QuestionNumber}.png`);
            if (QuestionNumber == 1) {
                CorrectButton = 'btnB'; 
            } else if (QuestionNumber == 2) {
                CorrectButton = 'btnB'; 
            } else if (QuestionNumber == 3) {
                CorrectButton = 'btnA'; 
            } else if (QuestionNumber == 4) {
                CorrectButton = 'btnD'; 
            } else if (QuestionNumber == 5) {
                CorrectButton = 'btnC'; 
            } else {
                alert("Error: Difficulty Very Hard: Question number not found.");
            }
        } else {
            alert("Error: Difficulty not selected properly.");
        }
    }

    // Remove any existing event listeners first
    document.querySelectorAll('.answer_buttons button').forEach(button => {
        button.removeEventListener('click', buttonClickHandler);
    });

    // Define the event handler function
    buttonClickHandler = function() {
        if (difficulties_Choosen) {  //user has answered the question 
            if (QuestionNumber == 5) {
                QuestionNumber = 1; //reset to question 1 after question 5
            } else {
                QuestionNumber += 1;
            }
            difficulties_Choosen = false;
            
            if (this.id === CorrectButton) {
                alert(`You have selected the correct answer! You can play the Pinball Game now!`);


                // Transition to PINBALL mode (questions hidden & pinball enabled)
                GameFSM.transition('PINBALL');
                // Clear everything from question game
                questionctx.clearRect(0, 0, questioncanvas.width, questioncanvas.height);
                
                // Remove all event listeners
                document.querySelectorAll('.answer_buttons button').forEach(button => {
                    button.removeEventListener('click', buttonClickHandler);
                });
                
            } else {
                if (CorrectButton === 'btnA') {
                    answer = 'A';
                } else if (CorrectButton === 'btnB') {
                    answer = 'B';
                } else if (CorrectButton === 'btnC') {
                    answer = 'C';
                } else if (CorrectButton === 'btnD') {
                    answer = 'D';
                }
                alert(`Wrong answer selected. The correct answer for this question is: ${answer}. `);
                setCanvasBackground('questions_bank/ChooseYourDifficulty.png');
            }
        } else {  //user has selected his desired difficulty
            difficulties_Choosen = true;
            SelectDifficulty(this.id);
            SearchForQuestions(difficulty, QuestionNumber);
            alert(`You have selected your difficulty for your question ${QuestionNumber}. Now answer the questions!`);
        }
    };

    // Add event listeners to buttons
    document.querySelectorAll('.answer_buttons button').forEach(button => {
        button.addEventListener('click', buttonClickHandler);
    });
    
    return;
}

showQuestionMode();
QuestionGame(); // Start with question 1



// ======================================== PINBALL GAME ========================================

// ===== CONFIG =====
const CONFIG = {
    canvas: { w:500, h:700 },
    ball: { r:10, minVel:5, maxVel:20, g:0.2, damp:0.9},
    spawn: { x:485, y:620 },
    flipper: { length:90, width:12, 
        leftrestAng:25, leftactiveAng:-25, // left flipper angles
        rightrestAng:180-25, rightactiveAng:180+25, // right flipper angles
        speed:0.25, y:630, leftX:140, rightX:340 
    },
    rectWalls: [
        { x:2, y:300, w:30, h:300 },  // left side wall
        { x:445, y:300, w:30, h:300 }  // right side wall
    ],
    ramps: [ // tilted walls
        { x: 30, y: 590, len:120, angDeg: 20,  th:12, side:'left'  }, 
        { x: 450, y: 590, len:120, angDeg:180-20,  th:12, side:'right' }, 
        { x: 504, y: 300, len:120, angDeg:260,  th:12, side:'upperright' }
    ],
    pointballs: [ 
        {   //small ball with high points
            x:250, y:260, r:20, 
            // Define points for each difficulty for this specific ball
            difficultyPoints: {1: 25, 2: 50, 3: 100, 4: 200}, 
            color:'#ff4d4d', 
            cooldown:350, 
            lastHit:0 
        },
        {   //large ball with small points
            x:200, y:180, r:30, 
            // Different points for this ball across difficulties
            difficultyPoints: {1: 5, 2: 10, 3: 20, 4: 40}, 
            color:'#ffd24d', 
            cooldown:300, 
            lastHit:0 
        },
        {   //large ball with small points
            x:300, y:180, r:30, 
            // Different points for this ball across difficulties
            difficultyPoints: {1: 5, 2: 10, 3: 20, 4: 40}, 
            color:'#4dd2ff', 
            cooldown:300, 
            lastHit:0 
        }
    ]
};

// Function to update point values based on difficulty
function updatePointBallsForDifficulty(diff) {
    // Using the difficultyPoints object in each pointball
    CONFIG.pointballs.forEach(ball => {
        // Set the current points based on the difficulty
        ball.points = ball.difficultyPoints[diff];
        
    });
    
    console.log(`Updated point balls for difficulty ${diff}:`, CONFIG.pointballs.map(b => b.points));
}

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
const pinballcanvas = document.getElementById('pinball_area');
const pinballctx = pinballcanvas.getContext('2d');
const powerFill = document.getElementById('powerFill');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('FinalScore');

// ===== INPUT =====
document.addEventListener('keydown', e=>{
    if (!pinballEnabled()) return;
    if (e.code==='ArrowDown' && !state.charging && !state.launched) { state.charging=true; state.power=0; }
    if (e.code==='ArrowLeft') state.leftActive = true;
    if (e.code==='ArrowRight') state.rightActive = true;
});
document.addEventListener('keyup', e=>{
    if (e.code==='ArrowDown' && state.charging) launchBall();
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
    if (!pinballEnabled()) return;
    state.launched = true; state.charging = false;
    const vel = CONFIG.ball.minVel + state.power * (CONFIG.ball.maxVel - CONFIG.ball.minVel);
    state.ball.vx = 0; state.ball.vy = -vel; state.power = 0; powerFill.style.width='0%';
}
function resetBall(){
    state.ball = { x:CONFIG.spawn.x, y:CONFIG.spawn.y, vx:0, vy:0 };
    state.launched = false; state.power = 0; powerFill.style.width='0%';
    state.score = 0; scoreEl.textContent = state.score;
}

// ===== DRAW =====
function drawRectWalls(){
    pinballctx.fillStyle = '#444';
    CONFIG.rectWalls.forEach(w=> pinballctx.fillRect(w.x, w.y, w.w, w.h));
}
function drawRamps(){
    pinballctx.fillStyle = '#666';
    CONFIG.ramps.forEach(r=>{
        pinballctx.save();
        pinballctx.translate(r.x, r.y);
        pinballctx.rotate(r.angDeg * Math.PI/180);
        pinballctx.fillRect(0, -r.th/2, r.len, r.th);
        pinballctx.restore();
    });
}
function drawFlippers(){
    const f = CONFIG.flipper;
    // left flipper pivot at leftX, draw from 0->len (same style as before)
    pinballctx.save();
    pinballctx.translate(f.leftX, f.y);
    pinballctx.rotate(state.leftFlipper.angle * Math.PI/180);
    pinballctx.fillStyle='#ff9900';
    pinballctx.fillRect(0, -f.width/2, f.length, f.width);
    pinballctx.restore();

    pinballctx.save();
    pinballctx.translate(f.rightX, f.y);
    pinballctx.rotate(state.rightFlipper.angle * Math.PI/180);
    pinballctx.fillStyle='#ff9900';
    pinballctx.fillRect(0, -f.width/2, f.length, f.width);
    pinballctx.restore();
}
function drawPointBalls(){
    CONFIG.pointballs.forEach(b=>{
        pinballctx.beginPath(); 
        pinballctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        // Use the color specified, or displayColor if you added that feature
        pinballctx.fillStyle = b.color; 
        pinballctx.fill();
        pinballctx.strokeStyle = '#fff'; 
        pinballctx.lineWidth = 2; 
        pinballctx.stroke();
        
        // Optional: Draw point value on the ball
        pinballctx.fillStyle = '#000';
        pinballctx.font = '12px Arial';
        pinballctx.textAlign = 'center';
        pinballctx.textBaseline = 'middle';
        pinballctx.fillText(b.points, b.x, b.y);
    });
}
function drawBall(){
    const b = state.ball;
    pinballctx.beginPath();
    pinballctx.arc(b.x, b.y, CONFIG.ball.r, 0, Math.PI*2);
    pinballctx.fillStyle='#0df'; pinballctx.fill();
    pinballctx.strokeStyle='#fff'; pinballctx.lineWidth=2; pinballctx.stroke();
}

function render(){
    pinballctx.clearRect(0,0,CONFIG.canvas.w,CONFIG.canvas.h);
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
    if (b.y + r.r >= c.h) 
    {
        alert("Game Over! Your final score is: " + state.score);
        FinalScore += state.score;
        finalScoreEl.textContent = FinalScore;
        console.log("Final Score after " + QuestionNumber +" pinball game: " + FinalScore);
        resetBall();
        
        GameFSM.transition('QUESTION');
    }
    
}

// ===== GAME LOOP =====
function loop(){
    render();
    updateFlippers();
    if (state.launched && pinballEnabled()) updateBall();
    requestAnimationFrame(loop);
}

// start
loop();

