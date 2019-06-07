// Get elements
const canvas = document.querySelector('#canvas');
const particleButtons = document.querySelectorAll('.tool-button');

// Canvas stuff
let canvasWidth = canvas.offsetWidth;
let canvasHeight = canvas.offsetHeight;
const ctx = canvas.getContext('2d');

// Some things for defining the canvas space
let pixelsPerUnit = canvasWidth / 10;

// Timing variables
const fps = 30;
const interval = 1000 / fps;
let delta = 0;
let currentTime = 0;
let lastTime = 0;
let intervalSeconds = 1.0 / 1000 * interval;

// Input variables
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

// The particle images
const pImages = [
  new Image(),
  new Image(),
  new Image(),
];
pImages[0].src = 'img/sparkle.png';
pImages[1].src = 'img/smoke.png';
pImages[2].src = 'img/flame.png';

// The list of particles
let particles = [];

// Particle objects
const PSparkle = function (x, y) {
  this.img = pImages[0];
  this.name = 'Smoke';

  this.x = x;
  this.y = y;

  this.minSize = 0.3;
  this.maxSize = 1;
  this.size = 0.5;

  this.minSizeDelta = -1;
  this.maxSizeDelta = 1;
  this.sizeDelta = 0;

  this.totalLife = 1.0;
  this.life = 0;

  this.minXVel = -2;
  this.maxXVel = 2;
  this.minYVel = -2;
  this.maxYVel = 2;

  this.minRot = 0;
  this.maxRot = 0;

  this.xVel = 0;
  this.yVel = 0;

  this.blendMode = 'lighter';
}

const PSmoke = function (x, y) {
  this.img = pImages[1];
  this.name = 'Smoke';

  this.x = x;
  this.y = y;

  this.minSize = 0.3;
  this.maxSize = 0.7;
  this.size = 0.5;

  this.minSizeDelta = 1;
  this.maxSizeDelta = 3;
  this.sizeDelta = 0;

  this.totalLife = 1.0;
  this.life = 0;

  this.minXVel = -2;
  this.maxXVel = 2;
  this.minYVel = -2;
  this.maxYVel = 2;

  this.minRot = -80;
  this.maxRot = 80;

  this.xVel = 0;
  this.yVel = 0;

  this.blendMode = 'screen';
}

const PFlame = function (x, y) {
  this.img = pImages[2];
  this.name = 'Flame';

  this.x = x;
  this.y = y;

  this.minSize = 1;
  this.maxSize = 2;
  this.size = 2;

  this.minSizeDelta = -2;
  this.maxSizeDelta = 0;
  this.sizeDelta = 0;

  this.totalLife = 1.0;
  this.life = 0;

  this.minXVel = -1;
  this.maxXVel = 1;
  this.minYVel = -4;
  this.maxYVel = -2;

  this.minRot = -90;
  this.maxRot = 90;

  this.xVel = 0;
  this.yVel = 0;

  this.blendMode = 'lighter';
}

let currentParticle = 0;
const allParticles = [
  PSparkle,
  PSmoke,
  PFlame,
];

// Call this one window resize to fix things
function resizeCanvas () {
  canvasWidth = canvas.offsetWidth;
  canvasHeight = canvas.offsetHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  pixelsPerUnit = canvasWidth / 10;
}

// Call once at start to init everything
function init () {
  resizeCanvas();
}

// The game loop, where the magic happens
function gameLoop () {
  window.requestAnimationFrame(gameLoop);

  // Timing
  let currentTime = (new Date()).getTime();
  let delta = (currentTime - lastTime);

  if (delta > interval) {
    update();
    render();

    lastTime = currentTime - (delta % interval);
  }
}

function getRandom (min, max) {
  return (Math.random() * (max - min) + min);
}

function update () {
  if (mouseDown) {
    let particle = new allParticles[currentParticle](mouseX, mouseY);
    particle.xVel = getRandom(particle.minXVel, particle.maxXVel);
    particle.yVel = getRandom(particle.minYVel, particle.maxYVel);

    particle.rotation = getRandom(particle.minRot, particle.maxRot);
    particle.rotVel = getRandom(particle.minRot, particle.maxRot);

    particle.size = getRandom(particle.minSize, particle.maxSize);
    particle.sizeDelta = getRandom(particle.minSizeDelta, particle.maxSizeDelta);

    particles.push(particle);
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].x += particles[i].xVel * intervalSeconds * pixelsPerUnit;
    particles[i].y += particles[i].yVel * intervalSeconds * pixelsPerUnit;
    particles[i].rotation += particles[i].rotVel * intervalSeconds;
    particles[i].size += particles[i].sizeDelta * intervalSeconds;
    particles[i].size = Math.max(0, particles[i].size);

    if (particles[i].life += intervalSeconds) {
      if (particles[i].life >= particles[i].totalLife) {
        particles.splice(i, 1);
      }
    }
  }
}

// Render cycle
function render () {
  // Clear everything
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < particles.length; i++) {
    let size = particles[i].size * pixelsPerUnit;
    let alpha = 1.0 - particles[i].life / particles[i].totalLife;

    let oldMode = ctx.globalCompositeOperation;

    ctx.globalCompositeOperation = particles[i].blendMode;
    ctx.globalAlpha = alpha;

    ctx.save();
    ctx.translate(particles[i].x, particles[i].y);
    ctx.rotate(particles[i].rotation * Math.PI / 180);

    ctx.fillStyle = 'red';

    ctx.drawImage(particles[i].img, -size / 2, -size / 2, size, size);

    ctx.restore();

    ctx.globalCompositeOperation = oldMode;
    ctx.globalAlpha = 1;
  }
}

// Add some event listeners
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('mousedown', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouseDown = true;
});
canvas.addEventListener('mouseup', (e) => {
  mouseDown = false;
});
canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

canvas.addEventListener('touchstart', (e) => {
  let touch = e.touches[0];
  mouseX = touch.pageX;
  mouseY = touch.pageY;
  mouseDown = true;

  preventDefault();
});
canvas.addEventListener('touchend', (e) => {
  mouseDown = true;

  preventDefault();
});
canvas.addEventListener('touchmove', (e) => {
  let touch = e.touches[0];
  mouseX = touch.pageX;
  mouseY = touch.pageY;

  preventDefault();
});

for (let i = 0; i < particleButtons.length; i++) {
  particleButtons[i].addEventListener('click', () => {
    currentParticle = i;
  });
}

// Init things
init();

// Run the first game loop
gameLoop();
