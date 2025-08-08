/* v3 — improved zoom, fixed-screen grid, beefier style */
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d', {alpha:false});
let DPR = Math.max(1, window.devicePixelRatio||1); let W=0,H=0;

// world bounds (bigger galaxy feel)
const GRID = { cols:18, rows:21, letters:'CDEFGHIJKLMNOPQRSTU'.split('') };
const BOUNDS = { minX:-320, maxX:320, minY:-280, maxY:280 };

const state = { cx:-20, cy:-12, scale:3.0, hover:null, sel:null, planets:[], routes:[] };

// palettes
const SECTOR = {
  'Deep Core':'rgba(255,255,255,.42)',
  'Core':'rgba(255,220,140,.38)',
  'Colonies':'rgba(255,170,110,.32)',
  'Inner Rim':'rgba(255,140,220,.28)',
  'Expansion Region':'rgba(160,255,210,.24)',
  'Mid Rim':'rgba(120,210,255,.22)',
  'Outer Rim':'rgba(160,200,255,.17)',
  'Unknown Regions':'rgba(224,182,255,.20)'
};
const LABEL = {
  'Deep Core':'#ffffff','Core':'#ffe4a6','Colonies':'#ffbf96','Inner Rim':'#ffc8eb','Expansion Region':'#d8ffea',
  'Mid Rim':'#c8eaff','Outer Rim':'#f6dcc6','Unknown Regions':'#ecd8ff', default:'#eaf3ff'
};

function resize(){
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.floor(r.width*DPR); canvas.height = Math.floor(r.height*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0); W=r.width; H=r.height; render();
}
window.addEventListener('resize', resize);

function w2s(x,y){ return [(x-state.cx)*state.scale + W/2, (y-state.cy)*state.scale + H/2]; }
function s2w(x,y){ return [(x - W/2)/state.scale + state.cx, (y - H/2)/state.scale + state.cy]; }
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

function render(){
  drawBackground();
  drawSectorBlobs();
  drawSpiralArms();
  drawRoutes();
  drawPlanets();
  drawLabels();
  drawGridScreen(); // last, so it's fixed to edges
}

function drawBackground(){
  ctx.clearRect(0,0,W,H);
  const g = ctx.createRadialGradient(W*.6,H*.35,10,W*.5,H*.5,Math.max(W,H)*.95);
  g.addColorStop(0,'rgba(20,40,95,.65)'); g.addColorStop(1,'rgba(0,0,0,.94)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // glistening stars
  const rng = mulberry32(4242);
  for(let i=0;i<520;i++){
    const x=rng()*W, y=rng()*H, r=Math.max(.3,rng()*1.6);
    ctx.globalAlpha=.35+rng()*.6; ctx.fillStyle='#eaf3ff'; ctx.beginPath(); ctx.arc(x,y,r,0,6.283); ctx.fill();
    if (rng()>.9){ ctx.globalAlpha=.28; ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.strokeStyle='rgba(190,220,255,.35)'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y-5); ctx.lineTo(x,y+5); ctx.stroke(); }
  }
  ctx.globalAlpha=1;
  // scanlines
  ctx.globalAlpha=.05; ctx.fillStyle='#000'; for(let y=0;y<H;y+=3){ ctx.fillRect(0,y,W,1); } ctx.globalAlpha=1;
}

function drawSectorBlobs(){
  const [cx,cy]=w2s(-20,0);
  const blob=(rad,sx,sy,j,fill)=>{
    ctx.save(); ctx.translate(cx,cy); ctx.scale(sx,sy); ctx.beginPath();
    const steps=160;
    for(let i=0;i<=steps;i++){ const t=i/steps*6.283; const jr=rad*(1+j*noise(Math.cos(t),Math.sin(t))); const x=Math.cos(t)*jr, y=Math.sin(t)*jr*.87; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.closePath(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=fill; ctx.fill();
    ctx.restore();
  };
  blob(62,.80,.74,.06, SECTOR['Deep Core']);
  blob(106,.92,.86,.07, SECTOR['Core']);
  blob(148,1.01,.96,.08, SECTOR['Colonies']);
  blob(182,1.05,1.00,.10, SECTOR['Inner Rim']);
  blob(216,1.09,1.05,.10, SECTOR['Expansion Region']);
  blob(255,1.13,1.08,.11, SECTOR['Mid Rim']);
  blob(315,1.22,1.12,.12, SECTOR['Outer Rim']);
  // Unknown Regions — full left-side overlay
  ctx.save(); ctx.fillStyle = SECTOR['Unknown Regions'];
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(W*0.18,0);
  ctx.quadraticCurveTo(W*0.22,H*0.25,W*0.24,H*0.42);
  ctx.quadraticCurveTo(W*0.28,H*0.74,W*0.20,H*1.00);
  ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Sector labels (world-anchored but screen-rendered)
  sectorLabel('CORE', cx, cy-10, 1.0);
  sectorLabel('COLONIES', cx+20, cy+30, .9);
  sectorLabel('INNER RIM', cx+40, cy+60, .9);
  sectorLabel('EXPANSION', cx+50, cy+90, .9);
  sectorLabel('MID RIM', cx+90, cy+120, .9);
  sectorLabel('OUTER RIM', cx+140, cy+160, .9);
  // Unknown Regions label on the left
  textGlow('UNKNOWN REGIONS', 32, H*.45, 18);
}
function sectorLabel(txt, sx, sy, alpha){
  ctx.save(); ctx.globalAlpha=alpha; textGlow(txt, sx, sy, 14); ctx.restore();
}
function textGlow(txt, x, y, size){
  ctx.save();
  ctx.font = `700 ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.textBaseline='middle';
  ctx.shadowColor='rgba(170,210,255,.45)'; ctx.shadowBlur=12;
  ctx.fillStyle='rgba(200,230,255,.35)';
  ctx.fillText(txt,x,y);
  ctx.shadowBlur=0;
  ctx.restore();
}

function drawSpiralArms(){
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const arms=[{cx:W*.44,cy:H*.64,a:-.7,r:W*.55},{cx:W*.72,cy:H*.36,a:2.3,r:W*.65}];
  for(const arm of arms){
    const segs=900; ctx.beginPath();
    for(let i=0;i<segs;i++){ const t=i/segs*6.283, r=arm.r*(.22+.62*i/segs);
      const x=arm.cx + Math.cos(t+arm.a)*r*0.02*i/segs; const y=arm.cy + Math.sin(t+arm.a)*r*0.02*i/segs;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.strokeStyle='rgba(120,180,255,.06)'; ctx.lineWidth=42; ctx.stroke();
  }
  ctx.restore();
}

function drawRoutes(){
  ctx.save(); ctx.lineCap='round'; ctx.globalCompositeOperation='lighter';
  for(const r of state.routes){
    ctx.shadowBlur=12; ctx.shadowColor=r.color; ctx.strokeStyle=r.color; ctx.lineWidth=3;
    ctx.beginPath();
    const pts = r.points.map(p=>w2s(p[0],p[1]));
    ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i+=3){ const a=pts[i], b=pts[i+1], c=pts[i+2]; ctx.bezierCurveTo(a[0],a[1],b[0],b[1],c[0],c[1]); }
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlanets(){
  for(const p of state.planets){
    const [sx,sy]=w2s(p.x,p.y);
    if (sx<-80||sy<-80||sx>W+80||sy>H+80) continue;
    const r=5;
    ctx.beginPath(); const col=LABEL[p.region]||LABEL.default; ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=8;
    ctx.arc(sx,sy,r,0,6.283); ctx.fill(); ctx.shadowBlur=0;
    if (state.sel===p.id){ ctx.beginPath(); ctx.strokeStyle='#ffd76a'; ctx.lineWidth=2; ctx.arc(sx,sy,r+6,0,6.283); ctx.stroke(); }
    else if (state.hover===p.id){ ctx.beginPath(); ctx.strokeStyle='#67c8ff'; ctx.lineWidth=1; ctx.arc(sx,sy,r+4,0,6.283); ctx.stroke(); }
  }
}

function drawLabels(){
  ctx.save(); ctx.font='12px system-ui, -apple-system, Segoe UI, Roboto, Arial'; ctx.textBaseline='top';
  for(const p of state.planets){
    const [sx,sy]=w2s(p.x,p.y);
    if (sx<-80||sy<-80||sx>W+80||sy>H+80) continue;
    if (state.scale < 1.1 && !p.featured) continue;
    const dx=8, dy=-2; const txt=p.name;
    ctx.lineWidth=4; ctx.strokeStyle='rgba(8,16,36,.96)'; ctx.strokeText(txt,sx+dx,sy+dy);
    ctx.fillStyle = LABEL[p.region]||LABEL.default; ctx.fillText(txt,sx+dx,sy+dy);
  }
  ctx.restore();
}

// Fixed-on-screen grid
function drawGridScreen(){
  const overlay = document.getElementById('gridOverlay');
  // Edge labels
  const top = GRID.letters.map(l=>`<span class="t">${l}</span>`).join('');
  const bot = GRID.letters.map(l=>`<span class="b">${l}</span>`).join('');
  const nums = Array.from({length:GRID.rows},(_,i)=>i+1);
  overlay.innerHTML = `<div class="col rowTop">${top}</div>
    <div class="col rowBot">${bot}</div>
    <div class="row colLeft">${nums.map(n=>`<span>${n}</span>`).join('')}</div>
    <div class="row colRight">${nums.map(n=>`<span>${n}</span>`).join('')}</div>`;
  overlay.style.setProperty('--cols', GRID.cols);
  overlay.style.setProperty('--rows', GRID.rows);
}
drawGridScreen();

// overlay label styling
const overlayCSS = document.createElement('style');
overlayCSS.textContent = `
#gridOverlay{position:absolute;inset:0;pointer-events:none;--cols:18;--rows:21}
#gridOverlay .col{position:absolute;left:0;right:0;display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:0;color:#dceaff;font-size:12px;padding:6px}
#gridOverlay .rowTop{top:0} #gridOverlay .rowBot{bottom:0}
#gridOverlay .row{position:absolute;top:0;bottom:0;display:grid;grid-template-rows:repeat(var(--rows),1fr);gap:0;color:#dceaff;font-size:12px;align-content:space-between;justify-items:center;padding:6px}
#gridOverlay .colLeft{left:0} #gridOverlay .colRight{right:0}
`;
document.head.appendChild(overlayCSS);

// Interaction
let dragging=false,lx=0,ly=0;
canvas.addEventListener('mousedown',e=>{ dragging=true; lx=e.clientX; ly=e.clientY; });
window.addEventListener('mouseup',()=>dragging=false);
window.addEventListener('mousemove',e=>{
  if(dragging){ const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY; state.cx-=dx/state.scale; state.cy-=dy/state.scale; render(); }
  else { const rect=canvas.getBoundingClientRect(); const id=pick(e.clientX-rect.left,e.clientY-rect.top); if(id!==state.hover){ state.hover=id; render(); } }
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const rect=canvas.getBoundingClientRect(); const f = Math.pow(1.07, -Math.sign(e.deltaY)); // slower, finer zoom
  zoomAt(e.clientX-rect.left, e.clientY-rect.top, f);
},{passive:false});
canvas.addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect(); const id=pick(e.clientX-rect.left,e.clientY-rect.top); if(id!=null) selectPlanet(id);
});

// touch
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
  state.scale*=f; state.scale = clamp(state.scale, .55, 3.8);
  const [wx2,wy2]=s2w(mx,my); state.cx += (wx-wx2); state.cy += (wy-wy2);
  render();
}

function pick(mx,my){
  let id=null,best=14;
  for(const p of state.planets){ const [sx,sy]=w2s(p.x,p.y); const d=Math.hypot(mx-sx,my-sy); if(d<best){best=d; id=p.id;} }
  return id;
}
function selectPlanet(id){
  state.sel=id;
  const p = state.planets.find(q=>q.id===id); if(!p) return;
  const dlg=document.getElementById('details');
  document.getElementById('dName').textContent=p.name;
  document.getElementById('dRegion').textContent=p.region||'—';
  document.getElementById('dSector').textContent=p.sector||'—';
  document.getElementById('dGrid').textContent=p.grid||'—';
  document.getElementById('dQuote').textContent = p.quote ? `“${p.quote}”` : '';
  document.getElementById('dNotes').textContent = p.notes||'';
  const ul=document.getElementById('dRoutes'); ul.innerHTML=''; (p.routes||[]).forEach(r=>{ const li=document.createElement('li'); li.textContent=r; ul.appendChild(li); });
  if (typeof dlg.showModal==='function') dlg.showModal();
  render();
}

// UI
document.getElementById('reset').addEventListener('click',()=>{ state.cx=-20; state.cy=-12; state.scale=3.0; render(); });
document.getElementById('togglePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden=!document.getElementById('panel').hidden; });
document.getElementById('closePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden=true; });
document.getElementById('regionFilter').addEventListener('change', refreshList);
const searchEl=document.getElementById('search'); searchEl.addEventListener('input', refreshList);

function refreshList(){
  const q=(searchEl.value||'').toLowerCase(); const reg=document.getElementById('regionFilter').value;
  const list=document.getElementById('list'); list.innerHTML='';
  state.planets.filter(p=>(!q||p.name.toLowerCase().includes(q)) && (!reg||p.region===reg)).sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{
    const li=document.createElement('li'); li.innerHTML=`<span>${p.name}</span><small>${p.region||''}</small>`;
    li.addEventListener('click',()=>{ flyTo(p.x,p.y,2.4); selectPlanet(p.id); }); list.appendChild(li);
  });
}

function flyTo(x,y,s){
  const steps=18; const start={cx:state.cx,cy:state.cy,scale:state.scale}; const end={cx:x,cy:y,scale:Math.max(state.scale,s||state.scale)};
  let t=0; const step=()=>{ t++; const k=1-Math.pow(1-t/steps,3); state.cx=start.cx+(end.cx-start.cx)*k; state.cy=start.cy+(end.cy-start.cy)*k; state.scale=start.scale+(end.scale-start.scale)*k; render(); if(t<steps) requestAnimationFrame(step); }; step();
}

// utils
function dist(a,b){ const dx=a.clientX-b.clientX, dy=a.clientY-b.clientY; return Math.hypot(dx,dy); }
function mid(a,b){ return {x:(a.clientX+b.clientX)/2, y:(a.clientY+b.clientY)/2}; }
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; } }
function noise(x,y){ return Math.sin(x*2.3+y*1.7)*Math.cos(x*1.1-y*2.0)*0.5; }

// grid->world utility (for data pre-placement reuse)
function gridToWorld(grid){
  if(!grid) return [0,0];
  const [letter,rowStr] = grid.split('-'); const row=parseInt(rowStr,10);
  const col = GRID.letters.indexOf(letter.toUpperCase()); if(col<0||!row) return [0,0];
  const x = BOUNDS.minX + (col+0.5)/GRID.cols*(BOUNDS.maxX-BOUNDS.minX);
  const y = BOUNDS.minY + (row-0.5)/GRID.rows*(BOUNDS.maxY-BOUNDS.minY);
  return [x,y];
}

// init
fetch('planets.json').then(r=>r.json()).then(data=>{
  let id=1;
  for(const p of data.planets){
    const [gx,gy]=gridToWorld(p.grid||'M-11');
    const ox=(p.offset&&p.offset[0])||0, oy=(p.offset&&p.offset[1])||0;
    p.x=gx+ox; p.y=gy+oy; p.id=id++;
  }
  state.planets=data.planets; state.routes=buildRoutes(data.planets);
  resize(); refreshList(); render();

  // mouse coords -> grid readout
  canvas.onmousemove = (e)=>{
    const rect = canvas.getBoundingClientRect(); const [wx,wy]=s2w(e.clientX-rect.left, e.clientY-rect.top);
    const col = Math.min(GRID.cols-1, Math.max(0, Math.floor((wx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols)));
    const row = Math.min(GRID.rows-1, Math.max(0, Math.floor((wy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows)));
    document.getElementById('coords').textContent = `${GRID.letters[col]}-${row+1}`;
  };
});

function findXY(planets, name){ const p=planets.find(q=>q.name===name); return p?[p.x,p.y]:[0,0]; }
function buildRoutes(planets){
  const routes=[];
  const C=findXY(planets,'Corellia'), T=findXY(planets,'Tatooine'), G=findXY(planets,'Geonosis'), R=findXY(planets,'Ryloth');
  routes.push({ name:'Corellian Run', color:'rgba(255,200,120,.55)',
    points:[ C,[C[0]+60,C[1]-40],[T[0]-40,T[1]-10],T, [T[0]+40,T[1]+10],[G[0]+60,G[1]],G, [G[0]+40,G[1]+20],[R[0]+40,R[1]+10],R ] });
  const E=findXY(planets,'Eriadu'), Cor=findXY(planets,'Coruscant');
  routes.push({ name:'Hydian Way', color:'rgba(160,220,255,.55)', points:[ E,[E[0]+40,E[1]-40],[Cor[0]-60,Cor[1]+10],Cor ] });
  const B=findXY(planets,'Brentaal'), D=findXY(planets,'Dantooine');
  routes.push({ name:'Perlemian Trade Route', color:'rgba(255,140,210,.55)',
    points:[ B,[B[0]-40,B[1]+10],[Cor[0]+20,Cor[1]-20],Cor, [Cor[0]+80,Cor[1]-20],[D[0]+40,D[1]-10],D ] });
  const Bes=findXY(planets,'Bespin'), Ho=findXY(planets,'Hoth');
  routes.push({ name:'Rimma Trade Route', color:'rgba(120,255,200,.55)',
    points:[ E,[E[0]+20,E[1]+40],[Bes[0]-10,Bes[1]-10],Bes, [Bes[0]-10,Bes[1]-10],[Ho[0]+20,Ho[1]],Ho ] });
  return routes;
}
