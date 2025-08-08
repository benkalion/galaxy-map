/* Star Wars Galaxy — v9
   - asymmetric regions (slim left, wide right)
   - region labels
   - corrected ring thresholds
   - smoother zoom feel + bigger range
   - grid numbers only at edges
   - keeps simple hooks for search/jump (window.__GALAXY_V9__)
*/

(() => {
  // ====== Canvas boot ======
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const canvas = document.getElementById('galaxy') || (() => {
    const c = document.createElement('canvas');
    c.id = 'galaxy';
    document.body.appendChild(c);
    return c;
  })();
  const ctx = canvas.getContext('2d');

  function fit() {
    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    buildRegionPaths();
    draw();
  }
  window.addEventListener('resize', fit);

  // ====== “World” coords ======
  const world = {
    center: { x: () => canvas.width * 0.46, y: () => canvas.height * 0.54 },
    scale: 1,
    panX: 0, panY: 0
  };

  // ====== Palette (tuned to poster) ======
  const REGION_COLORS = {
    'Deep Core'  : '#f0e08f',
    'Core'       : '#9e86b9',
    'Colonies'   : '#d39265',
    'Inner Rim'  : '#caa6a0',
    'Expansion'  : '#c78ab1',
    'Mid Rim'    : '#78aeca',
    'Outer Rim'  : '#8cb7d6',
    'Unknown'    : '#1a2230'
  };
  const ROUTE_COLOR = '#e8eefc';
  const PLANET_DOT  = '#f6d26a';
  const PLANET_DOT_ALT = '#ffffff';

  // ====== Rings / thresholds ======
  const RINGS = [
    { name:'Deep Core', r0:   0, r1:  70 },
    { name:'Core',      r0:  70, r1: 150 },
    { name:'Colonies',  r0: 150, r1: 240 },
    { name:'Inner Rim', r0: 240, r1: 330 },
    { name:'Expansion', r0: 330, r1: 420 },
    { name:'Mid Rim',   r0: 420, r1: 560 },
    { name:'Outer Rim', r0: 560, r1: 760 }
    // Unknown Regions = outside asymmetric wedge
  ];

  // ====== Asymmetric region radii ======
  const asym = {
    rInner(theta, base) {
      const k = 0.90 + 0.10 * Math.cos(theta);
      return base * k;
    },
    rOuter(theta, base) {
      const k = 0.68 + 0.32 * (1 + Math.cos(theta)) / 2; // 0.68..1.0
      return base * k;
    },
    theta0: -Math.PI * 0.90,
    theta1:  Math.PI * 0.90
  };

  let regionPaths = [];

  function buildRegionPaths() {
    regionPaths = [];
    const c = world.center;
    const cx = c().x + world.panX;
    const cy = c().y + world.panY;

    const steps = 72;
    const { theta0, theta1 } = asym;

    for (const ring of RINGS) {
      const p = new Path2D();
      for (let i = 0; i <= steps; i++) {
        const t = theta0 + (theta1 - theta0) * (i / steps);
        const r = asym.rOuter(t, ring.r1 * world.scale);
        const x = cx + r * Math.cos(t);
        const y = cy + r * Math.sin(t);
        if (i === 0) p.moveTo(x, y); else p.lineTo(x, y);
      }
      for (let i = steps; i >= 0; i--) {
        const t = theta0 + (theta1 - theta0) * (i / steps);
        const r = asym.rInner(t, ring.r0 * world.scale);
        const x = cx + r * Math.cos(t);
        const y = cy + r * Math.sin(t);
        p.lineTo(x, y);
      }
      p.closePath();
      regionPaths.push({ ring, path: p, centroid: regionCentroid(ring) });
    }

    function regionCentroid(ring) {
      const midTheta = 0;
      const rMid = (asym.rInner(midTheta, ring.r0 * world.scale) + asym.rOuter(midTheta, ring.r1 * world.scale)) / 2;
      return {
        x: cx + rMid * Math.cos(midTheta),
        y: cy + rMid * Math.sin(midTheta)
      };
    }
  }

  function planetRegion(px, py) {
    for (let i = 0; i < regionPaths.length; i++) {
      if (ctx.isPointInPath(regionPaths[i].path, px, py)) {
        return RINGS[i].name;
      }
    }
    return 'Unknown Regions';
  }

  // ====== Zoom handling ======
  let scaleTarget = 1;
  const SCALE_MIN = 0.22;
  const SCALE_MAX = 12;

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function animateZoom(to, ms=200){
    scaleTarget = clamp(to, SCALE_MIN, SCALE_MAX);
    const from = world.scale;
    const t0 = performance.now();
    function step(t){
      const k = Math.min(1, (t - t0) / ms);
      const e = k < .5 ? 2*k*k : -1 + (4 - 2*k)*k;
      world.scale = from + (scaleTarget - from) * e;
      buildRegionPaths();
      draw();
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = Math.pow(2, -e.deltaY / 900);
    animateZoom(world.scale * factor, 220);
  }, { passive:false });

  // ====== Panning ======
  let drag=null;
  canvas.addEventListener('pointerdown', e=>{
    drag = { x:e.clientX, y:e.clientY, panX:world.panX, panY:world.panY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e=>{
    if(!drag) return;
    world.panX = drag.panX + (e.clientX - drag.x) * dpr;
    world.panY = drag.panY + (e.clientY - drag.y) * dpr;
    buildRegionPaths(); draw();
  });
  canvas.addEventListener('pointerup', ()=> drag=null);

  // ====== Grid (edge-only labels) ======
  function drawGrid() {
    const w = canvas.width, h = canvas.height;
    const step = 120 * world.scale;
    ctx.save();
    ctx.globalAlpha = 0.20;
    ctx.strokeStyle = '#38506f';
    ctx.lineWidth = 1;

    for (let x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#7f8aa3';
    ctx.font = `${Math.max(10, 12 * world.scale)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    let i = 0;
    for (let x = 0; x <= w; x += step) {
      const col = String.fromCharCode(65 + (i++ % 26));
      ctx.fillText(col, x, 14);
      ctx.fillText(col, x, h - 2);
    }
    i = 1;
    ctx.textAlign = 'right';
    for (let y = 0; y <= h; y += step) {
      ctx.fillText(`${i}`, 26, y);
      ctx.textAlign = 'left';
      ctx.fillText(`${i}`, w - 22, y);
      ctx.textAlign = 'right';
      i++;
    }
    ctx.restore();
  }

  // ====== Regions ======
  function drawRegions() {
    ctx.save();
    for (let i = 0; i < regionPaths.length; i++) {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = REGION_COLORS[RINGS[i].name] || '#445';
      ctx.fill(regionPaths[i].path);
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#e8eefc';
      ctx.lineWidth = 2;
      ctx.stroke(regionPaths[i].path);
    }
    ctx.restore();
  }

  function drawRegionLabels() {
    ctx.save();
    for (const rp of regionPaths) {
      const { name } = rp.ring;
      const { x, y } = rp.centroid;
      const size = Math.max(10, Math.min(28, 12 + 3*Math.log2(world.scale + 1)));
      ctx.globalAlpha = 0.8;
      ctx.font = `bold ${size}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#eef3ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name.toUpperCase(), x, y);
    }
    ctx.restore();
  }

  // ====== Data hooks ======
  const planets = window.PLANETS || [];   // [{x,y,name,famous?}]
  const routes  = window.ROUTES  || [];   // [{pts:[{x,y},...], name }]

  function drawRoutes(){
    if(!routes.length) return;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 3;
    ctx.strokeStyle = ROUTE_COLOR;
    for(const r of routes){
      ctx.beginPath();
      for(let i=0;i<r.pts.length;i++){
        const p = screenXY(r.pts[i].x, r.pts[i].y);
        if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlanets(){
    if(!planets.length) return;
    ctx.save();
    for(const p of planets){
      const s = screenXY(p.x, p.y);
      p.region = planetRegion(s.x, s.y);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3 + 0.8*Math.log2(world.scale+1), 0, Math.PI*2);
      ctx.fillStyle = (p.famous ? PLANET_DOT : PLANET_DOT_ALT);
      ctx.globalAlpha = p.famous ? 0.95 : 0.75;
      ctx.fill();
    }
    ctx.restore();
  }

  function screenXY(wx, wy){
    const cx = world.center().x + world.panX;
    const cy = world.center().y + world.panY;
    return { x: cx + (wx * world.scale), y: cy + (wy * world.scale) };
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#0b101a';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawGrid();
    buildRegionPaths();
    drawRegions();
    drawRegionLabels();
    drawRoutes();
    drawPlanets();

    // footer/version badge
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#c8d2ee';
    ctx.font = `12px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('v9 — asymmetric regions, labels, thresholds, zoom, edge grid', canvas.width - 10, canvas.height - 10);
    ctx.restore();
  }

  function init(){
    fit();
    buildRegionPaths();
    animateZoom(0.9, 0);
  }

  // expose tiny API for search/jump
  window.__GALAXY_V9__ = {
    setZoom: (z) => animateZoom(z, 180),
    setPan:  (x,y) => { world.panX=x; world.panY=y; buildRegionPaths(); draw(); },
    regionOf: (x,y) => planetRegion(x,y),
    // jump by planet name (simple, case-insensitive)
    jumpTo: (name) => {
      if(!planets.length || !name) return;
      const p = planets.find(pp => (pp.name||'').toLowerCase() === String(name).toLowerCase());
      if(!p) return;
      const s = screenXY(p.x, p.y);
      world.panX += (s.x - (canvas.width/2));
      world.panY += (s.y - (canvas.height/2));
      animateZoom(2.4, 240);
    }
  };

  init();
})();