// Simple placeholder JS for galaxy rendering
const canvas = document.getElementById('galaxy-map');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawBackground() {
  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/1.2);
  grad.addColorStop(0, '#001030');
  grad.addColorStop(1, '#000010');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Stars
  for (let i=0; i<200; i++) {
    ctx.fillStyle = 'white';
    ctx.globalAlpha = Math.random();
    ctx.beginPath();
    ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*1.5, 0, Math.PI*2);
    ctx.fill();
  }
}
drawBackground();
