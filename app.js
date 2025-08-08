/* Star Wars Galaxy — North Star V1 */
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d', {alpha:false});
let DPR = Math.max(1, window.devicePixelRatio||1);
let W=0,H=0;

// World bounds correspond to grid C..U (18 columns) and 1..21 rows
const GRID = { cols: 18, rows: 21, letters: 'CDEFGHIJKLMNOPQRSTU'.split('') };
const BOUNDS = { minX:-270, maxX:270, minY:-240, maxY:240 };

// Camera
const state = { cx:-20, cy:-10, scale:1.9, hover:null, sel:null, planets:[], routes:[] };

// Colors
const PALETTE = {
  deepcore: 'rgba(255,255,255,0.42)',
  core:     'rgba(255,220,140,0.38)',
  colonies: 'rgba(255,170,110,0.30)',
  inner:    'rgba(255,120,220,0.25)',
  expansion:'rgba(160,255,210,0.22)',
  mid:      'rgba(120,210,255,0.20)',
  outer:    'rgba(160,200,255,0.16)',
  unknown:  'rgba(230,180,255,0.18)'
};
const LABEL = {
  'Deep Core':'#ffffff', 'Core':'#ffe4a6', 'Colonies':'#ffbb93', 'Inner Rim':'#ffc5e6',
  'Expansion Region':'#d6ffe9', 'Mid Rim':'#c9ecff', 'Outer Rim':'#f6dcc6', 'Unknown Regions':'#ecd8ff'
};

function resize(){
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.floor(r.width*DPR); canvas.height = Math.floor(r.height*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0); W=r.width; H=r.height; render();
}
window.addEventListener('resize', resize);

// Helpers world<->screen
function w2s(x,y){ return [(x-state.cx)*state.scale + W/2, (y-state.cy)*state.scale + H/2]; }
function s2w(x,y){ return [ (x - W/2)/state.scale + state.cx, (y - H/2)/state.scale + state.cy ]; }
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

// Draw
function render(){
  drawBackground();
  drawSectors();
  drawSpiralArms();
  drawGrid();
  drawRoutes();
  drawPlanets();
  drawLabels();
}

function drawBackground(){
  ctx.clearRect(0,0,W,H);
  // vignette
  const g = ctx.createRadialGradient(W*0.55,H*0.42,10,W*.5,H*.5,Math.max(W,H)*0.95);
  g.addColorStop(0,'rgba(12,26,70,.55)'); g.addColorStop(1,'rgba(0,0,0,.93)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // starfield
  const rng = mulberry32(1337);
  for(let i=0;i<420;i++){
    const x=rng()*W, y=rng()*H, r=Math.max(.3,rng()*1.4);
    ctx.globalAlpha = .35 + rng()*.6; ctx.fillStyle='#e8f3ff';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;
  // subtle scanlines
  ctx.globalAlpha = .05; ctx.fillStyle='#000';
  for(let y=0;y<H;y+=3){ ctx.fillRect(0,y,W,1); }
  ctx.globalAlpha=1;
}

function drawSectors(){
  // approximate organic blobs; center slightly right/down
  const [cx,cy]=w2s(-20,0);
  const blob = (radius,sx,sy,j,fill)=>{
    ctx.save(); ctx.translate(cx,cy); ctx.scale(sx,sy); ctx.beginPath();
    const steps=140; 
    for(let i=0;i<=steps;i++){
      const t=i/steps*Math.PI*2;
      const jr = radius*(1+j*noise(Math.cos(t),Math.sin(t)));
      const x=Math.cos(t)*jr, y=Math.sin(t)*jr*.88;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=fill; ctx.fill();
    ctx.restore();
  };
  blob(60,.78,.74,.06, PALETTE.deepcore);
  blob(102,.90,.86,.07, PALETTE.core);
  blob(142,1.01,.95,.09, PALETTE.colonies);
  blob(175,1.05,1.00,.10, PALETTE.inner);
  blob(210,1.08,1.04,.10, PALETTE.expansion);
  blob(248,1.12,1.06,.11, PALETTE.mid);
  blob(305,1.20,1.10,.12, PALETTE.outer);
  // Unknown wedge left
  ctx.save(); ctx.fillStyle = PALETTE.unknown;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(W*0.24,0); ctx.lineTo(W*0.30,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawSpiralArms(){
  // gentle blue arms sweeps (additive strokes)
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const arms=[
    {cx:W*.42, cy:H*.62, a:-.7, r:W*.52},
    {cx:W*.70, cy:H*.35, a:2.3, r:W*.60}
  ];
  for(const arm of arms){
    const segs=800; ctx.beginPath();
    for(let i=0;i<segs;i++){
      const t=i/segs*6.283, r=arm.r*(.25+.6*i/segs);
      const x=arm.cx + Math.cos(t+arm.a)*r*0.02*i/segs;
      const y=arm.cy + Math.sin(t+arm.a)*r*0.02*i/segs;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle='rgba(120,180,255,.06)'; ctx.lineWidth=40; ctx.stroke();
  }
  ctx.restore();
}

function drawGrid(){
  ctx.save();
  ctx.strokeStyle='rgba(160,180,210,.22)'; ctx.lineWidth=1;
  for(let c=0;c<=GRID.cols;c++){
    const wx = BOUNDS.minX + (c/GRID.cols)*(BOUNDS.maxX-BOUNDS.minX);
    const [x0,y0]=w2s(wx,BOUNDS.minY); const [x1,y1]=w2s(wx,BOUNDS.maxY);
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    if(c<GRID.cols){
      ctx.fillStyle='#dceaff'; ctx.font='12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(GRID.letters[c], x0+6,y0+6); ctx.fillText(GRID.letters[c], x0+6,y1-6);
    }
  }
  for(let r=0;r<=GRID.rows;r++){
    const wy = BOUNDS.minY + (r/GRID.rows)*(BOUNDS.maxY-BOUNDS.minY);
    const [x0,y0]=w2s(BOUNDS.minX,wy); const [x1,y1]=w2s(BOUNDS.maxX,wy);
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    if(r<GRID.rows){
      ctx.fillStyle='#dceaff'; ctx.font='12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(String(r+1), x0+24,y0+6); ctx.fillText(String(r+1), x1-28,y0+6);
    }
  }
  ctx.restore();

  // coords readout
  canvas.onmousemove = (e)=>{
    const rect = canvas.getBoundingClientRect();
    const [wx,wy] = s2w(e.clientX-rect.left, e.clientY-rect.top);
    const col = clamp(Math.floor((wx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols),0,GRID.cols-1);
    const row = clamp(Math.floor((wy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows),0,GRID.rows-1);
    document.getElementById('coords').textContent = GRID.letters[col]+'-'+(row+1);
  };
}

function drawRoutes(){
  // glowing cubic Bezier paths following canonical directions (approx)
  ctx.save();
  ctx.lineCap='round'; ctx.globalCompositeOperation='lighter';
  for(const r of state.routes){
    ctx.shadowBlur=12; ctx.shadowColor=r.color; ctx.strokeStyle=r.color; ctx.lineWidth=3;
    ctx.beginPath();
    const pts = r.points.map(p=>w2s(p[0],p[1]));
    ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i+=3){
      const a=pts[i], b=pts[i+1], c=pts[i+2];
      ctx.bezierCurveTo(a[0],a[1],b[0],b[1],c[0],c[1]);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlanets(){
  for(const p of state.planets){
    const [sx,sy]=w2s(p.x,p.y);
    if (sx<-60||sy<-60||sx>W+60||sy>H+60) continue;
    const r=4.8;
    ctx.beginPath();
    const col = LABEL[p.region] || '#eaf3ff';
    ctx.fillStyle = col; ctx.shadowColor=col; ctx.shadowBlur=8;
    ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;

    if (state.sel===p.id){
      ctx.beginPath(); ctx.strokeStyle='#ffd76a'; ctx.lineWidth=2;
      ctx.arc(sx,sy,r+6,0,Math.PI*2); ctx.stroke();
    } else if (state.hover===p.id){
      ctx.beginPath(); ctx.strokeStyle='#67c8ff'; ctx.lineWidth=1;
      ctx.arc(sx,sy,r+4,0,Math.PI*2); ctx.stroke();
    }
  }
}

function drawLabels(){
  ctx.save(); ctx.font='12px system-ui, -apple-system, Segoe UI, Roboto, Arial'; ctx.textBaseline='top';
  for(const p of state.planets){
    const [sx,sy]=w2s(p.x,p.y);
    if (sx<-60||sy<-60||sx>W+60||sy>H+60) continue;
    if (state.scale < 1.0 && !p.featured) continue;
    const dx=8, dy=-2; const txt=p.name;
    ctx.lineWidth=4; ctx.strokeStyle='rgba(8,16,36,.95)'; ctx.strokeText(txt,sx+dx,sy+dy);
    ctx.fillStyle = LABEL[p.region] || '#eaf3ff'; ctx.fillText(txt,sx+dx,sy+dy);
  }
  ctx.restore();
}

// Interaction
let drag=false, lx=0, ly=0;
canvas.addEventListener('mousedown',e=>{ drag=true; lx=e.clientX; ly=e.clientY; });
window.addEventListener('mouseup',()=>drag=false);
window.addEventListener('mousemove',e=>{
  if(drag){ const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY; state.cx-=dx/state.scale; state.cy-=dy/state.scale; render(); }
  else {
    const rect=canvas.getBoundingClientRect(); const id = pick(e.clientX-rect.left, e.clientY-rect.top);
    if(id!==state.hover){ state.hover=id; render(); }
  }
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const rect=canvas.getBoundingClientRect(); const f = Math.sign(e.deltaY)<0 ? 1.1 : 0.9;
  zoomAt(e.clientX-rect.left, e.clientY-rect.top, f);
},{passive:false});
canvas.addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect(); const id = pick(e.clientX-rect.left, e.clientY-rect.top);
  if(id!=null){ selectPlanet(id); }
});

// Touch
let touch=null;
canvas.addEventListener('touchstart',e=>{
  if(e.touches.length===1){ const t=e.touches[0]; touch={mode:'pan',x:t.clientX,y:t.clientY,t:Date.now()}; }
  else if(e.touches.length===2){ const [a,b]=e.touches; touch={mode:'pinch',d:dist(a,b),anchor:mid(a,b)}; }
},{passive:true});
canvas.addEventListener('touchmove',e=>{
  if(!touch) return;
  if(touch.mode==='pan' && e.touches.length===1){ const t=e.touches[0]; state.cx-=(t.clientX-touch.x)/state.scale; state.cy-=(t.clientY-touch.y)/state.scale; touch.x=t.clientX; touch.y=t.clientY; render(); }
  else if(touch.mode==='pinch' && e.touches.length===2){ const [a,b]=e.touches; const d=dist(a,b); const f=d/(touch.d||d); const rect=canvas.getBoundingClientRect(); const anc=touch.anchor||mid(a,b); zoomAt(anc.x-rect.left, anc.y-rect.top, f); touch.d=d; }
},{passive:true});
canvas.addEventListener('touchend',e=>{ if(e.touches.length===0) touch=null; },{passive:true});

function zoomAt(mx,my,f){
  const [wx,wy]=s2w(mx,my);
  state.scale *= f; state.scale = clamp(state.scale, .75, 2.6);
  const [wx2,wy2]=s2w(mx,my); state.cx += (wx-wx2); state.cy += (wy-wy2);
  render();
}

function pick(mx,my){
  let best=14, id=null;
  for(const p of state.planets){
    const [sx,sy]=w2s(p.x,p.y); const d=Math.hypot(mx-sx,my-sy);
    if(d<best){ best=d; id=p.id; }
  }
  return id;
}

function selectPlanet(id){
  state.sel=id;
  const p = state.planets.find(q=>q.id===id); if(!p) return;
  // details
  const d = document.getElementById('details');
  document.getElementById('dName').textContent=p.name;
  document.getElementById('dRegion').textContent=p.region||'—';
  document.getElementById('dSector').textContent=p.sector||'—';
  document.getElementById('dRoutes').textContent=(p.routes||[]).join(', ')||'—';
  document.getElementById('dFamous').textContent=p.famous||'—';
  document.getElementById('dNotes').textContent=p.notes||'—';
  document.getElementById('dGrid').textContent=p.grid||'—';
  if (typeof d.showModal === 'function') d.showModal();
  render();
}

// UI
document.getElementById('reset').addEventListener('click',()=>{ state.cx=-20; state.cy=-10; state.scale=1.9; render(); });
document.getElementById('togglePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden = !document.getElementById('panel').hidden; });
document.getElementById('closePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden=true; });
document.getElementById('regionFilter').addEventListener('change',refreshList);
const searchEl = document.getElementById('search'); searchEl.addEventListener('input', refreshList);

function refreshList(){
  const q=(searchEl.value||'').trim().toLowerCase();
  const reg=document.getElementById('regionFilter').value;
  const list=document.getElementById('list'); list.innerHTML='';
  state.planets.filter(p=>(!q||p.name.toLowerCase().includes(q)) && (!reg||p.region===reg))
    .sort((a,b)=>a.name.localeCompare(b.name))
    .forEach(p=>{
      const li=document.createElement('li'); li.innerHTML=`<span>${p.name}</span><small>${p.region||''}</small>`;
      li.addEventListener('click',()=>{ flyTo(p.x,p.y,2.0); selectPlanet(p.id); });
      list.appendChild(li);
    });
}

function flyTo(x,y, s){
  const steps=18, start={cx:state.cx,cy:state.cy,scale:state.scale}, end={cx:x,cy:y,scale:Math.max(state.scale,s||state.scale)};
  let t=0; const step=()=>{ t++; const k=1-Math.pow(1-t/steps,3); state.cx=start.cx+(end.cx-start.cx)*k; state.cy=start.cy+(end.cy-start.cy)*k; state.scale=start.scale+(end.scale-start.scale)*k; render(); if(t<steps) requestAnimationFrame(step); };
  step();
}

// Noise + rng
function noise(x,y){ return Math.sin(x*2.3+y*1.7)*Math.cos(x*1.1-y*2.0)*0.5; }
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; } }

// Convert grid like 'L-9' to world coords, then apply offset
function gridToWorld(grid){
  if(!grid) return [0,0];
  const [letter,rowStr] = grid.split('-'); const row=parseInt(rowStr,10);
  const col = GRID.letters.indexOf(letter.toUpperCase()); if(col<0||!row) return [0,0];
  const x = BOUNDS.minX + (col+0.5)/GRID.cols*(BOUNDS.maxX-BOUNDS.minX);
  const y = BOUNDS.minY + (row-0.5)/GRID.rows*(BOUNDS.maxY-BOUNDS.minY);
  return [x,y];
}

// Init
fetch('planets.json').then(r=>r.json()).then(data=>{
  // derive x,y from grid + offset
  let id=1;
  for(const p of data.planets){
    const [gx,gy]=gridToWorld(p.grid || 'M-11');
    const ox = (p.offset&&p.offset[0])||0, oy=(p.offset&&p.offset[1])||0;
    p.x = gx + ox; p.y = gy + oy; p.id=id++;
  }
  state.planets = data.planets;
  state.routes = buildRoutes(data.planets);
  resize(); refreshList(); render();
});

function findXY(planets, name){
  const p=planets.find(q=>q.name===name); return p?[p.x,p.y]:[0,0];
}

function buildRoutes(planets){
  // Rough approximations via control points between iconic systems, rendered as cubic segments.
  const routes=[];
  // Corellian Run: Corellia -> Tatooine -> Geonosis -> Ryloth -> (toward) Outer
  const C=findXY(planets,'Corellia'), T=findXY(planets,'Tatooine'), G=findXY(planets,'Geonosis'), R=findXY(planets,'Ryloth');
  routes.push({
    name:'Corellian Run', color:'rgba(255,200,120,.55)', 
    points: [ C, [C[0]+60,C[1]-40], [T[0]-40,T[1]-10], T,
              [T[0]+40,T[1]+10], [G[0]+60,G[1]], G,
              [G[0]+40,G[1]+20], [R[0]+40,R[1]+10], R ]
  });
  // Hydian Way: Eriadu -> Coruscant-ish line (sweeping)
  const E=findXY(planets,'Eriadu'), Cor=findXY(planets,'Coruscant');
  routes.push({
    name:'Hydian Way', color:'rgba(160,220,255,.55)',
    points: [ E, [E[0]+40,E[1]-40], [Cor[0]-60,Cor[1]+10], Cor ]
  });
  // Perlemian: Brentaal -> Coruscant -> Ossus-ish (use Dantooine) -> Outer
  const B=findXY(planets,'Brentaal'), D=findXY(planets,'Dantooine');
  routes.push({
    name:'Perlemian Trade Route', color:'rgba(255,140,210,.55)',
    points: [ B, [B[0]-40,B[1]+10], [Cor[0]+20,Cor[1]-20], Cor,
              [Cor[0]+80,Cor[1]-20], [D[0]+40,D[1]-10], D ]
  });
  // Rimma Trade Route: Eriadu -> Bespin -> Hoth-ish
  const Bes=findXY(planets,'Bespin'), Ho=findXY(planets,'Hoth');
  routes.push({
    name:'Rimma Trade Route', color:'rgba(120,255,200,.55)',
    points: [ E, [E[0]+20,E[1]+40], [Bes[0]-10,Bes[1]-10], Bes,
              [Bes[0]-10,Bes[1]-10], [Ho[0]+20,Ho[1]], Ho ]
  });
  return routes;
}
