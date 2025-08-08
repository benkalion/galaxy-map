/* v5 — deeper zoom, better sectors, clickable trade routes, improved popups, dynamic region jumps */
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d', {alpha:false});
let DPR = Math.max(1, window.devicePixelRatio||1); let W=0,H=0;

// Grid & world
const GRID = { cols:18, rows:21, letters:'CDEFGHIJKLMNOPQRSTU'.split('') };
const BOUNDS = { minX:-360, maxX:360, minY:-320, maxY:320 };

// dynamic camera min scale so whole galaxy fits but not too small
let MIN_SCALE = 0.45; // updated in resize()
const state = { cx:-20, cy:-8, scale:4.6, hover:null, sel:null, planets:[], routes:[], sectorShapes:[], selectedRoute:null };

// palettes (closer to poster hues)
const SECTOR = {
  'Deep Core':'rgba(255,255,255,.55)', // bright center
  'Core':'rgba(255,230,120,.48)',
  'Colonies':'rgba(255,160,80,.38)',
  'Inner Rim':'rgba(255,150,230,.34)',
  'Expansion Region':'rgba(160,255,220,.28)',
  'Mid Rim':'rgba(130,210,255,.24)',
  'Outer Rim':'rgba(120,180,255,.20)',
  'Unknown Regions':'rgba(226,160,255,.28)'
};
const LABEL = {
  'Deep Core':'#ffffff','Core':'#ffe4a6','Colonies':'#ffbf96','Inner Rim':'#ffc8eb','Expansion Region':'#d8ffea',
  'Mid Rim':'#c8eaff','Outer Rim':'#f6dcc6','Unknown Regions':'#ecd0ff', default:'#eaf3ff'
};

function resize(){
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.floor(r.width*DPR); canvas.height = Math.floor(r.height*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0); W=r.width; H=r.height;
  // compute min scale to fit bounds snugly
  const sx = W / (BOUNDS.maxX-BOUNDS.minX);
  const sy = H / (BOUNDS.maxY-BOUNDS.minY);
  MIN_SCALE = Math.min(sx, sy)*0.92;
  render();
}
window.addEventListener('resize', resize);

// world/screen helpers
function w2s(x,y){ return [(x-state.cx)*state.scale + W/2, (y-state.cy)*state.scale + H/2]; }
function s2w(x,y){ return [(x - W/2)/state.scale + state.cx, (y - H/2)/state.scale + state.cy]; }
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

function render(){
  drawBackground();
  drawSectorsWorld();  // world-anchored
  drawSpiralArms();
  drawRoutes();
  drawPlanets();
  drawLabels();
  drawGridScreen();    // edge labels based on viewport
}

function drawBackground(){
  ctx.clearRect(0,0,W,H);
  const g = ctx.createRadialGradient(W*.6,H*.35,10,W*.5,H*.5,Math.max(W,H)*.95);
  g.addColorStop(0,'rgba(22,48,120,.72)'); g.addColorStop(1,'rgba(0,0,0,.95)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // starfield
  const rng = mulberry32(2025);
  for(let i=0;i<620;i++){
    const x=rng()*W, y=rng()*H, r=Math.max(.3,rng()*1.6);
    ctx.globalAlpha=.35+rng()*.6; ctx.fillStyle='#eaf3ff'; ctx.beginPath(); ctx.arc(x,y,r,0,6.283); ctx.fill();
    if (rng()>.9){ ctx.globalAlpha=.28; ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.strokeStyle='rgba(190,220,255,.35)'; ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(x,y-5); ctx.lineTo(x,y+5); ctx.stroke(); }
  }
  ctx.globalAlpha=1;
  // scanlines
  ctx.globalAlpha=.05; ctx.fillStyle='#000'; for(let y=0;y<H;y+=3){ ctx.fillRect(0,y,W,1); } ctx.globalAlpha=1;
}

// ===== Sector shapes in world coordinates, irregular =====
function buildSectors(){
  const cx=-20, cy=0;
  // radius function by angle (radians), with bulges for each ring
  const mk = (base, bumps)=>{
    return (t)=>{
      let r=base;
      for(const b of bumps){
        const dt = Math.atan2(Math.sin(t-b.a), Math.cos(t-b.a)); // shortest angle
        r += b.h * Math.exp(-(dt*dt)/(2*b.w*b.w));
      }
      return r * bScale(t);
    };
  };
  // slight spiral-ish squish like poster
  const bScale = (t)=> (1 + 0.06*Math.sin(t*2) - 0.03*Math.cos(t*3));

  // Bumps tuned by eye to approximate poster
  const deep = mk(60,  [{a:0.5,h:6,w:.9},{a:3.6,h:4,w:.7}]);
  const core = mk(102, [{a:0.2,h:18,w:.8},{a:2.7,h:10,w:.9},{a:4.7,h:8,w:.7}]);
  const colonies = mk(142,[{a:.1,h:24,w:.9},{a:2.4,h:16,w:1.0},{a:5.0,h:10,w:.8}]);
  const inner = mk(178, [{a:0.0,h:28,w:.9},{a:2.2,h:22,w:1.1},{a:5.1,h:12,w:.8}]);
  const exp = mk(216,   [{a:-.2,h:30,w:1.0},{a:2.1,h:24,w:1.1},{a:4.9,h:14,w:.9}]);
  const mid = mk(258,   [{a:-.4,h:36,w:1.0},{a:1.9,h:28,w:1.2},{a:4.7,h:18,w:1.0}]);
  const outer = mk(322, [{a:-.6,h:44,w:1.2},{a:1.8,h:36,w:1.2},{a:4.6,h:26,w:1.2}]);

  const blob=(fn,sx,sy,steps=200)=>{
    const pts=[];
    for(let i=0;i<=steps;i++){
      const t=i/steps*Math.PI*2;
      const r = fn(t);
      const x=cx+Math.cos(t)*r*sx, y=cy+Math.sin(t)*r*.88*sy;
      pts.push([x,y]);
    }
    return pts;
  };

  state.sectorShapes = [
    {name:'Deep Core', fill:SECTOR['Deep Core'], pts:blob(deep,.86,.78)},
    {name:'Core', fill:SECTOR['Core'], pts:blob(core,.94,.88)},
    {name:'Colonies', fill:SECTOR['Colonies'], pts:blob(colonies,1.01,.96)},
    {name:'Inner Rim', fill:SECTOR['Inner Rim'], pts:blob(inner,1.05,1.00)},
    {name:'Expansion Region', fill:SECTOR['Expansion Region'], pts:blob(exp,1.09,1.05)},
    {name:'Mid Rim', fill:SECTOR['Mid Rim'], pts:blob(mid,1.14,1.08)},
    {name:'Outer Rim', fill:SECTOR['Outer Rim'], pts:blob(outer,1.22,1.13)}
  ];

  // Unknown Regions: big asymmetric shape on left hugging rings
  const UR=[]; const steps=140;
  for(let i=0;i<=steps;i++){
    const t = -Math.PI*0.86 + (i/steps)*Math.PI*1.42; // left-side arc only
    const r = outer(t)*1.04; // slightly outside outer rim
    const x=cx+Math.cos(t)*r*1.02, y=cy+Math.sin(t)*r*.90;
    UR.push([x,y]);
  }
  // close wedge to the far left boundary
  UR.push([BOUNDS.minX, BOUNDS.maxY]);
  UR.push([BOUNDS.minX, BOUNDS.minY]);
  state.sectorShapes.push({name:'Unknown Regions', fill:SECTOR['Unknown Regions'], pts:UR});
}

function drawSectorsWorld(){
  if(!state.sectorShapes.length) buildSectors();
  for(const s of state.sectorShapes){
    ctx.save(); ctx.fillStyle=s.fill; ctx.beginPath();
    s.pts.forEach((p,i)=>{ const [x,y]=w2s(p[0],p[1]); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // labels in world space
  const labels=[
    ['DEEP CORE', -20, -8], ['CORE', -10, 10], ['COLONIES', 10, 36], ['INNER RIM', 30, 70],
    ['EXPANSION', 58, 108], ['MID RIM', 92, 142], ['OUTER RIM', 142, 182]
  ];
  for(const L of labels){ const [sx,sy]=w2s(L[1],L[2]); textGlow(L[0], sx, sy, 14); }
  // Unknown Regions label at left
  textGlow('UNKNOWN REGIONS', 30, H*.45, 18);
}
// =============================================

function drawSpiralArms(){
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const arms=[{cx:W*.44,cy:H*.66,a:-.7,r:W*.58},{cx:W*.72,cy:H*.36,a:2.3,r:W*.66}];
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
  const bar=document.getElementById('routesBar'); if(!bar.dataset.init){
    bar.dataset.init='1'; bar.innerHTML='';
    state.routes.forEach((r,i)=>{
      const btn=document.createElement('button'); btn.className='routeTag'; btn.textContent=r.name; btn.style.color=r.color;
      btn.addEventListener('click',()=>{ state.selectedRoute = (state.selectedRoute===i?null:i); render(); });
      bar.appendChild(btn);
    });
  }
  // highlight if selected
  const btns=[...document.querySelectorAll('#routesBar .routeTag')];
  btns.forEach((b,i)=> b.classList.toggle('active', state.selectedRoute===i));

  ctx.save(); ctx.lineCap='round'; ctx.globalCompositeOperation='lighter';
  state.routes.forEach((r,idx)=>{
    const isSel = state.selectedRoute===idx;
    ctx.shadowBlur=isSel?18:10; ctx.shadowColor=r.color; ctx.strokeStyle=r.color; ctx.lineWidth=isSel?5:3;
    ctx.beginPath();
    const pts = r.points.map(p=>w2s(p[0],p[1]));
    ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i+=3){ const a=pts[i], b=pts[i+1], c=pts[i+2]; ctx.bezierCurveTo(a[0],a[1],b[0],b[1],c[0],c[1]); }
    ctx.stroke();

    // draw route name near its midpoint
    const mid = bezierPoint(pts[Math.floor((pts.length-1)/3)*3-3], pts[Math.floor((pts.length-1)/3)*3-2], pts[Math.floor((pts.length-1)/3)*3-1], pts[Math.floor((pts.length-1)/3)*3], 0.5);
    textGlow(r.name, mid[0]+6, mid[1]-6, 12);
  });
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
    if (state.scale < 1.2 && !p.featured) continue;
    const dx=8, dy=-2; const txt=p.name;
    ctx.lineWidth=4; ctx.strokeStyle='rgba(8,16,36,.96)'; ctx.strokeText(txt,sx+dx,sy+dy);
    ctx.fillStyle = LABEL[p.region]||LABEL.default; ctx.fillText(txt,sx+dx,sy+dy);
  }
  ctx.restore();
}

// Grid overlay with dynamic labels based on viewport
function drawGridScreen(){
  const overlay = document.getElementById('gridOverlay');
  const [wminx,wminy]=s2w(0,0); const [wmaxx,wmaxy]=s2w(W,H);
  const colStart = Math.max(0, Math.floor((wminx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols));
  const colEnd   = Math.min(GRID.cols-1, Math.floor((wmaxx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols));
  const rowStart = Math.max(0, Math.floor((wminy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows));
  const rowEnd   = Math.min(GRID.rows-1, Math.floor((wmaxy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows));
  const letters = GRID.letters.slice(colStart, colEnd+1);
  const nums = Array.from({length: rowEnd-rowStart+1}, (_,i)=>i+rowStart+1);
  overlay.innerHTML = `
    <div class="top labels">${letters.map(l=>`<span>${l}</span>`).join('')}</div>
    <div class="bottom labels">${letters.map(l=>`<span>${l}</span>`).join('')}</div>
    <div class="left numbers">${nums.map(n=>`<span>${n}</span>`).join('')}</div>
    <div class="right numbers">${nums.map(n=>`<span>${n}</span>`).join('')}</div>
  `;
  overlay.style.setProperty('--cols', letters.length);
  overlay.style.setProperty('--rows', nums.length);
}
const overlayCSS = document.createElement('style');
overlayCSS.textContent = `
#gridOverlay{position:absolute;inset:0;pointer-events:none;--cols:18;--rows:21}
#gridOverlay .labels{position:absolute;left:0;right:0;display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:0;color:#dceaff;font-size:12px;padding:6px}
#gridOverlay .top{top:0} #gridOverlay .bottom{bottom:0}
#gridOverlay .numbers{position:absolute;top:0;bottom:0;display:grid;grid-template-rows:repeat(var(--rows),1fr);gap:0;color:#dceaff;font-size:12px;align-content:space-between;justify-items:center;padding:6px}
#gridOverlay .left{left:0} #gridOverlay .right{right:0}
`;
document.head.appendChild(overlayCSS);

// Text glow helper
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

let dragging=false,lx=0,ly=0;
canvas.addEventListener('mousedown',e=>{ dragging=true; lx=e.clientX; ly=e.clientY; });
window.addEventListener('mouseup',()=>dragging=false);
window.addEventListener('mousemove',e=>{
  if(dragging){ const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY; state.cx-=dx/state.scale; state.cy-=dy/state.scale; render(); }
  else { const rect=canvas.getBoundingClientRect(); const id=pick(e.clientX-rect.left,e.clientY-rect.top); if(id!==state.hover){ state.hover=id; render(); } }
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const rect=canvas.getBoundingClientRect(); const f = Math.pow(1.05, -Math.sign(e.deltaY)); // very fine zoom steps
  zoomAt(e.clientX-rect.left, e.clientY-rect.top, f);
},{passive:false});
canvas.addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left, my=e.clientY-rect.top;
  // click route name proximity? we draw names near middle; easier: use tag buttons in routesBar
  const id=pick(mx,my); if(id!=null) selectPlanet(id);
});

// touch
let touch=null;
canvas.addEventListener('touchstart',e=>{
  if(e.touches.length===1){ const t=e.touches[0]; touch={mode:'pan',x=t.clientX,y=t.clientY,t:Date.now()}; }
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
  state.scale*=f; state.scale = clamp(state.scale, MIN_SCALE, 5.6); // allow lots of zoom-out only to min that fits galaxy; zoom-in up to 5.6
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
  document.getElementById('dRegionTag').textContent=p.region||'REGION';
  document.getElementById('dRegionTag').style.borderColor = LABEL[p.region]||'#88a';
  document.getElementById('dRegionTag').style.color = LABEL[p.region]||'#cde';
  document.getElementById('dGrid').textContent=p.grid||'—';
  document.getElementById('dFamous').textContent = p.famous || '';
  document.getElementById('dQuote').textContent = p.quoteBy ? `“${p.quote}” — ${p.quoteBy}` : (p.quote?`“${p.quote}”`:'');
  document.getElementById('dNotes').textContent = p.notes||'';
  const ul=document.getElementById('dRoutes'); ul.innerHTML=''; (p.routes||[]).forEach(r=>{
    const li=document.createElement('li');
    const a=document.createElement('a'); a.href="#"; a.textContent=r; a.addEventListener('click',(ev)=>{ev.preventDefault(); focusRouteByName(r);});
    li.appendChild(a); ul.appendChild(li);
  });
  if (typeof dlg.showModal==='function') dlg.showModal();
  render();
}

// UI
document.getElementById('reset').addEventListener('click',()=>{ state.cx=-20; state.cy=-8; state.scale=4.6; state.selectedRoute=null; render(); });
document.getElementById('togglePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden=!document.getElementById('panel').hidden; });
document.getElementById('closePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden=true; });
document.getElementById('regionFilter').addEventListener('change', (e)=>{
  const v=e.target.value; if(!v){ state.selectedRoute=null; render(); return; }
  focusSector(v);
});
const searchEl=document.getElementById('search'); searchEl.addEventListener('input', refreshList);

function refreshList(){
  const q=(searchEl.value||'').toLowerCase(); const list=document.getElementById('list'); list.innerHTML='';
  state.planets.filter(p=>(!q||p.name.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{
    const li=document.createElement('li'); li.innerHTML=`<span>${p.name}</span><small>${p.region||''}</small>`;
    li.addEventListener('click',()=>{ flyTo(p.x,p.y,3.0); selectPlanet(p.id); }); list.appendChild(li);
  });
}

// flyTo helper
function flyTo(x,y,s){
  const steps=22; const start={cx:state.cx,cy:state.cy,scale:state.scale}; const end={cx:x,cy:y,scale:Math.max(MIN_SCALE, Math.min(5.4, s||state.scale))};
  let t=0; const step=()=>{ t++; const k=1-Math.pow(1-t/steps,3); state.cx=start.cx+(end.cx-start.cx)*k; state.cy=start.cy+(end.cy-start.cy)*k; state.scale=start.scale+(end.scale-start.scale)*k; render(); if(t<steps) requestAnimationFrame(step); }; step();
}

// Sector focus by name
function focusSector(name){
  const s = state.sectorShapes.find(s=>s.name===name); if(!s) return;
  // compute bbox
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
  s.pts.forEach(([x,y])=>{ if(x<minx)minx=x; if(y<miny)miny=y; if(x>maxx)maxx=x; if(y>maxy)maxy=y; });
  const cx=(minx+maxx)/2, cy=(miny+maxy)/2;
  // scale so bbox fits 60% of screen for context
  const sx = (W*0.6)/(maxx-minx), sy = (H*0.6)/(maxy-miny);
  const sc = Math.min(5.4, Math.max(MIN_SCALE, Math.min(sx,sy)));
  flyTo(cx,cy,sc);
}

// Route helpers
function findXY(planets, name){ const p=planets.find(q=>q.name===name); return p?[p.x,p.y]:[0,0]; }
function buildRoutes(planets){
  const routes=[];
  const C=findXY(planets,'Corellia'), T=findXY(planets,'Tatooine'), G=findXY(planets,'Geonosis'), R=findXY(planets,'Ryloth');
  routes.push({ name:'Corellian Run', color:'rgba(255,200,120,.75)',
    points:[ C,[C[0]+60,C[1]-40],[T[0]-40,T[1]-10],T, [T[0]+40,T[1]+10],[G[0]+60,G[1]],G, [G[0]+40,G[1]+20],[R[0]+40,R[1]+10],R ] });
  const E=findXY(planets,'Eriadu'), Cor=findXY(planets,'Coruscant');
  routes.push({ name:'Hydian Way', color:'rgba(160,220,255,.8)', points:[ E,[E[0]+40,E[1]-40],[Cor[0]-60,Cor[1]+10],Cor ] });
  const B=findXY(planets,'Brentaal'), D=findXY(planets,'Dantooine');
  routes.push({ name:'Perlemian Trade Route', color:'rgba(255,140,210,.8)',
    points:[ B,[B[0]-40,B[1]+10],[Cor[0]+20,Cor[1]-20],Cor, [Cor[0]+80,Cor[1]-20],[D[0]+40,D[1]-10],D ] });
  const Bes=findXY(planets,'Bespin'), Ho=findXY(planets,'Hoth');
  routes.push({ name:'Rimma Trade Route', color:'rgba(120,255,200,.8)',
    points:[ E,[E[0]+20,E[1]+40],[Bes[0]-10,Bes[1]-10],Bes, [Bes[0]-10,Bes[1]-10],[Ho[0]+20,Ho[1]],Ho ] });
  return routes;
}
function focusRouteByName(name){
  const idx = state.routes.findIndex(r=>r.name===name); if(idx<0) return;
  state.selectedRoute = idx;
  // compute route bbox
  const r=state.routes[idx];
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
  r.points.forEach(([x,y])=>{ if(x<minx)minx=x; if(y<miny)miny=y; if(x>maxx)maxx=x; if(y>maxy)maxy=y; });
  const cx=(minx+maxx)/2, cy=(miny+maxy)/2;
  const sx = (W*0.7)/(maxx-minx), sy=(H*0.7)/(maxy-miny);
  flyTo(cx,cy,Math.min(5.2,Math.max(MIN_SCALE,Math.min(sx,sy))));
  render();
}

// geometry utils
function bezierPoint(p0,p1,p2,p3,t){
  const u=1-t;
  const x=u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0];
  const y=u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1];
  return [x,y];
}

// utils
function dist(a,b){ const dx=a.clientX-b.clientX, dy=a.clientY-b.clientY; return Math.hypot(dx,dy); }
function mid(a,b){ return {x:(a.clientX+b.clientX)/2, y:(a.clientY+b.clientY)/2}; }
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; } }

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
  buildSectors();
  resize(); refreshList(); render();

  canvas.onmousemove = (e)=>{
    const rect = canvas.getBoundingClientRect(); const [wx,wy]=s2w(e.clientX-rect.left, e.clientY-rect.top);
    const col = Math.min(GRID.cols-1, Math.max(0, Math.floor((wx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols)));
    const row = Math.min(GRID.rows-1, Math.max(0, Math.floor((wy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows)));
    document.getElementById('coords').textContent = `${GRID.letters[col]}-${row+1}`;
  };
});
