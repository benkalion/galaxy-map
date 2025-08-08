/* Star Wars Galaxy Map — holo-table pass
 * - Grid (C–U across, 1–21 down), readout on hover
 * - Blue holo look, star glints
 * - Region bands and region-tinted labels
 * - Approximate canon-like distribution
 */
const CANVAS = document.getElementById('map');
const ctx = CANVAS.getContext('2d', { alpha: false });
const coordsEl = document.getElementById('coords');

const DPR = Math.max(1, window.devicePixelRatio || 1);
let W = 0, H = 0;

const state = {
  cx: 0, cy: 0, // world center
  scale: 1.5,
  planets: [],
  hoverId: null,
  selectedId: null,
  grid: { cols: 19, rows: 21, lettersStart: 'C'.charCodeAt(0) } // C..U, 1..21
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
  state.planets = data;
  fitViewToAll();
  render();
  buildList();
});

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
resize();

// World <-> Screen
function worldToScreen(x, y) {
  return [(x - state.cx) * state.scale + W/2, (y - state.cy) * state.scale + H/2];
}
function screenToWorld(x, y) {
  return [(x - W/2)/state.scale + state.cx, (y - H/2)/state.scale + state.cy];
}

// Fit view to all points
function fitViewToAll(pad=200) {
  if (!state.planets.length) return;
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  for (const p of state.planets) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const worldW = maxX - minX;
  const worldH = maxY - minY;
  const sx = (W - pad) / worldW;
  const sy = (H - pad) / worldH;
  state.scale = Math.max(0.35, Math.min(sx, sy));
  state.cx = (minX + maxX) / 2;
  state.cy = (minY + maxY) / 2;
}

// Rendering
function render() {
  // background
  drawBackground();

  // region bands
  drawRegions();

  // grid
  drawGrid();

  // planets
  drawPlanets();

  // labels
  drawLabels();
}

function drawBackground(){
  // blue gradient already from CSS; add stars + subtle scanlines
  ctx.clearRect(0,0,W,H);
  const rng = mulberry32(4242);
  ctx.save();
  for (let i=0;i<280;i++){
    const x = rng()*W, y = rng()*H;
    const r = Math.max(0.4, rng()*1.6);
    const a = 0.3 + rng()*0.6;
    ctx.fillStyle = `rgba(240,250,255,${a})`;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    if (rng() > 0.85){
      // glint
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.moveTo(x-6,y); ctx.lineTo(x+6,y); ctx.strokeStyle='rgba(180,220,255,.35)'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y-6); ctx.lineTo(x,y+6); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  // scanlines
  ctx.globalAlpha = .06;
  for (let y=0; y<H; y+=3){
    ctx.fillStyle = '#000'; ctx.fillRect(0,y,W,1);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawRegions(){
  const [cx, cy] = worldToScreen(state.cx, state.cy);
  const radii = [120, 240, 380, 540]; // Core -> Mid -> Outer
  const colors = [
    'rgba(94, 198, 255, 0.10)',
    'rgba(80, 255, 180, 0.06)',
    'rgba(255, 190, 130, 0.05)'
  ];
  for (let i=0;i<radii.length;i++){
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.arc(cx, cy, radii[i], 0, Math.PI*2);
    ctx.fill();
  }
  // Unknown Regions (soft wedge on the far left)
  ctx.save();
  ctx.fillStyle = 'rgba(190, 160, 255, 0.05)';
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(W*0.22,0);
  ctx.lineTo(W*0.28,H);
  ctx.lineTo(0,H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGrid(){
  // Define world bounds to map to C..U (19 cols) and 1..21 (rows)
  // Use bbox of data expanded a bit
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  for (const p of state.planets) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const pad = 40;
  minX -= pad; maxX += pad; minY -= pad; maxY += pad;

  const cols = state.grid.cols; // 19 => C..U
  const rows = state.grid.rows; // 21 => 1..21

  // vertical lines
  for (let c=0;c<=cols;c++){
    const wx = minX + (c/cols)*(maxX-minX);
    const [sx0, sy0] = worldToScreen(wx, minY);
    const [sx1, sy1] = worldToScreen(wx, maxY);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(150,165,190,0.18)';
    ctx.lineWidth = 1;
    ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
    if (c<cols){
      const letter = String.fromCharCode(state.grid.lettersStart + c);
      ctx.fillStyle = 'rgba(220,235,255,0.8)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(letter, sx0 + 6, sy0 + 6);
    }
  }
  // horizontal lines
  for (let r=0;r<=rows;r++){
    const wy = minY + (r/rows)*(maxY-minY);
    const [sx0, sy0] = worldToScreen(minX, wy);
    const [sx1, sy1] = worldToScreen(maxX, wy);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(150,165,190,0.18)';
    ctx.lineWidth = 1;
    ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
    if (r<rows){
      ctx.fillStyle = 'rgba(220,235,255,0.8)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(String(r+1), sx0 + 22, sy0 + 6);
    }
  }

  // mouse coords -> grid cell preview
  CANVAS.onmousemove = (e)=>{
    const rect = CANVAS.getBoundingClientRect();
    const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const col = Math.min(cols-1, Math.max(0, Math.floor((wx - minX) / (maxX - minX) * cols)));
    const row = Math.min(rows-1, Math.max(0, Math.floor((wy - minY) / (maxY - minY) * rows)));
    const letter = String.fromCharCode(state.grid.lettersStart + col);
    coordsEl.textContent = `${letter}-${row+1}`;
  };
}

// Planets
function drawPlanets(){
  for (const p of state.planets) {
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -20 || sy < -20 || sx > W+20 || sy > H+20) continue;

    const size = Math.max(4, 7 - (0.002 * distanceScreenToCenter(sx,sy)));
    const isSel = state.selectedId === p.id;
    const isHover = state.hoverId === p.id;

    ctx.beginPath();
    ctx.fillStyle = regionColor(p.region);
    ctx.arc(sx, sy, size, 0, Math.PI*2);
    ctx.fill();

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
    if (state.scale < 0.8 && !isImportant(p)) continue;

    const label = p.name;
    const ox = 10, oy = -2;
    // outer glow stroke
    ctx.strokeStyle = 'rgba(5,16,36,.9)';
    ctx.lineWidth = 4;
    ctx.strokeText(label, sx+ox, sy+oy);
    // tint fill by region
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

function distanceScreenToCenter(x,y){
  const dx = x - W/2;
  const dy = y - H/2;
  return Math.hypot(dx,dy);
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
  state.scale *= factor;
  state.scale = Math.max(0.25, Math.min(6, state.scale));
  const [wx2, wy2] = screenToWorld(mx,my);
  state.cx += (wx - wx2);
  state.cy += (wy - wy2);
  render();
}

function pickPlanet(mx,my){
  let hitId = null;
  let bestDist = 18;
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
  document.getElementById('planetAffiliation').textContent = p.affiliation || '—';
  document.getElementById('planetEra').textContent = p.era || '—';
  document.getElementById('planetNotes').textContent = p.notes || '—';
  document.getElementById('planetCoords').textContent = `x ${p.x.toFixed(1)}, y ${p.y.toFixed(1)}`;
  if (typeof dlg.showModal === 'function'){ dlg.showModal(); }
}

document.getElementById('resetView').addEventListener('click', ()=>{ fitViewToAll(); render(); });
document.getElementById('toggleList').addEventListener('click', (e)=>{
  const panel = document.getElementById('listPanel');
  const isHidden = panel.hasAttribute('hidden');
  if (isHidden){ panel.removeAttribute('hidden'); }
  else { panel.setAttribute('hidden',''); }
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
    li.innerHTML = `<span>${p.name}</span><small>${p.region || ''}</small>`;
    li.addEventListener('click',()=>{
      state.selectedId = p.id;
      flyTo(p.x, p.y, 1.6);
      showDetails(p);
    });
    list.appendChild(li);
  }
}

function flyTo(x,y, targetScale){
  const steps = 16;
  const start = { cx: state.cx, cy: state.cy, scale: state.scale };
  const end = { cx: x, cy: y, scale: Math.max(state.scale, targetScale || state.scale) };
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
