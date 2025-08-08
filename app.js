/* Star Wars Galaxy Map — V3
 * - Grid-driven placement C..U / 1..21
 * - Initial zoom: shows a partial galaxy; clamp zoom-out to grid
 * - Holo styling with spiral strokes & vignette
 * - Region blobs + tinted labels
 */
const CANVAS = document.getElementById('map');
const ctx = CANVAS.getContext('2d', { alpha: false });
const coordsEl = document.getElementById('coords');

const DPR = Math.max(1, window.devicePixelRatio || 1);
let W = 0, H = 0;

const GRID = { cols: 19, rows: 21, lettersStart: 'C'.charCodeAt(0) };

const state = {
  // We'll compute world bounds from grid (0..cols, 0..rows) scaled to pixels
  world: { minX: 0, minY: 0, maxX: GRID.cols, maxY: GRID.rows },
  cx: GRID.cols/2, cy: GRID.rows/2,
  scale: 60, // pixels per world unit; higher means more zoomed-in
  planets: [],
  hoverId: null,
  selectedId: null,
};

// Colors
const COLORS = {
  Core: '#7ecbff',
  'Mid Rim': '#8dffbc',
  'Outer Rim': '#ffbd8a',
  'Unknown Regions': '#b99bff',
  default: '#c7d2fe'
};

// Load data
fetch('planets.json').then(r => r.json()).then(data => {
  state.planets = data.map(p => withScreenMapping(p));
  // Start zoomed-in near the core
  state.cx = GRID.cols/2 + 1.2;
  state.cy = GRID.rows/2;
  state.scale = 95; // start zoomed in; see part of galaxy
  resize();
  render();
  buildList();
});

function withScreenMapping(p){
  // Convert grid cell (letter,row) to world coords.
  // We'll allow intra-cell offsets if provided.
  const col = (p.gridCol.charCodeAt(0) - GRID.lettersStart);
  const row = (p.gridRow - 1);
  const ox = p.offsetX || 0.5; // center within cell by default
  const oy = p.offsetY || 0.5;
  return { ...p, x: col + ox, y: row + oy };
}

// Resize
function resize() {
  const rect = CANVAS.getBoundingClientRect();
  W = Math.max(300, rect.width);
  H = Math.max(300, rect.height);
  CANVAS.width = Math.floor(W * DPR);
  CANVAS.height = Math.floor(H * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  render();
}
window.addEventListener('resize', resize);

// World <-> Screen
function worldToScreen(x, y) {
  return [ (x - state.cx) * state.scale + W/2, (y - state.cy) * state.scale + H/2 ];
}
function screenToWorld(x, y) {
  return [ (x - W/2)/state.scale + state.cx, (y - H/2)/state.scale + state.cy ];
}

// Rendering
function render() {
  drawBackground();
  drawRegions();
  drawGrid();
  drawPlanets();
  drawLabels();
}

function drawBackground(){
  ctx.clearRect(0,0,W,H);
  // vignette
  const g = ctx.createRadialGradient(W*0.5,H*0.45,10,W*0.5,H*0.5,Math.max(W,H)*0.8);
  g.addColorStop(0,'rgba(20,40,90,0.2)');
  g.addColorStop(1,'rgba(0,0,0,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // subtle scanlines
  ctx.globalAlpha = .05;
  for (let y=0; y<H; y+=3){ ctx.fillStyle = '#000'; ctx.fillRect(0,y,W,1); }
  ctx.globalAlpha = 1;

  // spiral strokes
  ctx.save();
  ctx.strokeStyle = 'rgba(120,170,255,0.08)';
  ctx.lineWidth = 2;
  const [cx, cy] = worldToScreen(GRID.cols/2, GRID.rows/2+0.2);
  for(let arm=0; arm<4; arm++){
    ctx.beginPath();
    for(let t=0; t<Math.PI*2.2; t+=0.08){
      const r = 40 + 12*t;
      const x = cx + Math.cos(t + arm*Math.PI/2)*r;
      const y = cy + Math.sin(t + arm*Math.PI/2)*r*0.75;
      if (t===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // star glints
  const rng = mulberry32(7331);
  ctx.save();
  for (let i=0;i<220;i++){
    const x = rng()*W, y = rng()*H;
    const r = Math.max(0.3, rng()*1.2);
    ctx.fillStyle = `rgba(240,250,255,${0.3 + rng()*0.5})`;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    if (rng() > 0.88){
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.strokeStyle='rgba(190,220,255,.35)'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y-5); ctx.lineTo(x,y+5); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

function drawRegions(){
  const [cx, cy] = worldToScreen(GRID.cols/2+0.1, GRID.rows/2+0.2);
  // Elliptical-ish blobs using scaled circles
  const ellipses = [
    { r: 90,  sx: 0.45, sy: 0.45, fill:'rgba(94,198,255,0.12)' }, // Core/Deep
    { r: 150, sx: 0.55, sy: 0.55, fill:'rgba(80,255,180,0.08)' }, // Mid/Expansion
    { r: 230, sx: 0.75, sy: 0.70, fill:'rgba(255,190,130,0.06)' } // Outer
  ];
  ctx.save();
  ellipses.forEach(e=>{
    ctx.beginPath();
    ctx.translate(cx, cy);
    ctx.scale(e.sx, e.sy);
    ctx.arc(0,0,e.r,0,Math.PI*2);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = e.fill;
    ctx.fill();
  });
  ctx.restore();

  // Unknown Regions wedge on left
  ctx.save();
  ctx.fillStyle = 'rgba(190, 160, 255, 0.06)';
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(W*0.23,0);
  ctx.lineTo(W*0.30,H);
  ctx.lineTo(0,H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGrid(){
  const minX = state.world.minX, minY = state.world.minY;
  const maxX = state.world.maxX, maxY = state.world.maxY;

  // vertical lines + letters
  for (let c=0;c<=GRID.cols;c++){
    const wx = c;
    const [sx0, sy0] = worldToScreen(wx, minY);
    const [sx1, sy1] = worldToScreen(wx, maxY);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(150,165,190,0.22)';
    ctx.lineWidth = 1;
    ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
    if (c<GRID.cols){
      const letter = String.fromCharCode(GRID.lettersStart + c);
      ctx.fillStyle = 'rgba(220,235,255,0.9)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(letter, sx0 + 6, sy0 + 6);
      ctx.fillText(letter, sx0 + 6, sy1 - 18);
    }
  }
  // horizontal lines + numbers
  for (let r=0;r<=GRID.rows;r++){
    const wy = r;
    const [sx0, sy0] = worldToScreen(minX, wy);
    const [sx1, sy1] = worldToScreen(maxX, wy);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(150,165,190,0.22)';
    ctx.lineWidth = 1;
    ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
    if (r<GRID.rows){
      ctx.fillStyle = 'rgba(220,235,255,0.9)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(String(r+1), sx0 + 26, sy0 + 6);
      ctx.fillText(String(r+1), sx1 - 34, sy0 + 6);
    }
  }

  // mouse coords -> grid cell preview
  CANVAS.onmousemove = (e)=>{
    const rect = CANVAS.getBoundingClientRect();
    const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const col = Math.min(GRID.cols-1, Math.max(0, Math.floor(wx)));
    const row = Math.min(GRID.rows-1, Math.max(0, Math.floor(wy)));
    const letter = String.fromCharCode(GRID.lettersStart + col);
    coordsEl.textContent = `${letter}-${row+1}`;
  };
}

// Planets
function drawPlanets(){
  for (const p of state.planets) {
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -20 || sy < -20 || sx > W+20 || sy > H+20) continue;

    const size = 4.5;
    const isSel = state.selectedId === p.id;
    const isHover = state.hoverId === p.id;

    ctx.beginPath();
    ctx.fillStyle = regionColor(p.region);
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 6;
    ctx.arc(sx, sy, size, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (isSel || isHover){
      ctx.beginPath();
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.strokeStyle = isSel ? '#ffe45a' : '#58c3ff';
      ctx.arc(sx, sy, size + (isSel ? 6 : 4), 0, Math.PI*2);
      ctx.stroke();
    }
  }
}

function regionColor(region){ return COLORS[region] || COLORS.default; }

function drawLabels(){
  ctx.save();
  ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textBaseline = 'top';
  for (const p of state.planets) {
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -40 || sy < -40 || sx > W+40 || sy > H+40) continue;
    if (state.scale < 70 && !isImportant(p)) continue; // declutter when zoomed out

    const label = p.name;
    const ox = 8, oy = -2;
    ctx.strokeStyle = 'rgba(5,16,36,.9)';
    ctx.lineWidth = 4;
    ctx.strokeText(label, sx+ox, sy+oy);
    ctx.fillStyle = tintForRegion(p.region);
    ctx.fillText(label, sx+ox, sy+oy);
  }
  ctx.restore();
}

function tintForRegion(region){
  switch(region){
    case 'Core': return 'rgba(170,220,255,0.95)';
    case 'Mid Rim': return 'rgba(200,255,230,0.95)';
    case 'Outer Rim': return 'rgba(255,220,190,0.95)';
    case 'Unknown Regions': return 'rgba(220,200,255,0.95)';
    default: return 'rgba(231,241,255,0.95)';
  }
}

function isImportant(p){
  const famous = new Set(['Coruscant','Tatooine','Naboo','Hoth','Endor','Dagobah','Mustafar','Bespin','Alderaan','Kamino','Jakku','Mandalore','Yavin IV','Scarif']);
  return famous.has(p.name);
}

// Interaction: mouse
let isDragging = false;
let lastX=0, lastY=0;
CANVAS.addEventListener('mousedown', (e)=>{ isDragging=true; lastX=e.clientX; lastY=e.clientY; });
window.addEventListener('mouseup', ()=>{ isDragging=false; });
window.addEventListener('mousemove', (e)=>{
  if (isDragging){
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    pan(dx, dy);
    lastX = e.clientX; lastY = e.clientY;
  } else {
    const rect = CANVAS.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const id = pickPlanet(x,y);
    if (id !== state.hoverId){ state.hoverId = id; render(); }
  }
});

CANVAS.addEventListener('wheel', (e)=>{
  e.preventDefault();
  const delta = Math.sign(e.deltaY);
  const rect = CANVAS.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  zoomAt(mx,my, delta<0 ? 1.1 : 0.9);
}, { passive:false });

CANVAS.addEventListener('click', (e)=>{
  const rect = CANVAS.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const id = pickPlanet(x,y);
  if (id != null) selectPlanetById(id);
});

// Interaction: touch
let touchState = null;
CANVAS.addEventListener('touchstart', (e)=>{
  if (e.touches.length === 1){
    const t = e.touches[0];
    touchState = { mode:'pan', lastX:t.clientX, lastY:t.clientY, time: Date.now() };
  } else if (e.touches.length === 2){
    const [a,b] = e.touches;
    touchState = { mode:'pinch', lastD: dist(a,b), anchor: mid(a,b) };
  }
},{passive:true});

CANVAS.addEventListener('touchmove', (e)=>{
  if (!touchState) return;
  if (touchState.mode === 'pan' && e.touches.length === 1){
    const t = e.touches[0];
    pan(t.clientX - touchState.lastX, t.clientY - touchState.lastY);
    touchState.lastX = t.clientX; touchState.lastY = t.clientY;
  } else if (touchState.mode === 'pinch' && e.touches.length === 2){
    const [a,b] = e.touches;
    const d = dist(a,b);
    const factor = d / (touchState.lastD || d);
    const rect = CANVAS.getBoundingClientRect();
    const anchor = touchState.anchor || mid(a,b);
    zoomAt(anchor.x - rect.left, anchor.y - rect.top, factor);
    touchState.lastD = d;
  }
},{passive:true});

CANVAS.addEventListener('touchend', (e)=>{
  if (!touchState) return;
  if (touchState.mode === 'pan' && e.touches.length === 0){
    const dt = Date.now() - (touchState.time||0);
    if (dt < 250){
      const rect = CANVAS.getBoundingClientRect();
      const x = (touchState.lastX||0) - rect.left;
      const y = (touchState.lastY||0) - rect.top;
      const id = pickPlanet(x,y);
      if (id != null) selectPlanetById(id);
    }
  }
  if (e.touches.length === 0) touchState = null;
});

function dist(a,b){ const dx=a.clientX-b.clientX, dy=a.clientY-b.clientY; return Math.hypot(dx,dy); }
function mid(a,b){ return {x:(a.clientX+b.clientX)/2, y:(a.clientY+b.clientY)/2}; }

function pan(dx,dy){
  state.cx -= dx / state.scale;
  state.cy -= dy / state.scale;
  render();
}

function zoomAt(mx,my, factor){
  const [wx, wy] = screenToWorld(mx,my);
  const prev = state.scale;
  state.scale *= factor;
  // clamp zoom to not go beyond grid extents
  state.scale = Math.max(45, Math.min(180, state.scale));
  const [wx2, wy2] = screenToWorld(mx,my);
  state.cx += (wx - wx2);
  state.cy += (wy - wy2);
  render();
}

function pickPlanet(mx,my){
  let hitId = null;
  let bestDist = 14;
  for (const p of state.planets){
    const [sx, sy] = worldToScreen(p.x, p.y);
    const d = Math.hypot(mx - sx, my - sy);
    if (d < bestDist){ bestDist = d; hitId = p.id; }
  }
  return hitId;
}

function selectPlanetById(id){
  state.selectedId = id;
  const p = state.planets.find(q => q.id === id);
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
  document.getElementById('planetGrid').textContent = `${p.gridCol}-${p.gridRow}`;
  if (typeof dlg.showModal === 'function'){ dlg.showModal(); }
}

document.getElementById('resetView').addEventListener('click', ()=>{
  state.cx = GRID.cols/2 + 1.2;
  state.cy = GRID.rows/2;
  state.scale = 95;
  render();
});
document.getElementById('toggleList').addEventListener('click', (e)=>{
  const panel = document.getElementById('listPanel');
  const isHidden = panel.hasAttribute('hidden');
  if (isHidden){ panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden',''); }
  e.currentTarget.setAttribute('aria-expanded', String(isHidden));
});

// Search + filters + list
const searchEl = document.getElementById('search');
searchEl.addEventListener('input', refreshList);
document.getElementById('regionFilter').addEventListener('change', refreshList);
document.getElementById('eraFilter').addEventListener('change', refreshList);

function buildList(){ refreshList(); }

function refreshList(){
  const list = document.getElementById('planetList');
  list.innerHTML = '';
  const q = (searchEl.value || '').trim().toLowerCase();
  const region = document.getElementById('regionFilter').value;
  const era = document.getElementById('eraFilter').value;

  const items = state.planets.filter(p => {
    const okQ = !q || p.name.toLowerCase().includes(q);
    const okR = !region || p.region === region;
    const okE = !era || (p.era && p.era.includes(era));
    return okQ && okR && okE;
  }).sort((a,b)=> a.name.localeCompare(b.name));

  for (const p of items){
    const li = document.createElement('li');
    li.innerHTML = `<span>${p.name}</span><small>${p.region || ''} · ${p.gridCol}-${p.gridRow}</small>`;
    li.addEventListener('click',()=>{
      state.selectedId = p.id;
      flyTo(p.x, p.y, 110);
      showDetails(p);
    });
    list.appendChild(li);
  }
}

function flyTo(x,y, targetScale){
  const steps = 16;
  const start = { cx: state.cx, cy: state.cy, scale: state.scale };
  const end = { cx: x, cy: y, scale: Math.min(160, Math.max(state.scale, targetScale || state.scale)) };
  let t=0;
  function step(){
    t++;
    const k = easeOutCubic(Math.min(1, t/steps));
    state.cx = start.cx + (end.cx - start.cx) * k;
    state.cy = start.cy + (end.cy - start.cy) * k;
    state.scale = start.scale + (end.scale - start.scale) * k;
    render();
    if (t<steps) requestAnimationFrame(step);
  }
  step();
}

function easeOutCubic(x){ return 1 - Math.pow(1-x, 3); }

function announce(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.opacity = 1;
  setTimeout(()=> toast.style.opacity = 0, 1200);
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
