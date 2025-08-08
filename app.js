/* Star Wars Galaxy Map — No external libs. Canvas + touch/mouse pan/zoom.
 * Prototype quality: approximate coordinates, accessibility-minded, mobile friendly.
 */
const CANVAS = document.getElementById('map');
const ctx = CANVAS.getContext('2d', { alpha: false });

const DPR = Math.max(1, window.devicePixelRatio || 1);
let W = 0, H = 0;

const state = {
  cx: 0, cy: 0, // world center in world units
  scale: 1.4,    // world->screen scale
  planets: [],
  hoverId: null,
  selectedId: null,
};

// Regions -> Colors
const COLORS = {
  Core: '#89e0ff',
  'Mid Rim': '#9dff89',
  'Outer Rim': '#ffb189',
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
  return [
    (x - state.cx) * state.scale + W/2,
    (y - state.cy) * state.scale + H/2
  ];
}
function screenToWorld(x, y) {
  return [
    (x - W/2)/state.scale + state.cx,
    (y - H/2)/state.scale + state.cy
  ];
}

// Fit view to all points
function fitViewToAll(pad=120) {
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
  state.scale = Math.max(0.3, Math.min(sx, sy));
  state.cx = (minX + maxX) / 2;
  state.cy = (minY + maxY) / 2;
}

// Rendering
function render() {
  ctx.fillStyle = '#060b12';
  ctx.fillRect(0,0,W,H);

  // starfield
  drawStars();

  // axes / rings
  drawRings();

  // planet points
  drawPlanets();

  // labels (second pass so they sit on top)
  drawLabels();
}

function drawStars() {
  const rng = mulberry32(1337);
  ctx.save();
  ctx.globalAlpha = 0.7;
  for (let i=0;i<240;i++){
    const x = rng()*W, y = rng()*H;
    const r = Math.max(0.5, rng()*1.6);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + rng()*0.7})`;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRings(){
  // subtle concentric rings around center
  const rings = 6;
  const [cx, cy] = worldToScreen(state.cx, state.cy);
  for(let i=1;i<=rings;i++){
    ctx.beginPath();
    ctx.strokeStyle = `rgba(148, 178, 216, ${0.06})`;
    ctx.lineWidth = 1;
    ctx.arc(cx, cy, i * 220, 0, Math.PI*2);
    ctx.stroke();
  }
}

function drawPlanets(){
  for (const p of state.planets) {
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -20 || sy < -20 || sx > W+20 || sy > H+20) continue;

    const size = Math.max(4, 7 - (0.002 * distanceScreenToCenter(sx,sy)));
    const isSel = state.selectedId === p.id;
    const isHover = state.hoverId === p.id;

    ctx.beginPath();
    ctx.fillStyle = COLORS[p.region] || '#c7d2fe';
    ctx.arc(sx, sy, size, 0, Math.PI*2);
    ctx.fill();

    if (isSel || isHover){
      ctx.beginPath();
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.strokeStyle = isSel ? '#ffe45a' : '#5ab1ff';
      ctx.arc(sx, sy, size + (isSel ? 6 : 4), 0, Math.PI*2);
      ctx.stroke();
    }
  }
}

function drawLabels(){
  ctx.save();
  ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(231,241,255,.9)';
  ctx.strokeStyle = 'rgba(6,11,18,.9)';
  ctx.lineWidth = 4;
  for (const p of state.planets) {
    const [sx, sy] = worldToScreen(p.x, p.y);
    if (sx < -40 || sy < -40 || sx > W+40 || sy > H+40) continue;
    if (state.scale < 0.8 && !isImportant(p)) continue; // hide most labels when zoomed out

    const label = p.name;
    const ox = 10, oy = -2;
    ctx.strokeText(label, sx+ox, sy+oy);
    ctx.fillText(label, sx+ox, sy+oy);
  }
  ctx.restore();
}

function isImportant(p){
  // Always show for some famous planets
  const famous = new Set(['Coruscant','Tatooine','Naboo','Hoth','Endor','Dagobah','Mustafar','Bespin','Alderaan','Kamino','Jakku','Mandalore']);
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
    // hover detection
    const rect = CANVAS.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const id = pickPlanet(x,y);
    if (id !== state.hoverId){
      state.hoverId = id;
      render();
    }
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
let touchState = null; // {mode:'pan'|'pinch', lastX,lastY, lastD, cx,cy}
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
    // treat as tap if short and small movement
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
  // Zoom around a screen point
  const [wx, wy] = screenToWorld(mx,my);
  state.scale *= factor;
  // clamp
  state.scale = Math.max(0.25, Math.min(6, state.scale));
  const [wx2, wy2] = screenToWorld(mx,my);
  state.cx += (wx - wx2);
  state.cy += (wy - wy2);
  render();
}

function pickPlanet(mx,my){
  // hit-test planets in screen space
  let hitId = null;
  let bestDist = 18;
  for (const p of state.planets){
    const [sx, sy] = worldToScreen(p.x, p.y);
    const d = Math.hypot(mx - sx, my - sy);
    if (d < bestDist){
      bestDist = d;
      hitId = p.id;
    }
  }
  return hitId;
}

function selectPlanetById(id){
  state.selectedId = id;
  const p = state.planets.find(q => q.id === id);
  if (p){
    showDetails(p);
    announce(`${p.name}`);
    render();
  }
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
      // Smooth fly-to
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

// A11y announcements
function announce(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.opacity = 1;
  setTimeout(()=> toast.style.opacity = 0, 1200);
}

// Deterministic RNG for starfield
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
