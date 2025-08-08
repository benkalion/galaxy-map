/* Star Wars Galaxy Map — V4
 * - Sectors as organic blobs
 * - Non-grid dynamic planet positions with clustering (top/right/bottom heavy)
 * - Initial zoom shows core; zoom-out clamped to grid
 */
const CANVAS = document.getElementById('map');
const ctx = CANVAS.getContext('2d', { alpha: false });
const coordsEl = document.getElementById('coords');

const DPR = Math.max(1, window.devicePixelRatio || 1);
let W = 0, H = 0;

// World coords in arbitrary units; grid is for orientation only
const GRID = { letters: 'CDEFGHIJKLMNOPQRSTU'.split(''), rows: 21 };
const BOUNDS = { minX: -240, maxX: 260, minY: -220, maxY: 230 }; // roughly poster aspect

const state = {
  cx: 0, cy: 0,
  scale: 1.2,
  planets: [],
  hoverId: null,
  selectedId: null,
};

// Colors
const SECTOR = {
  'Deep Core': 'rgba(255,255,255,0.25)',
  'Core': 'rgba(250,225,120,0.22)',
  'Colonies': 'rgba(255,180,120,0.18)',
  'Inner Rim': 'rgba(255,150,200,0.12)',
  'Expansion Region': 'rgba(170,255,210,0.10)',
  'Mid Rim': 'rgba(120,210,255,0.10)',
  'Outer Rim': 'rgba(140,200,255,0.07)',
  'Unknown Regions': 'rgba(200,160,255,0.08)'
};
const LABEL = {
  'Deep Core': 'rgba(255,255,255,0.95)',
  'Core': 'rgba(255,245,200,0.95)',
  'Colonies': 'rgba(255,220,180,0.95)',
  'Inner Rim': 'rgba(255,200,230,0.95)',
  'Expansion Region': 'rgba(215,255,235,0.95)',
  'Mid Rim': 'rgba(200,240,255,0.95)',
  'Outer Rim': 'rgba(255,230,210,0.95)',
  'Unknown Regions': 'rgba(230,210,255,0.95)',
  default: 'rgba(231,241,255,0.95)'
};

// Load
fetch('planets.json').then(r => r.json()).then(data => {
  state.planets = data;
  // Initial camera: zoomed into core
  state.cx = -20;
  state.cy = 0;
  state.scale = 1.8;
  resize();
  render();
  buildList();
});

// Resize
function resize() {
  const rect = CANVAS.getBoundingClientRect();
  CANVAS.width = Math.floor(rect.width * DPR);
  CANVAS.height = Math.floor(rect.height * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  W = rect.width; H = rect.height;
  render();
}
window.addEventListener('resize', resize);

// World <-> Screen
function worldToScreen(x, y) {
  return [(x - state.cx) * state.scale + W/2, (y - state.cy) * state.scale + H/2];
}
function screenToWorld(x, y) {
  return [(x - W/2)/state.scale + state.cx, (y - H/2)/state.scale + state.cy];
}

// Render
function render(){
  drawBackground();
  drawSectorBlobs();
  drawGrid();
  drawPlanets();
  drawLabels();
}

function drawBackground(){
  ctx.clearRect(0,0,W,H);
  // deep vignette
  const g = ctx.createRadialGradient(W*0.52,H*0.47,10,W*0.5,H*0.5,Math.max(W,H)*0.9);
  g.addColorStop(0,'rgba(25,50,110,0.25)');
  g.addColorStop(1,'rgba(0,0,0,0.92)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
  // starfield + spiral hints
  const rng = mulberry32(9001);
  ctx.save();
  for (let i=0;i<350;i++){
    const x = rng()*W, y = rng()*H, r = Math.max(0.3, rng()*1.4);
    ctx.fillStyle = `rgba(240,250,255,${0.25 + rng()*0.6})`;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    if (rng() > 0.9){
      ctx.globalAlpha = 0.28;
      ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.strokeStyle='rgba(180,220,255,.35)'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y-5); ctx.lineTo(x,y+5); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
  // scanlines
  ctx.globalAlpha = .05;
  for (let y=0; y<H; y+=3){ ctx.fillStyle = '#000'; ctx.fillRect(0,y,W,1); }
  ctx.globalAlpha = 1;
}

function drawSectorBlobs(){
  // Organic layers approximating the poster. We'll use parametric squished circles with noise.
  const [cx, cy] = worldToScreen(-10, 10);
  function blob(radius, sx, sy, jitter, fill){
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sx, sy);
    ctx.beginPath();
    const steps = 120;
    for (let i=0;i<=steps;i++){
      const t = (i/steps) * Math.PI*2;
      const jr = radius * (1 + jitter * noise2D(Math.cos(t), Math.sin(t)));
      const x = Math.cos(t) * jr;
      const y = Math.sin(t) * jr*0.85;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = fill; ctx.fill();
    ctx.restore();
  }
  blob(60, 0.75, 0.70, 0.06, SECTOR['Deep Core']);
  blob(100,0.90, 0.85, 0.07, SECTOR['Core']);
  blob(140,1.00, 0.95, 0.08, SECTOR['Colonies']);
  blob(170,1.05, 1.00, 0.09, SECTOR['Inner Rim']);
  blob(200,1.08, 1.03, 0.10, SECTOR['Expansion Region']);
  blob(240,1.10, 1.06, 0.10, SECTOR['Mid Rim']);
  blob(300,1.18, 1.10, 0.12, SECTOR['Outer Rim']);
  // Unknown Regions wedge on far left
  ctx.save();
  ctx.fillStyle = SECTOR['Unknown Regions'];
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(W*0.24,0);
  ctx.lineTo(W*0.30,H);
  ctx.lineTo(0,H);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawGrid(){
  // We show letters C..U across, 1..21 down.
  ctx.strokeStyle = 'rgba(150,165,190,0.22)';
  ctx.lineWidth = 1;
  const cols = GRID.letters.length;
  const rows = GRID.rows;

  // Convert world bounds to screen
  const [sx0, sy0] = worldToScreen(BOUNDS.minX, BOUNDS.minY);
  const [sx1, sy1] = worldToScreen(BOUNDS.maxX, BOUNDS.maxY);

  // verticals
  for(let c=0;c<=cols;c++){
    const wx = BOUNDS.minX + (c/cols)*(BOUNDS.maxX-BOUNDS.minX);
    const [x0,y0] = worldToScreen(wx, BOUNDS.minY);
    const [x1,y1] = worldToScreen(wx, BOUNDS.maxY);
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    if (c<cols){
      ctx.fillStyle = 'rgba(220,235,255,0.9)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(GRID.letters[c], x0+6, y0+6);
      ctx.fillText(GRID.letters[c], x0+6, y1-18);
    }
  }
  // horizontals
  for(let r=0;r<=rows;r++){
    const wy = BOUNDS.minY + (r/rows)*(BOUNDS.maxY-BOUNDS.minY);
    const [x0,y0] = worldToScreen(BOUNDS.minX, wy);
    const [x1,y1] = worldToScreen(BOUNDS.maxX, wy);
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    if (r<rows){
      ctx.fillStyle = 'rgba(220,235,255,0.9)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(String(r+1), x0+26, y0+6);
      ctx.fillText(String(r+1), x1-34, y0+6);
    }
  }

  // Coords readout
  CANVAS.onmousemove = (e)=>{
    const rect = CANVAS.getBoundingClientRect();
    const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const col = Math.min(cols-1, Math.max(0, Math.floor((wx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*cols)));
    const row = Math.min(rows-1, Math.max(0, Math.floor((wy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*rows)));
    coordsEl.textContent = `${GRID.letters[col]}-${row+1}`;
  };
}

function drawPlanets(){
  for (const p of state.planets){
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -40 || sy < -40 || sx > W+40 || sy > H+40) continue;
    const isSel = state.selectedId === p.id;
    const isHover = state.hoverId === p.id;
    const size = 4.8;
    ctx.beginPath();
    ctx.fillStyle = LABEL[p.region] || LABEL.default;
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
    ctx.arc(sx, sy, size, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    if (isSel || isHover){
      ctx.beginPath(); ctx.lineWidth = isSel ? 2 : 1;
      ctx.strokeStyle = isSel ? '#ffe45a' : '#58c3ff';
      ctx.arc(sx, sy, size + (isSel ? 6 : 4), 0, Math.PI*2); ctx.stroke();
    }
  }
}

function drawLabels(){
  ctx.save();
  ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textBaseline = 'top';
  for (const p of state.planets){
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -60 || sy < -60 || sx > W+60 || sy > H+60) continue;
    if (state.scale < 1.0 && !isImportant(p)) continue;
    const label = p.name;
    const ox = 8, oy = -2;
    ctx.strokeStyle = 'rgba(5,16,36,.95)'; ctx.lineWidth = 4;
    ctx.strokeText(label, sx+ox, sy+oy);
    ctx.fillStyle = LABEL[p.region] || LABEL.default;
    ctx.fillText(label, sx+ox, sy+oy);
  }
  ctx.restore();
}

function isImportant(p){
  const famous = new Set(['Coruscant','Tatooine','Naboo','Hoth','Endor','Dagobah','Mustafar','Bespin','Alderaan','Kamino','Jakku','Mandalore','Yavin IV','Scarif']);
  return famous.has(p.name);
}

// Interaction
let isDragging = false, lastX=0, lastY=0;
CANVAS.addEventListener('mousedown', e=>{ isDragging=true; lastX=e.clientX; lastY=e.clientY; });
window.addEventListener('mouseup', ()=> isDragging=false );
window.addEventListener('mousemove', e=>{
  if (isDragging){ const dx=e.clientX-lastX, dy=e.clientY-lastY; pan(dx,dy); lastX=e.clientX; lastY=e.clientY; }
  else {
    const rect = CANVAS.getBoundingClientRect();
    const id = pickPlanet(e.clientX-rect.left, e.clientY-rect.top);
    if (id !== state.hoverId){ state.hoverId = id; render(); }
  }
});
CANVAS.addEventListener('wheel', e=>{
  e.preventDefault();
  const rect = CANVAS.getBoundingClientRect();
  zoomAt(e.clientX-rect.left, e.clientY-rect.top, Math.sign(e.deltaY)<0 ? 1.1 : 0.9);
},{passive:false});
CANVAS.addEventListener('click', e=>{
  const rect = CANVAS.getBoundingClientRect();
  const id = pickPlanet(e.clientX-rect.left, e.clientY-rect.top);
  if (id != null) selectPlanetById(id);
});

// Touch
let touchState=null;
CANVAS.addEventListener('touchstart', e=>{
  if (e.touches.length===1){ const t=e.touches[0]; touchState={mode:'pan',lastX:t.clientX,lastY:t.clientY,time:Date.now()}; }
  else if (e.touches.length===2){ const [a,b]=e.touches; touchState={mode:'pinch',lastD:dist(a,b),anchor:mid(a,b)}; }
},{passive:true});
CANVAS.addEventListener('touchmove', e=>{
  if (!touchState) return;
  if (touchState.mode==='pan' && e.touches.length===1){
    const t=e.touches[0]; pan(t.clientX-touchState.lastX, t.clientY-touchState.lastY); touchState.lastX=t.clientX; touchState.lastY=t.clientY;
  } else if (touchState.mode==='pinch' && e.touches.length===2){
    const [a,b]=e.touches; const d=dist(a,b); const factor=d/(touchState.lastD||d);
    const rect = CANVAS.getBoundingClientRect(); const anchor=touchState.anchor||mid(a,b);
    zoomAt(anchor.x-rect.left, anchor.y-rect.top, factor); touchState.lastD=d;
  }
},{passive:true});
CANVAS.addEventListener('touchend', e=>{
  if (!touchState) return;
  if (touchState.mode==='pan' && e.touches.length===0){
    const dt = Date.now()-(touchState.time||0);
    if (dt<250){
      const rect = CANVAS.getBoundingClientRect();
      const id = pickPlanet((touchState.lastX||0)-rect.left, (touchState.lastY||0)-rect.top);
      if (id != null) selectPlanetById(id);
    }
  }
  if (e.touches.length===0) touchState=null;
});

function dist(a,b){ const dx=a.clientX-b.clientX, dy=a.clientY-b.clientY; return Math.hypot(dx,dy); }
function mid(a,b){ return {x:(a.clientX+b.clientX)/2, y:(a.clientY+b.clientY)/2}; }

function pan(dx,dy){ state.cx -= dx/state.scale; state.cy -= dy/state.scale; render(); }

function zoomAt(mx,my, factor){
  const [wx, wy] = screenToWorld(mx,my);
  state.scale *= factor;
  state.scale = Math.max(0.7, Math.min(2.5, state.scale)); // clamp: 0.7..2.5
  const [wx2, wy2] = screenToWorld(mx,my);
  state.cx += (wx - wx2); state.cy += (wy - wy2);
  render();
}

function pickPlanet(mx,my){
  let hitId=null, best=16;
  for (const p of state.planets){
    const [sx, sy] = worldToScreen(p.x, p.y);
    const d = Math.hypot(mx-sx,my-sy);
    if (d<best){ best=d; hitId=p.id; }
  }
  return hitId;
}

function selectPlanetById(id){
  state.selectedId = id;
  const p = state.planets.find(q=>q.id===id);
  if (p){ showDetails(p); announce(`${p.name}`); render(); }
}

function showDetails(p){
  const dlg = document.getElementById('detailDialog');
  document.getElementById('planetName').textContent = p.name;
  document.getElementById('planetRegion').textContent = p.region || '—';
  document.getElementById('planetSector').textContent = p.sector || '—';
  document.getElementById('planetFamous').textContent = p.famous || '—';
  document.getElementById('planetRoute').textContent = (p.tradeRoutes||[]).join(', ') || '—';
  document.getElementById('planetEra').textContent = p.era || '—';
  document.getElementById('planetNotes').textContent = p.notes || '—';
  document.getElementById('planetCoords').textContent = `x ${p.x.toFixed(1)}, y ${p.y.toFixed(1)}`;
  if (typeof dlg.showModal === 'function'){ dlg.showModal(); }
}

// List/search
const searchEl = document.getElementById('search');
searchEl.addEventListener('input', refreshList);
document.getElementById('regionFilter').addEventListener('change', refreshList);
document.getElementById('eraFilter').addEventListener('change', refreshList);

function buildList(){ refreshList(); }

function refreshList(){
  const list = document.getElementById('planetList');
  list.innerHTML='';
  const q=(searchEl.value||'').trim().toLowerCase();
  const region=document.getElementById('regionFilter').value;
  const era=document.getElementById('eraFilter').value;

  const items = state.planets.filter(p=>{
    const okQ = !q || p.name.toLowerCase().includes(q);
    const okR = !region || p.region === region;
    const okE = !era || (p.era && p.era.includes(era));
    return okQ && okR && okE;
  }).sort((a,b)=>a.name.localeCompare(b.name));

  for (const p of items){
    const li=document.createElement('li');
    li.innerHTML=`<span>${p.name}</span><small>${p.region||''}</small>`;
    li.addEventListener('click',()=>{ flyTo(p.x,p.y,1.9); showDetails(p); });
    list.appendChild(li);
  }
}

function flyTo(x,y, targetScale){
  const steps=16;
  const start={cx:state.cx, cy:state.cy, scale:state.scale};
  const end={cx:x, cy:y, scale:Math.min(2.3, Math.max(state.scale, targetScale||state.scale))};
  let t=0;
  function step(){
    t++;
    const k = easeOutCubic(Math.min(1, t/steps));
    state.cx = start.cx + (end.cx - start.cx) * k;
    state.cy = start.cy + (end.cy - start.cy) * k;
    state.scale = start.scale + (end.scale - start.scale) * k;
    render(); if (t<steps) requestAnimationFrame(step);
  } step();
}
function easeOutCubic(x){ return 1 - Math.pow(1-x,3); }

function announce(msg){
  const toast=document.getElementById('toast');
  toast.textContent=msg; toast.style.opacity=1; setTimeout(()=>toast.style.opacity=0,1200);
}

// noise util for blobby edges
function noise2D(x,y){
  return Math.sin(x*2.3 + y*1.7) * Math.cos(x*1.1 - y*2.0) * 0.5;
}
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7, t|61); return ((t^t>>>14)>>>0)/4294967296; } }
