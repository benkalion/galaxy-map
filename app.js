
// v8.1 multi-file — fixed canvas colors, deep zoom, edge labels, route chips, improved popups
const DATA = window.__DATA__;

// Colors for CANVAS (explicit hex so canvas understands them)
const COLORS = {
  deep:'#f0e08f', core:'#9e86b9', colonies:'#d39265', inner:'#caa6a0',
  exp:'#c78ab1', mid:'#78aeca', outer:'#8cb7d6', unk:'#1a2230'
};
const REG_COL = {
  "Deep Core": COLORS.deep, "Core": COLORS.core, "Colonies": COLORS.colonies, "Inner Rim": COLORS.inner,
  "Expansion Region": COLORS.exp, "Mid Rim": COLORS.mid, "Outer Rim": COLORS.outer, "Unknown Regions": COLORS.unk
};

function hexToRgb(hex){
  const h = hex.replace('#','');
  const n = h.length===3 ? h.split('').map(c=>c+c).join('') : h;
  const r = parseInt(n.slice(0,2),16), g=parseInt(n.slice(2,4),16), b=parseInt(n.slice(4,6),16);
  return {r,g,b};
}
function withAlpha(hex, a){
  const {r,g,b} = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const routesBar = document.getElementById('routesBar');
const search = document.getElementById('search');
const regionFilter = document.getElementById('regionFilter');
const coordsOut = document.getElementById('coords');
const edgeLabels = document.getElementById('edgeLabels');
const lTop = edgeLabels.querySelector('.top');
const lBottom = edgeLabels.querySelector('.bottom');
const lLeft = edgeLabels.querySelector('.left');
const lRight = edgeLabels.querySelector('.right');

// Camera
const state = {
  w: innerWidth, h: innerHeight,
  scale: 8.0,       // start very close in
  minScale: 0.25,    // can zoom far out
  maxScale: 20.0,   // and way in
  x: -10, y: 10,
  dragging: false, lx:0, ly:0,
  planets: DATA.planets,
  routes: DATA.routes,
  selectedRoute: null,
};

// transforms
function tx(x){ return ( (x - state.x) * state.scale ) + state.w/2; }
function ty(y){ return ( (y - state.y) * state.scale ) + state.h/2; }
function fromScreen(px,py){ return { x: (px - state.w/2)/state.scale + state.x, y: (py - state.h/2)/state.scale + state.y }; }

// starfield
function drawStars(){
  const count = 260;
  for(let i=0;i<count;i++){
    const sx = Math.random()*state.w, sy = Math.random()*state.h, r=Math.random()*1.3+.2;
    ctx.globalAlpha = Math.random()*.6+.25;
    ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fillStyle='#cfe3ff'; ctx.fill();
  }
  ctx.globalAlpha=1;
}

// regions
function regionShapes(){
  const shapes=[];
  const push=(name,rx,ry,skew,wiggle)=>shapes.push({name,rx,ry,skew,wiggle});
  push('Deep Core',90,70,-6,18);
  push('Core',170,130,-10,20);
  push('Colonies',280,210,-14,22);
  push('Inner Rim',380,280,-16,24);
  push('Expansion Region',520,360,-14,22);
  push('Mid Rim',670,450,-10,18);
  push('Outer Rim',840,560,-6,16);
  return shapes;
}

function drawRegion(shape){
  const color = REG_COL[shape.name];
  ctx.save(); ctx.translate(tx(0), ty(0)); ctx.beginPath();
  const rx=shape.rx*state.scale, ry=shape.ry*state.scale;
  const skew = shape.skew*Math.PI/180;
  for(let a=0;a<=Math.PI*2+0.0001;a+=Math.PI/64){
    const ca=Math.cos(a), sa=Math.sin(a);
    // Asymmetry to match poster: compress west (a≈π), widen east (a≈0)
    const kx = 0.72 + 0.28*(1 + Math.cos(a))/2;  // 0.72..1.0
    const ky = 0.90 + 0.10*Math.cos(a);          // subtle vertical shaping
    let x = ca*rx*kx + Math.sin(a*3)*shape.wiggle*state.scale;
    let y = sa*ry*ky + Math.cos(a*2)*(shape.wiggle*0.7)*state.scale;
    const sx = x + Math.tan(skew)*y, sy=y;
    if(a===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy);
  }
  ctx.closePath();
  ctx.fillStyle = withAlpha(color, 0.22);
  ctx.strokeStyle = withAlpha(color, 0.8);
  ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawUnknown(){
  const color = REG_COL["Unknown Regions"];
  const pts=[[-860,80],[-800,-20],[-720,-100],[-620,-140],[-560,-110],[-540,-40],[-540,60],[-560,160],[-620,260],[-720,320],[-800,260],[-860,160]];
  ctx.save(); ctx.beginPath();
  pts.forEach((p,i)=>{ const X=tx(p[0]), Y=ty(p[1]); if(i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y); });
  ctx.closePath();
  ctx.fillStyle = withAlpha(color, 0.22);
  ctx.strokeStyle = withAlpha(color, 0.8);
  ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); ctx.restore();
}

// routes
function drawRoutes(){
  state.routes.forEach((r,i)=>{
    const active = state.selectedRoute===i;
    ctx.save(); ctx.beginPath();
    r.pts.forEach((p,j)=>{ const X=tx(p[0]), Y=ty(p[1]); if(j===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y); });
    ctx.lineWidth = active? 4: 2;
    ctx.strokeStyle = r.color;
    ctx.shadowColor = r.color; ctx.shadowBlur = active? 18: 8;
    ctx.stroke(); ctx.restore();
  });
}
function buildRoutesBar(){
  routesBar.innerHTML='';
  state.routes.forEach((r,i)=>{
    const b=document.createElement('button'); b.className='routeTag'; b.textContent=r.name;
    b.onclick = ()=>{ state.selectedRoute = (state.selectedRoute===i?null:i); if(state.selectedRoute!==null) centerOnPolyline(state.routes[i].pts); render(); };
    routesBar.appendChild(b);
  });
}
function centerOnPolyline(pts){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  pts.forEach(p=>{ minX=Math.min(minX,p[0]); minY=Math.min(minY,p[1]); maxX=Math.max(maxX,p[0]); maxY=Math.max(maxY,p[1]); });
  state.x=(minX+maxX)/2; state.y=(minY+maxY)/2;
  const pad=80;
  const w=maxX-minX+pad, h=maxY-minY+pad;
  const scaleX=(state.w*0.7)/w, scaleY=(state.h*0.7)/h;
  state.scale = Math.max(state.minScale, Math.min(state.maxScale, Math.min(scaleX,scaleY)));
}

// planets
function drawPlanets(){
  const font = '12px system-ui';
  state.planets.forEach(pl=>{
    const X=tx(pl.x), Y=ty(pl.y);
    if(X<-80||X>state.w+80||Y<-80||Y>state.h+80) return;
    const col = REG_COL[pl.region]||'#fff';
    ctx.save();
    ctx.beginPath(); ctx.arc(X,Y, 5.5, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.shadowColor=col; ctx.shadowBlur=12; ctx.fill();
    ctx.font = font; ctx.lineWidth=3; ctx.strokeStyle='rgba(0,0,0,.65)';
    ctx.strokeText(pl.name, X+8, Y-8);
    ctx.fillStyle='#eaf2ff'; ctx.fillText(pl.name, X+8, Y-8);
    ctx.restore();
  });
}
function planetAt(px,py){
  for(const pl of state.planets){
    const X=tx(pl.x), Y=ty(pl.y);
    if(Math.hypot(X-px,Y-py)<10) return pl;
  }
  return null;
}

// grid
const COLS = "CDEFGHIJKLMNOPQRSTU".split('');
const ROWS = Array.from({length:21},(_,i)=>i+1);
function drawGrid(){
  ctx.save();
  ctx.strokeStyle='rgba(110,160,230,.18)'; ctx.lineWidth=1;
  const minX=fromScreen(0,0).x, maxX=fromScreen(state.w,state.h).x;
  const minY=fromScreen(0,0).y, maxY=fromScreen(state.w,state.h).y;
  const startX=Math.floor(minX/80)*80, endX=Math.ceil(maxX/80)*80;
  const startY=Math.floor(minY/80)*80, endY=Math.ceil(maxY/80)*80;
  for(let x=startX;x<=endX;x+=80){ const X=tx(x); ctx.beginPath(); ctx.moveTo(X,0); ctx.lineTo(X,state.h); ctx.stroke(); }
  for(let y=startY;y<=endY;y+=80){ const Y=ty(y); ctx.beginPath(); ctx.moveTo(0,Y); ctx.lineTo(state.w,Y); ctx.stroke(); }
  ctx.restore();

  function colIndex(x){ const t=(x+900)/1800; return Math.max(0,Math.min(COLS.length-1, Math.floor(t*COLS.length))); }
  function rowIndex(y){ const t=(y+900)/1800; return Math.max(0,Math.min(ROWS.length-1, Math.floor(t*ROWS.length))); }
  const left = colIndex(fromScreen(0,0).x), right = colIndex(fromScreen(state.w,0).x);
  const top = rowIndex(fromScreen(0,0).y), bottom = rowIndex(fromScreen(0,state.h).y);

  function seq(arr,a,b){ const step=a<=b?1:-1, out=[]; for(let i=a;i!=b+step;i+=step) out.push(arr[i]); return out; }
  const colsSeq = seq(COLS,left,right);
  const rowsSeq = seq(ROWS,top,bottom);

  lTop.innerHTML=''; lBottom.innerHTML=''; lLeft.innerHTML=''; lRight.innerHTML='';
  colsSeq.forEach(c=>{ const s=document.createElement('span'); s.textContent=c; lTop.appendChild(s.cloneNode(true)); lBottom.appendChild(s); });
  rowsSeq.forEach(r=>{ const s=document.createElement('span'); s.textContent=r; lLeft.appendChild(s.cloneNode(true)); lRight.appendChild(s); });
}

// popup
const details = document.getElementById('details');
const dName = document.getElementById('dName');
const dRegion = document.getElementById('dRegion');
const dGrid = document.getElementById('dGrid');
const dFamous = document.getElementById('dFamous');
const dQuote = document.getElementById('dQuote');
const dCite = document.getElementById('dCite');
const dNotes = document.getElementById('dNotes');
const dRoutes = document.getElementById('dRoutes');
const dClose = document.getElementById('dClose');

function showPlanet(pl){
  dName.textContent = pl.name;
  dRegion.textContent = pl.region;
  dRegion.style.borderColor = REG_COL[pl.region]||'#58f1ff';
  const cIdx = Math.max(0,Math.min(COLS.length-1, Math.floor(((pl.x+900)/1800)*COLS.length)));
  const rIdx = Math.max(0,Math.min(ROWS.length-1, Math.floor(((pl.y+900)/1800)*ROWS.length)));
  dGrid.textContent = `${COLS[cIdx]}-${ROWS[rIdx]}`;
  dFamous.textContent = pl.famous||'—';
  dQuote.textContent = pl.quote||'';
  dCite.textContent = pl.by? `— ${pl.by}` : '';
  dNotes.textContent = pl.trivia||'';
  dRoutes.innerHTML='';
  (pl.routes||[]).forEach(r=>{ const li=document.createElement('li'); li.textContent=r; dRoutes.appendChild(li); });
  details.showModal();
}
dClose.onclick = ()=> details.close();

// input
document.getElementById('reset').onclick = ()=> location.reload();
canvas.addEventListener('mousedown',e=>{ state.dragging=true; state.lx=e.clientX; state.ly=e.clientY; });
window.addEventListener('mouseup',()=>state.dragging=false);
window.addEventListener('mousemove',e=>{
  if(!state.dragging) return;
  const dx=(e.clientX-state.lx)/state.scale, dy=(e.clientY-state.ly)/state.scale;
  state.x -= dx; state.y -= dy; state.lx=e.clientX; state.ly=e.clientY; render();
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const pre=fromScreen(e.clientX,e.clientY);
  const factor = Math.pow(2, -e.deltaY/900);
  state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale*factor));
  const post=fromScreen(e.clientX,e.clientY);
  state.x += pre.x-post.x; state.y += pre.y-post.y; render();
},{passive:false});
canvas.addEventListener('click',e=>{
  const pl = planetAt(e.clientX,e.clientY);
  if(pl) showPlanet(pl);
});

// search + list
const panel = document.getElementById('panel');
const list = document.getElementById('list');
document.getElementById('togglePanel').onclick=()=>panel.hidden=!panel.hidden;
document.getElementById('closePanel').onclick=()=>panel.hidden=true;

function renderList(){
  const q=(search.value||'').toLowerCase();
  const reg=regionFilter.value;
  list.innerHTML='';
  const filtered = state.planets.filter(pl=> pl.name.toLowerCase().includes(q) && (!reg||pl.region===reg) )
                     .sort((a,b)=>a.name.localeCompare(b.name));
  filtered.forEach(pl=>{ const li=document.createElement('li'); li.textContent=`${pl.name} — ${pl.region}`; li.onclick=()=>{ state.x=pl.x; state.y=pl.y; state.scale=12; render(); showPlanet(pl); }; list.appendChild(li); });
  return filtered;
}
search.addEventListener('input',()=>{ panel.hidden=false; renderList(); });
search.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    const results = renderList();
    if(results.length){ const pl=results[0]; state.x=pl.x; state.y=pl.y; state.scale=12; render(); showPlanet(pl); }
  }
});
regionFilter.addEventListener('change',()=>{ jumpToRegion(regionFilter.value); render(); });

function jumpToRegion(rName){
  const bounds = {'Deep Core':[ -120,-90, 120,90 ],
    'Core':[ -200,-150, 200,150 ],
    'Colonies':[ -300,-220, 300,220 ],
    'Inner Rim':[ -420,-300, 420,300 ],
    'Expansion Region':[ -560,-380, 560,380 ],
    'Mid Rim':[ -720,-460, 720,460 ],
    'Outer Rim':[ -900,-560, 900,560 ],
    'Unknown Regions':[ -860,-160, -300, 360 ],
  }[rName];
  if(!bounds) return;
  const [minX,minY,maxX,maxY]=bounds;
  state.x=(minX+maxX)/2; state.y=(minY+maxY)/2;
  const scaleX=(state.w*0.7)/(maxX-minX);
  const scaleY=(state.h*0.7)/(maxY-minY);
  state.scale = Math.max(state.minScale, Math.min(state.maxScale, Math.min(scaleX,scaleY)));
}

// render
function render(){
  canvas.width = state.w = innerWidth; canvas.height = state.h = innerHeight;
  ctx.clearRect(0,0,state.w,state.h);
  drawStars();
  drawGrid();
  regionShapes().forEach(drawRegion);
  drawUnknown();
  drawRegionLabels();
  drawRoutes();
  drawPlanets();
  coordsOut.textContent = `x ${state.x.toFixed(1)}, y ${state.y.toFixed(1)} • zoom ${state.scale.toFixed(2)}`;
  Array.from(routesBar.children).forEach((b,i)=> b.classList.toggle('active', state.selectedRoute===i));
}

function init(){
  buildRoutesBar();
  renderList();
  render();
}
window.addEventListener('resize',render);
init();


function drawRegionLabels(){
  ctx.save();
  const shapes = regionShapes();
  shapes.forEach(shape=>{
    const name = shape.name;
    const px = tx(shape.rx*0.78);  // put label east side at ~0.78 of x-radius
    const py = ty(0);
    const size = Math.max(12, Math.min(28, 12 + 3*Math.log2(state.scale+1)));
    ctx.font = `bold ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
    ctx.fillStyle = withAlpha('#eef3ff', 0.92);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase(), px, py);
  });
  ctx.restore();
}

