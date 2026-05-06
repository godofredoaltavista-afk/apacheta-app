/* =============================================
   APACHETA — CARTA ASTRAL PANEL
   Panel full-screen · tabs: CARTA | NÚMEROS | TAROT
   Swiss Ephemeris via astro.com/cgi/swetest.cgi
   ============================================= */

import { getUser, saveUser } from '../main.js';
import { UserStore }          from '../state/UserStore.js';
import { TEXTOS_PLANETA, TEXTOS_ASC } from '../data/astro-textos.js';
import { TEXTOS_CASA }                from '../data/astro-casas.js';
import { ARCANOS, getTirada, getCardOfDay } from '../data/tarot-arcanos.js';

// ─── Constantes ───────────────────────────────
const SIGNOS = [
  'Aries','Tauro','Géminis','Cáncer','Leo','Virgo',
  'Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis',
];
const GLIFOS_SIGNO   = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const GLIFOS_PLANETA = {
  Sol:'☉', Luna:'☽', Mercurio:'☿', Venus:'♀', Marte:'♂',
  Júpiter:'♃', Saturno:'♄', Urano:'♅', Neptuno:'♆', Plutón:'♇',
  'Nodo Norte':'☊',
};
const COLORES_PLANETA = {
  Sol:'#FFD700', Luna:'#C8C8FF', Mercurio:'#A8E6E0', Venus:'#F4C2C2',
  Marte:'#FF6B6B', Júpiter:'#FFB347', Saturno:'#C8B870', Urano:'#7FDBFF',
  Neptuno:'#9B59B6', Plutón:'#C0392B', 'Nodo Norte':'#88AACC',
};
const SIGNOS_COLORS = [
  '#FF9B9B','#C8A87A','#FFD84A','#7BBFD3',
  '#FFD700','#A8C89A','#F4C2C2','#9A5078',
  '#FF9B4A','#7A9878','#A8E6E0','#7BBFD3',
];
const ELEM_COLORS = { Fuego:'#FF6B6B', Tierra:'#C8A87A', Aire:'#A8E6E0', Agua:'#7BBFD3' };

// ─── Estado ─────────────────────────────────────
let chartState   = null;
let threeDispose = null;

// ─── Helpers ────────────────────────────────────
function lonToSign(lon) {
  const l   = ((lon % 360) + 360) % 360;
  const idx = Math.floor(l / 30);
  const deg = Math.floor(l % 30);
  const min = Math.floor((l % 30 - deg) * 60);
  return { signo: SIGNOS[idx], idx, grado: deg, minuto: min, lon: l };
}

function formatPos(lon) {
  const { signo, grado, minuto } = lonToSign(lon);
  return `${signo} ${grado}°${String(minuto).padStart(2,'0')}'`;
}

function dateToSwetest(d) {
  const [y, m, dd] = d.split('-');
  return `${dd}.${m}.${y}`;
}

function latLonToSwetest(lat, lon) {
  const aLat = Math.abs(lat), aLon = Math.abs(lon);
  const laDeg = Math.floor(aLat), laMin = Math.round((aLat - laDeg) * 60);
  const loDeg = Math.floor(aLon), loMin = Math.round((aLon - loDeg) * 60);
  return {
    latStr: `${laDeg}${lat >= 0 ? 'n' : 's'}${String(laMin).padStart(2,'0')}`,
    lonStr: `${loDeg}${lon >= 0 ? 'e' : 'w'}${String(loMin).padStart(2,'0')}`,
  };
}

function getPlanetHouse(lon, houses) {
  if (!houses || houses.length < 12) return null;
  const l = ((lon % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    if (houses[i] == null) continue;
    const h    = ((houses[i]             % 360) + 360) % 360;
    const next = ((houses[(i + 1) % 12]  % 360) + 360) % 360;
    if (next > h) { if (l >= h && l < next) return i + 1; }
    else          { if (l >= h || l < next) return i + 1; }
  }
  return 1;
}

// ─── APIs ────────────────────────────────────────
async function geocodeCity(q) {
  const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=5`);
  if (!r.ok) throw new Error('geocoding failed');
  return r.json();
}

async function getTimezoneOffset(lat, lon) {
  try {
    const r = await fetch(`https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`);
    const d = await r.json();
    const secs = d.currentUtcOffset?.seconds ?? d.currentUtcOffset?.Seconds ?? 0;
    return secs / 3600;
  } catch { return -3; }
}

async function fetchChartRaw(date, ut, lat, lon) {
  const { latStr, lonStr } = latLonToSwetest(lat, lon);
  const params = new URLSearchParams({
    b: dateToSwetest(date), ut: ut.toFixed(4),
    p: '0123456789t', f: 'Pl',
    lat: latStr, lon: lonStr,
    house: `${latStr},${lonStr},P`,
  });
  const r = await fetch(`/api/chart?${params}`);
  if (!r.ok) throw new Error(`swetest error ${r.status}`);
  return r.text();
}

// ─── Parse swetest ───────────────────────────────
function parseSwetest(text) {
  if (import.meta.env?.DEV) console.log('[swetest raw]', text);

  const nameMap = {
    Sun:'Sol', Moon:'Luna', Mercury:'Mercurio', Venus:'Venus',
    Mars:'Marte', Jupiter:'Júpiter', Saturn:'Saturno', Uranus:'Urano',
    Neptune:'Neptuno', Pluto:'Plutón', 'true Node':'Nodo Norte', 'mean Node':'Nodo Norte',
  };
  const planets = {}, houses = [];

  const pRe = /^(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|true Node|mean Node)\s+([\d.]+)/gm;
  let m;
  while ((m = pRe.exec(text)) !== null) {
    const esp = nameMap[m[1]] || m[1];
    if (planets[esp] == null) planets[esp] = parseFloat(m[2]);
  }

  // House cusps — multiple format fallbacks
  const hRe = /house\s+(\d+)\s*:\s*([\d.]+)/gi;
  while ((m = hRe.exec(text)) !== null) houses[parseInt(m[1]) - 1] = parseFloat(m[2]);

  if (houses[0] == null) {
    const aM = /^Asc(?:endant)?\s*[:\s]\s*([\d.]+)/im.exec(text);
    if (aM) houses[0] = parseFloat(aM[1]);
  }
  if (houses[9] == null) {
    const mcM = /^MC\s*[:\s]\s*([\d.]+)/im.exec(text);
    if (mcM) houses[9] = parseFloat(mcM[1]);
  }

  return { planets, houses };
}

// ─── Aspectos ────────────────────────────────────
function calcAspectos(planets) {
  const DEFS = [
    { nombre:'Conjunción', deg:0,   orb:8, color:'#FFD700' },
    { nombre:'Sextil',     deg:60,  orb:6, color:'#A8E6E0' },
    { nombre:'Cuadratura', deg:90,  orb:8, color:'#FF6B6B' },
    { nombre:'Trino',      deg:120, orb:8, color:'#B8FF4A' },
    { nombre:'Oposición',  deg:180, orb:8, color:'#FF9F43' },
  ];
  const keys = Object.keys(planets), out = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a1 = ((planets[keys[i]] % 360) + 360) % 360;
      const a2 = ((planets[keys[j]] % 360) + 360) % 360;
      let diff = Math.abs(a1 - a2);
      if (diff > 180) diff = 360 - diff;
      for (const asp of DEFS) {
        if (Math.abs(diff - asp.deg) <= asp.orb)
          out.push({ p1:keys[i], p2:keys[j], ...asp, orb: Math.abs(diff - asp.deg).toFixed(1) });
      }
    }
  }
  return out;
}

// ─── Distribución elementos ──────────────────────
function calcDistribucion(planets) {
  const ELEMS = { Fuego:['Aries','Leo','Sagitario'], Tierra:['Tauro','Virgo','Capricornio'],
                  Aire:['Géminis','Libra','Acuario'], Agua:['Cáncer','Escorpio','Piscis'] };
  const MODAL = { Cardinal:['Aries','Cáncer','Libra','Capricornio'],
                  Fijo:['Tauro','Leo','Escorpio','Acuario'],
                  Mutable:['Géminis','Virgo','Sagitario','Piscis'] };
  const elem = { Fuego:0, Tierra:0, Aire:0, Agua:0 };
  const modal = { Cardinal:0, Fijo:0, Mutable:0 };
  for (const p of ['Sol','Luna','Mercurio','Venus','Marte','Júpiter','Saturno']) {
    if (planets[p] == null) continue;
    const { signo } = lonToSign(planets[p]);
    for (const [el, s] of Object.entries(ELEMS)) if (s.includes(signo)) elem[el]++;
    for (const [mod, s] of Object.entries(MODAL)) if (s.includes(signo)) modal[mod]++;
  }
  return { elem, modal };
}

// ─── Canvas2D Zodiac Wheel ───────────────────────
function drawZodiacWheel(canvas, planets, houses, aspectos) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const CX = W / 2, CY = H / 2;
  const RO = Math.min(W, H) / 2 - 6;
  const RS = RO - 22, RI = RO - 72;
  ctx.clearRect(0, 0, W, H);
  // Fondo adaptado: detecta si el panel está en modo oscuro
  const isDark = document.getElementById('ca-panel')?.classList.contains('ca-dark');
  ctx.fillStyle = isDark ? '#0c0e1c' : 'rgba(20,10,40,0.04)';
  ctx.fillRect(0, 0, W, H);

  const toA = (lon) => Math.PI - (((lon % 360) + 360) % 360) * Math.PI / 180;

  // Zodiac segments — fill/stroke más intenso en light mode
  const segFill   = isDark ? '18' : '30';
  const segStroke = isDark ? '40' : '80';
  const glyphAlpha = isDark ? 'CC' : 'FF';
  for (let i = 0; i < 12; i++) {
    const sa = toA(i * 30), ea = toA((i + 1) * 30);
    ctx.beginPath(); ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, RO, sa, ea, true); ctx.closePath();
    ctx.fillStyle   = SIGNOS_COLORS[i] + segFill; ctx.fill();
    ctx.strokeStyle = SIGNOS_COLORS[i] + segStroke; ctx.lineWidth = 0.5; ctx.stroke();

    const midA = (sa + ea) / 2, sr = (RO + RS) / 2 + 6;
    ctx.save();
    ctx.translate(CX + sr * Math.cos(midA), CY + sr * Math.sin(midA));
    ctx.font = 'bold 10px serif';
    ctx.fillStyle = SIGNOS_COLORS[i] + glyphAlpha;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(GLIFOS_SIGNO[i], 0, 0);
    ctx.restore();
  }

  const ringCol = isDark ? 'rgba(200,200,230,0.12)' : 'rgba(80,60,120,0.10)';
  [RO, RS, RI].forEach(r => {
    ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2);
    ctx.strokeStyle = ringCol; ctx.lineWidth = 0.7; ctx.stroke();
  });

  // House cusps
  if (houses?.length >= 12) {
    const angLabels = ['ASC','IC','DSC','MC'];
    for (let i = 0; i < 12; i++) {
      if (houses[i] == null) continue;
      const a = toA(houses[i]), angular = [0,3,6,9].includes(i);
      ctx.beginPath();
      ctx.moveTo(CX + RI * Math.cos(a), CY + RI * Math.sin(a));
      ctx.lineTo(CX + RS * Math.cos(a), CY + RS * Math.sin(a));
      ctx.strokeStyle = angular
        ? (isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,80,220,0.5)')
        : (isDark ? 'rgba(150,150,200,0.18)' : 'rgba(100,80,160,0.18)');
      ctx.lineWidth = angular ? 1.2 : 0.4; ctx.stroke();
    }
    [0,3,6,9].forEach((hi, li) => {
      if (houses[hi] == null) return;
      const a = toA(houses[hi]), lr = RI - 10;
      ctx.fillStyle = isDark ? 'rgba(180,160,255,0.65)' : 'rgba(100,60,200,0.75)';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(angLabels[li], CX + lr * Math.cos(a), CY + lr * Math.sin(a));
    });
  }

  // Aspect lines
  if (aspectos?.length) {
    const sorted = [...aspectos].sort((a,b) => parseFloat(a.orb)-parseFloat(b.orb)).slice(0,14);
    const RA = RI - 3;
    sorted.forEach(asp => {
      const l1 = planets[asp.p1], l2 = planets[asp.p2];
      if (l1 == null || l2 == null) return;
      ctx.beginPath();
      ctx.moveTo(CX + RA * Math.cos(toA(l1)), CY + RA * Math.sin(toA(l1)));
      ctx.lineTo(CX + RA * Math.cos(toA(l2)), CY + RA * Math.sin(toA(l2)));
      ctx.strokeStyle = asp.color + '44'; ctx.lineWidth = 0.6; ctx.stroke();
    });
  }

  // Planets
  const placed = [];
  ['Sol','Luna','Mercurio','Venus','Marte','Júpiter','Saturno','Urano','Neptuno','Plutón'].forEach(name => {
    const lon = planets[name]; if (lon == null) return;
    let a = toA(lon);
    for (const prev of placed) if (Math.abs(a - prev) < 0.18) a += 0.18;
    placed.push(a);
    const pr = (RS + RI) / 2 - 4;
    const px = CX + pr * Math.cos(a), py = CY + pr * Math.sin(a);
    const col = COLORES_PLANETA[name] || '#888';
    const ta = toA(lon);
    ctx.beginPath();
    ctx.moveTo(CX + (RI + 2) * Math.cos(ta), CY + (RI + 2) * Math.sin(ta));
    ctx.lineTo(CX + RS * Math.cos(ta), CY + RS * Math.sin(ta));
    ctx.strokeStyle = col + '40'; ctx.lineWidth = 0.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    // Glifo del planeta: borde para visibilidad en ambos modos
    ctx.font = '8px serif';
    ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.strokeText(GLIFOS_PLANETA[name] || '•', px, py - 4);
    ctx.fillStyle = isDark ? '#fff' : '#111';
    ctx.fillText(GLIFOS_PLANETA[name] || '•', px, py - 4);
  });

  ctx.beginPath(); ctx.arc(CX, CY, 18, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#0c0e1c' : '#F4F0EC'; ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(200,200,230,0.12)' : 'rgba(80,60,120,0.15)'; ctx.lineWidth = 0.7; ctx.stroke();
}

// ─── Procedural planet texture ───────────────────
function makePlanetTexture(THREE, name) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const palettes = {
    Sol:          ['#FFD700','#FF9B00','#FF6B00'],
    Luna:         ['#D8D8E8','#A8A8C0','#ECECF8'],
    Mercurio:     ['#A8C8C0','#607880','#90B0B0'],
    Venus:        ['#F4C2C2','#E89090','#F8E0D0'],
    Marte:        ['#DD4444','#AA2020','#993333'],
    Júpiter:      ['#E0B870','#B87840','#F0D090'],
    Saturno:      ['#D0C080','#B0A060','#E8D8A0'],
    Urano:        ['#80D0E8','#5098C0','#A0E8FF'],
    Neptuno:      ['#5060C8','#4050A0','#7080E0'],
    Plutón:       ['#904848','#602020','#B06060'],
    'Nodo Norte': ['#88AACC','#6688AA','#AACCEE'],
  };
  const pal = palettes[name] || ['#888','#666','#AAA'];
  const half = size / 2;
  const grad = ctx.createRadialGradient(half - half*0.3, half - half*0.3, half*0.05, half, half, half);
  grad.addColorStop(0, pal[0]); grad.addColorStop(0.5, pal[1]); grad.addColorStop(1, pal[2]+'44');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
  const rng = s => { const x = Math.sin(s+1)*10000; return x - Math.floor(x); };
  if (['Júpiter','Saturno','Urano','Neptuno'].includes(name)) {
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.03 + 0.05*rng(i*5.7)})`;
      ctx.fillRect(0, size*rng(i*7.3+1), size, size*(0.03+0.05*rng(i*3.1)));
    }
  }
  if (['Luna','Mercurio','Marte','Plutón'].includes(name)) {
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(size*rng(i*11.1+2), size*rng(i*7.7+5), 3+18*rng(i*3.3+1), 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,0,0,${0.08+0.14*rng(i*9.1)})`; ctx.fill();
    }
  }
  const hg = ctx.createRadialGradient(half-half*0.4, half-half*0.4, 0, half, half, half);
  hg.addColorStop(0, 'rgba(255,255,255,0.38)'); hg.addColorStop(0.4, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg; ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// ─── Three.js Inmersivo ──────────────────────────
async function initThreeInmersivo(canvas, planets, aspectos) {
  if (threeDispose) { threeDispose(); threeDispose = null; }
  const THREE = await import('three');
  const W = canvas.offsetWidth || 360, H = canvas.offsetHeight || 340;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 500);
  camera.position.set(0, 14, 24); camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0x223355, 0.65));
  const sunLight = new THREE.PointLight(0xFFD070, 5, 90); scene.add(sunLight);
  const dLight = new THREE.DirectionalLight(0x4466AA, 0.35);
  dLight.position.set(-10, 8, -5);
  scene.add(dLight);
  // Stars
  const starN = 1400, sP = new Float32Array(starN*3), sC = new Float32Array(starN*3);
  for (let i = 0; i < starN; i++) {
    sP[i*3]=(Math.random()-.5)*300; sP[i*3+1]=(Math.random()-.5)*300; sP[i*3+2]=(Math.random()-.5)*300;
    const w = Math.random(); sC[i*3]=w>.7?1:.85; sC[i*3+1]=w>.7?.85:.9; sC[i*3+2]=w>.7?.6:1;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sP,3));
  sg.setAttribute('color',    new THREE.BufferAttribute(sC,3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ vertexColors:true, size:.12, transparent:true, opacity:.65, sizeAttenuation:true })));
  // Sun
  const sunTex = makePlanetTexture(THREE, 'Sol');
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 32), new THREE.MeshStandardMaterial({
    map:sunTex, emissiveMap:sunTex, emissive:new THREE.Color(0xFFAA00), emissiveIntensity:0.9, roughness:.7 }));
  scene.add(sun);
  // Planets
  const ORBITS = { Luna:3.8, Mercurio:5.2, Venus:6.8, Marte:8.5, Júpiter:11, Saturno:13.2, Urano:15, Neptuno:16.8, Plutón:18 };
  const SIZES  = { Luna:.32, Mercurio:.33, Venus:.48, Marte:.42, Júpiter:.9, Saturno:.76, Urano:.58, Neptuno:.54, Plutón:.25 };
  const meshes = {};
  Object.entries(planets).forEach(([name, lon]) => {
    const r = ORBITS[name]; if (!r) return;
    const rad = (((lon%360)+360)%360) * Math.PI / 180;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r,.013,4,80), new THREE.MeshBasicMaterial({ color:0x2244AA, transparent:true, opacity:.2 }));
    ring.rotation.x = Math.PI/2; scene.add(ring);
    const tex = makePlanetTexture(THREE, name);
    const col = new THREE.Color(COLORES_PLANETA[name]||'#888888');
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(SIZES[name]||.35,28,28), new THREE.MeshStandardMaterial({
      map:tex, emissiveMap:tex, emissive:col, emissiveIntensity:.18, roughness:.8, metalness:.04 }));
    mesh.position.set(r*Math.cos(rad), 0, r*Math.sin(rad));
    mesh.userData = { name, lon, rotSpeed: .004+Math.random()*.008 };
    scene.add(mesh); meshes[name] = mesh;
    if (name === 'Saturno') {
      const rm = new THREE.Mesh(new THREE.TorusGeometry(SIZES.Saturno*1.85, SIZES.Saturno*.42, 2, 64),
        new THREE.MeshBasicMaterial({ color:0xC8B870, transparent:true, opacity:.48, side:THREE.DoubleSide }));
      rm.rotation.x = Math.PI*.42; mesh.add(rm);
    }
  });
  // Aspect lines
  const aspLines = [];
  if (aspectos?.length) {
    [...aspectos].sort((a,b)=>parseFloat(a.orb)-parseFloat(b.orb)).slice(0,8).forEach(asp => {
      const m1 = meshes[asp.p1], m2 = meshes[asp.p2]; if (!m1||!m2) return;
      const geo = new THREE.BufferGeometry().setFromPoints([m1.position.clone(), m2.position.clone()]);
      const mat = new THREE.LineBasicMaterial({ color:new THREE.Color(asp.color||'#888'), transparent:true, opacity:.25 });
      const line = new THREE.Line(geo, mat); line.userData = { m1, m2, mat }; scene.add(line); aspLines.push(line);
    });
  }
  // HTML labels overlay
  const inm = canvas.parentElement;
  let labelsEl = inm?.querySelector('#ca-inm-labels');
  if (labelsEl) labelsEl.remove();
  labelsEl = document.createElement('div');
  labelsEl.id = 'ca-inm-labels';
  labelsEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;';
  inm?.appendChild(labelsEl);
  const labelEls = {};
  Object.keys(meshes).forEach(name => {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;font-size:9px;color:rgba(200,200,230,0.65);font-style:italic;white-space:nowrap;transform:translateX(-50%);pointer-events:none;transition:opacity 0.2s;';
    d.textContent = name; labelsEl.appendChild(d); labelEls[name] = d;
  });
  // Hover tooltip
  let tipEl = inm?.querySelector('#ca-inm-tip');
  if (tipEl) tipEl.remove();
  tipEl = document.createElement('div'); tipEl.id = 'ca-inm-tip';
  tipEl.style.cssText = 'position:absolute;background:rgba(8,10,24,0.92);color:#E8E0FF;padding:5px 10px;border-radius:8px;font-size:11px;pointer-events:none;display:none;border:1px solid rgba(180,160,255,0.3);z-index:10;';
  inm?.appendChild(tipEl);
  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(-999,-999), tmpV = new THREE.Vector3();
  let hovered = null, raf = null, t = 0, mpx = 0, mpy = 0;
  const onMM = e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
    mpx = e.clientX-rect.left; mpy = e.clientY-rect.top;
  };
  canvas.addEventListener('mousemove', onMM);
  const onClick = () => {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(Object.values(meshes));
    if (hits.length) showInmersivoPlanetInfo(hits[0].object.userData.name, hits[0].object.userData.lon);
  };
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchend', e => {
    const rect = canvas.getBoundingClientRect(), t0 = e.changedTouches[0];
    mouse.x = ((t0.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((t0.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(Object.values(meshes));
    if (hits.length) showInmersivoPlanetInfo(hits[0].object.userData.name, hits[0].object.userData.lon);
  }, { passive:true });
  function animate() {
    raf = requestAnimationFrame(animate); t += .003;
    camera.position.x = 24*Math.sin(t*.08); camera.position.z = 24*Math.cos(t*.08); camera.lookAt(0,0,0);
    sun.scale.setScalar(1+.045*Math.sin(t*2.2)); sun.rotation.y += .003;
    Object.values(meshes).forEach(mesh => { mesh.rotation.y += mesh.userData.rotSpeed; });
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(Object.values(meshes));
    if (hovered) hovered.scale.setScalar(1); hovered = null;
    if (hits.length) {
      hovered = hits[0].object; hovered.scale.setScalar(1.4); canvas.style.cursor = 'pointer';
      const { name, lon } = hovered.userData;
      tipEl.textContent = `${GLIFOS_PLANETA[name]||'•'} ${name} · ${lonToSign(lon).signo}`;
      tipEl.style.display = 'block'; tipEl.style.left=(mpx+14)+'px'; tipEl.style.top=(mpy-10)+'px';
    } else { canvas.style.cursor='default'; tipEl.style.display='none'; }
    aspLines.forEach((line,i) => {
      const { m1, m2, mat } = line.userData;
      line.geometry.setFromPoints([m1.position, m2.position]);
      mat.opacity = .1 + .12*Math.sin(t*1.4+i*.8);
    });
    const W2 = canvas.offsetWidth, H2 = canvas.offsetHeight;
    Object.entries(meshes).forEach(([name, mesh]) => {
      const lbl = labelEls[name]; if (!lbl) return;
      tmpV.copy(mesh.position).project(camera);
      if (tmpV.z > 1) { lbl.style.opacity='0'; return; }
      lbl.style.opacity = hovered===mesh ? '1' : '0.6';
      lbl.style.left = ((tmpV.x*.5+.5)*W2)+'px';
      lbl.style.top  = ((tmpV.y*-.5+.5)*H2 + (SIZES[name]||.35)*22+6)+'px';
    });
    renderer.render(scene, camera);
  }
  animate();
  const ro = new ResizeObserver(() => {
    const nW=canvas.offsetWidth, nH=canvas.offsetHeight;
    renderer.setSize(nW,nH); camera.aspect=nW/nH; camera.updateProjectionMatrix();
  });
  ro.observe(canvas);
  threeDispose = () => {
    cancelAnimationFrame(raf); ro.disconnect();
    canvas.removeEventListener('mousemove', onMM);
    canvas.removeEventListener('click', onClick);
    renderer.dispose(); labelsEl?.remove(); tipEl?.remove(); threeDispose = null;
  };
}

function showInmersivoPlanetInfo(name, lon) {
  const el = document.getElementById('ca-inm-info'); if (!el) return;
  const user  = getUser();
  const { signo, grado, minuto } = lonToSign(lon);
  const col   = COLORES_PLANETA[name] || '#A8E6E0';
  const texto = TEXTOS_PLANETA[name]?.[signo]?.(user.nombre || 'vos') || '';
  el.innerHTML = `
    <div class="ca-inm-popup" style="border-color:${col}55">
      <div class="ca-inm-popup__hd" style="color:${col}">
        <span>${GLIFOS_PLANETA[name]||'•'}</span>
        <strong>${name}</strong>
        <span class="ca-inm-popup__pos">${signo} ${grado}°${String(minuto).padStart(2,'0')}'</span>
      </div>
      <p class="ca-inm-popup__txt">${texto}</p>
    </div>`;
  el.classList.add('is-on');
}

// ─── Render planet cards ─────────────────────────
function renderPlanetCards(container, planets, houses) {
  const user   = getUser();
  const nombre = document.getElementById('ca-nombre')?.value?.trim() || user.nombre || 'vos';
  container.innerHTML = '';
  ['Sol','Luna','Mercurio','Venus','Marte','Júpiter','Saturno','Urano','Neptuno','Plutón'].forEach(name => {
    const lon = planets[name]; if (lon == null) return;
    const { signo, grado, minuto } = lonToSign(lon);
    const col      = COLORES_PLANETA[name] || '#888';
    const numCasa  = getPlanetHouse(lon, houses);
    const casaLbl  = numCasa ? ` · Casa ${numCasa}` : '';
    const texto    = TEXTOS_PLANETA[name]?.[signo]?.(nombre) || '';
    const casaTxt  = numCasa ? TEXTOS_CASA[numCasa]?.(nombre) || '' : '';
    const card = document.createElement('div');
    card.className = 'ca-planeta-card ca-reveal';
    card.innerHTML = `
      <div class="ca-planeta-card__hd" style="border-left:3px solid ${col}">
        <span class="ca-planeta-card__glifo" style="color:${col}">${GLIFOS_PLANETA[name]||'•'}</span>
        <span class="ca-planeta-card__name">${name}</span>
        <span class="ca-planeta-card__pos">${signo} ${grado}°${String(minuto).padStart(2,'0')}'${casaLbl}</span>
        <span class="ca-planeta-card__arrow">›</span>
      </div>
      <div class="ca-planeta-card__body">
        <p class="ca-planeta-card__texto">${texto}</p>
        ${casaTxt ? `<p class="ca-planeta-card__casa"><em>Casa ${numCasa}</em> — ${casaTxt}</p>` : ''}
      </div>`;
    card.addEventListener('click', () => card.classList.toggle('is-open'));
    container.appendChild(card);
  });
}

// ─── Render elementos ────────────────────────────
function renderElementos(container, planets) {
  const { elem, modal } = calcDistribucion(planets);
  const total = Object.values(elem).reduce((a,b)=>a+b,0) || 1;
  container.innerHTML = `
    <p class="ca-block-title">ELEMENTOS</p>
    <div class="ca-elem-grid">
      ${Object.entries(elem).map(([el,n]) => `
        <div class="ca-elem-item">
          <div class="ca-elem-bar"><div class="ca-elem-bar__fill" style="height:${Math.round((n/total)*100)}%;background:${ELEM_COLORS[el]}"></div></div>
          <span class="ca-elem-name">${el}</span>
          <span class="ca-elem-count" style="color:${ELEM_COLORS[el]}">${n}</span>
        </div>`).join('')}
    </div>
    <div class="ca-modal-grid">
      ${Object.entries(modal).map(([mod,n]) => `
        <div class="ca-modal-item">
          <span class="ca-modal-name">${mod}</span>
          <span class="ca-modal-count">${n}</span>
        </div>`).join('')}
    </div>`;
}

// ─── Render carta screen ─────────────────────────
function renderCartaResults(state) {
  const { planets, houses } = state;
  const user  = getUser();
  const nombre = user.nombre || 'vos';

  // Los 3 grandes
  const solEl  = document.getElementById('ca-sol-val');
  const lunaEl = document.getElementById('ca-luna-val');
  const ascEl  = document.getElementById('ca-asc-val');
  if (solEl  && planets.Sol  != null) solEl.textContent  = formatPos(planets.Sol);
  if (lunaEl && planets.Luna != null) lunaEl.textContent = formatPos(planets.Luna);
  if (ascEl  && houses[0]    != null) ascEl.textContent  = formatPos(houses[0]);

  // Intro quote
  const introWrap = document.getElementById('ca-intro-wrap');
  if (introWrap && planets.Sol != null) {
    const { signo } = lonToSign(planets.Sol);
    const txt = TEXTOS_PLANETA.Sol?.[signo]?.(nombre) || '';
    introWrap.innerHTML = `<p class="ca-intro-quote ca-reveal"><em>Sol en ${signo}</em>${txt}</p>`;
  }

  // Wheel
  const wc = document.getElementById('ca-wheel');
  if (wc) { wc.width = wc.offsetWidth * (devicePixelRatio||1) || 300; wc.height = wc.width;
            drawZodiacWheel(wc, planets, houses, state.aspectos); }

  // Legend
  const wl = document.getElementById('ca-wheel-legend');
  if (wl) wl.innerHTML = [
    { label:'Conjunción', color:'#FFD700' }, { label:'Trino',     color:'#B8FF4A' },
    { label:'Sextil',     color:'#A8E6E0' }, { label:'Cuadratura',color:'#FF6B6B' },
    { label:'Oposición',  color:'#FF9F43' },
  ].map(a => `<span class="ca-legend-item"><span class="ca-legend-dot" style="background:${a.color}"></span>${a.label}</span>`).join('');

  // Cards
  const lc = document.getElementById('ca-planetas-list');
  if (lc) renderPlanetCards(lc, planets, houses);

  // Elementos
  const ec = document.getElementById('ca-elementos');
  if (ec) renderElementos(ec, planets);

  // Show results
  document.getElementById('ca-form-block')?.setAttribute('hidden','');
  document.getElementById('ca-results-block')?.removeAttribute('hidden');
}

// ─── Numerología ─────────────────────────────────
const LETRA_NUM = { a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8 };

function reducir(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a,d) => a + parseInt(d), 0);
  }
  return n;
}

function calcNumerologia(nombre, nacimiento) {
  // Número de vida
  const [y, m, d] = (nacimiento || '').split('-').map(Number);
  const vidaRaw = y ? (String(y)+String(m).padStart(2,'0')+String(d).padStart(2,'0')).split('').reduce((a,c)=>a+parseInt(c),0) : null;
  const vida = vidaRaw != null ? reducir(vidaRaw) : null;

  // Número de expresión (nombre completo)
  const expRaw = (nombre || '').toLowerCase().replace(/[^a-záéíóúüñ]/g,'').split('')
    .reduce((a,c) => a + (LETRA_NUM[c.normalize('NFD').replace(/[̀-ͯ]/g,'')] || 0), 0);
  const expresion = expRaw > 0 ? reducir(expRaw) : null;

  // Año personal
  const hoy = new Date();
  const apRaw = d && m ? reducir(d + m + hoy.getFullYear()) : null;
  const anioPersonal = apRaw != null ? reducir(apRaw) : null;

  return { vida, expresion, anioPersonal };
}

const TEXTOS_NUM = {
  vida: {
    1: 'El 1 es el número del líder, del pionero, del que traza el camino primero. Tu misión es desarrollar la independencia, la originalidad y el coraje de actuar desde la propia convicción. La vida te va a poner en situaciones donde tenés que elegir entre seguir al grupo o seguir tu propia visión — y la lección siempre es elegir lo segundo con responsabilidad.',
    2: 'El 2 es el número de la cooperación, la diplomacia y la sensibilidad. Tu misión en esta vida pasa por los vínculos — aprender a dar y recibir en equilibrio, a construir con otros sin perder tu propio centro. La paciencia y la intuición son tus herramientas más poderosas.',
    3: 'El 3 es el número de la expresión creativa, la comunicación y la alegría. Tu misión es darle voz a lo que sentís y a lo que imaginás — el arte, la palabra, la enseñanza son los canales naturales de esta energía. El desafío es la dispersión: tantas ideas, tanto talento, la dificultad de sostener una sola cosa hasta el fondo.',
    4: 'El 4 es el número de los cimientos, el trabajo metódico y la construcción duradera. Tu misión en esta vida pasa por la disciplina y la responsabilidad — construir algo real que tenga base sólida. Los atajos no son para vos: el camino largo es el único que produce resultados que duran.',
    5: 'El 5 es el número de la libertad, el cambio y la experiencia directa. Tu misión es vivir con todos los sentidos abiertos, explorar los territorios desconocidos y adaptarte sin perder el hilo de quién sos. La rutina es tu enemigo y la variedad es tu combustible.',
    6: 'El 6 es el número del cuidado, la responsabilidad y la belleza. Tu misión está profundamente ligada a los otros — la familia, la comunidad, el servicio desde el amor. El arte y la armonía del espacio que habitás también importan profundamente para tu bienestar.',
    7: 'El 7 es el número de la sabiduría, la espiritualidad y la búsqueda interior. Tu misión en esta vida es profunda y solitaria en algún sentido — ir hacia adentro, estudiar los misterios, desarrollar una filosofía propia que sea tuya de verdad. La soledad fértil es tu aliada.',
    8: 'El 8 es el número del poder material, la ambición y el logro concreto. Tu misión pasa por aprender a manejar el dinero, la autoridad y los recursos con integridad — el 8 puede generar una abundancia enorme o una pérdida igual de grande dependiendo de los valores desde los que se actúa.',
    9: 'El 9 es el número de la compasión universal, la sabiduría acumulada y el cierre de ciclos. Tu misión tiene una dimensión humanitaria — dar al mundo algo que vaya más allá del beneficio personal. La generosidad sin expectativa de retorno es tu mayor fortaleza y tu mayor aprendizaje.',
    11: 'El 11 es el número maestro de la intuición y la inspiración espiritual. Tu sensibilidad es extraordinaria y tenés una capacidad de percepción que va más allá de lo racional. La misión es servir de canal entre lo invisible y lo visible, aunque eso a veces resulte solitario o difícil de explicar.',
    22: 'El 22 es el número maestro del constructor — la capacidad de manifestar visiones extraordinarias en el plano concreto. Tu potencial para crear estructuras que sirvan a muchos es enorme, pero requiere disciplina, paciencia y un compromiso con algo más grande que el beneficio personal.',
    33: 'El 33 es el número maestro del maestro compasivo — la enseñanza desde el amor incondicional. Tu misión tiene una dimensión espiritual y de servicio que pocas personas pueden sostener. La entrega sin ego es el camino y la recompensa.',
  },
  expresion: {
    1:'Tu nombre vibra en la frecuencia del liderazgo y la autoafirmación. La manera en que te presentás al mundo tiende a ser directa, asertiva, con una presencia que los demás perciben como confiada aunque vos no siempre la sientas así.',
    2:'Tu nombre vibra en la frecuencia de la cooperación y la sensibilidad. Los demás te perciben como una persona receptiva, empática, alguien con quien es fácil hablar de lo que importa.',
    3:'Tu nombre vibra en la frecuencia de la creatividad y la expresión. Los demás te perciben como alguien comunicativo/a, con una energía que resulta estimulante y que tiene algo naturalmente artístico.',
    4:'Tu nombre vibra en la frecuencia de la confiabilidad y el método. Los demás te perciben como alguien sólido/a, en quien se puede confiar para las cosas concretas y que cumple lo que promete.',
    5:'Tu nombre vibra en la frecuencia de la libertad y el dinamismo. Los demás te perciben como alguien versátil, adaptable, con una energía que mantiene todo en movimiento.',
    6:'Tu nombre vibra en la frecuencia del cuidado y la armonía. Los demás te perciben como alguien cálido/a, preocupado/a por el bienestar de los que están cerca, con un sentido estético propio.',
    7:'Tu nombre vibra en la frecuencia del análisis y la profundidad. Los demás te perciben como alguien reflexivo/a, que piensa antes de hablar, con una inteligencia que no siempre muestra todo lo que sabe.',
    8:'Tu nombre vibra en la frecuencia del poder y la determinación. Los demás te perciben como alguien ambicioso/a en el mejor sentido, con capacidad ejecutora y una presencia que genera confianza en contextos profesionales.',
    9:'Tu nombre vibra en la frecuencia de la compasión y la generosidad. Los demás te perciben como alguien que genuinamente se preocupa por los demás, con una visión que va más allá de lo inmediato.',
    11:'Tu nombre vibra en la frecuencia maestra de la inspiración. Los demás perciben en vos algo diferente, una sensibilidad elevada y una perspectiva que parece venir de otro lugar.',
    22:'Tu nombre vibra en la frecuencia maestra de la manifestación. Los demás perciben en vos una capacidad para hacer que las cosas ocurran, para materializar visiones que otros apenas imaginan.',
    33:'Tu nombre vibra en la frecuencia maestra de la enseñanza. Los demás perciben en vos una calidez y una sabiduría que inspiran, una presencia que enseña con el ejemplo.',
  },
  anioPersonal: {
    1:'Año 1 — nuevo ciclo. Es el momento de plantar las semillas de lo que querés construir en los próximos 9 años. La iniciativa es clave: lo que empezás este año define la dirección de toda la siguiente vuelta. Animarse a empezar aunque no todo esté listo es la consigna.',
    2:'Año 2 — cooperación y paciencia. No es el año de las grandes explosiones sino de las alianzas, las relaciones que se profundizan y el trabajo silencioso detrás de escena. La diplomacia y la escucha activa son las herramientas del año.',
    3:'Año 3 — expresión y alegría. Es un año para crear, comunicar y celebrar. La creatividad está especialmente activa y las conexiones sociales florecen. El riesgo es la dispersión — hay que elegir qué expresar con más profundidad.',
    4:'Año 4 — construcción y disciplina. Es el año de poner los cimientos de algo que dure. El trabajo duro tiene su recompensa y la organización es la clave. No es el año más divertido pero sí el más constructivo.',
    5:'Año 5 — cambio y libertad. Un año de movimiento, transformaciones inesperadas y oportunidades que requieren flexibilidad. Lo que parecía estable puede cambiar y eso, aunque sorprenda, suele abrir algo mejor.',
    6:'Año 6 — responsabilidad y cuidado. Es un año donde los vínculos, el hogar y las responsabilidades hacia los demás cobran protagonismo. El equilibrio entre el cuidado propio y el ajeno es el desafío central.',
    7:'Año 7 — introspección y sabiduría. Un año para ir hacia adentro, estudiar, reflexionar y dejar que las respuestas lleguen desde el silencio. No es el año de la acción externa sino del desarrollo interno.',
    8:'Año 8 — poder y logro. Un año donde los esfuerzos de los años anteriores pueden materializarse en resultados concretos. El dinero, la carrera y la autoridad están en primer plano. Actuar con integridad es esencial.',
    9:'Año 9 — cierre y liberación. Es el año de soltar lo que ya cumplió su ciclo — relaciones, proyectos, identidades. Lo que se va hace lugar para el nuevo ciclo que empieza con el año 1 siguiente.',
  },
};

function renderNumerologia() {
  const screen = document.getElementById('ca-screen-numeros'); if (!screen) return;
  const user = getUser();
  // Leer del form si existe (live preview mientras escribe)
  const nombre = document.getElementById('ca-nombre')?.value?.trim() || user.nombre || '';
  const nacimiento = document.getElementById('ca-fecha')?.value || chartState?.date || user.nacimiento || '';

  if (!nombre || !nacimiento) {
    screen.innerHTML = `
      <div class="ca-section-hd">
        <h2 class="ca-section-hd__title">Numerología</h2>
        <p class="ca-section-hd__sub">los números que definen tu vibración</p>
      </div>
      <div class="ca-num-needs-name">
        <p>Para calcular tu numerología necesito tu nombre completo y fecha de nacimiento.</p>
        <button id="ca-num-go-carta">Ir a Carta Astral →</button>
      </div>`;
    screen.querySelector('#ca-num-go-carta')?.addEventListener('click', () => {
      document.querySelector('.ca-tab[data-tab="carta"]')?.click();
    });
    return;
  }

  const { vida, expresion, anioPersonal } = calcNumerologia(nombre, nacimiento);

  // Tags por número
  const TAGS_NUM = {
    1:['LIDERAZGO','INDEPENDENCIA','PIONERO'], 2:['COOPERACIÓN','INTUICIÓN','PACIENCIA'],
    3:['CREATIVIDAD','EXPRESIÓN','ALEGRÍA'],   4:['DISCIPLINA','ESTRUCTURA','FUNDAMENTOS'],
    5:['LIBERTAD','CAMBIO','AVENTURA'],         6:['CUIDADO','ARMONÍA','BELLEZA'],
    7:['SABIDURÍA','MISTERIO','INTROSPECCIÓN'],8:['PODER','AMBICIÓN','ABUNDANCIA'],
    9:['COMPASIÓN','HUMANIDAD','CIERRE'],      11:['INTUICIÓN','INSPIRACIÓN','CANAL'],
    22:['MANIFESTACIÓN','VISIÓN','LEGADO'],    33:['MAESTRO','COMPASIVO','ILUMINADO'],
  };
  const TITULO_NUM = {
    vida: {
      1:'El Pionero', 2:'El Diplomático', 3:'El Creador', 4:'El Constructor',
      5:'El Explorador', 6:'El Cuidador', 7:'El Sabio', 8:'El Ejecutor',
      9:'El Humanista', 11:'El Intuitivo', 22:'El Arquitecto', 33:'Maestro Sanador',
    },
    expresion: {
      1:'El Líder', 2:'El Cooperador', 3:'El Artista', 4:'El Confiable',
      5:'El Versátil', 6:'El Armonizador', 7:'El Analista', 8:'El Emprendedor',
      9:'El Generoso', 11:'El Inspirador', 22:'El Manifestador', 33:'El Maestro',
    },
    anioPersonal: {
      1:'Nuevo Ciclo', 2:'Cooperación', 3:'Expresión', 4:'Construcción',
      5:'Cambio', 6:'Responsabilidad', 7:'Introspección', 8:'Logro', 9:'Cierre',
    },
  };

  const cards = [
    { tipo:'CAMINO DE VIDA', num:vida,        key:'vida',         desc:'La lección central de tu existencia' },
    { tipo:'NÚMERO DE EXPRESIÓN', num:expresion, key:'expresion', desc:'Tu forma de resonar en el mundo' },
    { tipo:'AÑO PERSONAL', num:anioPersonal,  key:'anioPersonal', desc:`Tu energía específica en ${new Date().getFullYear()}` },
  ];

  // Fecha en formato legible
  const [yy, mm, dd] = nacimiento.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fechaLegible = yy && mm && dd ? `${parseInt(dd)} de ${meses[parseInt(mm)-1]} de ${yy}` : nacimiento;

  screen.innerHTML = `
    <div class="ca-num-hero">
      <p class="ca-num-kicker">// NUMEROLOGÍA</p>
      <h2 class="ca-num-nombre">${nombre.split(' ')[0]}!</h2>
      <p class="ca-num-intro">Naciste el <strong>${fechaLegible}</strong>. El cielo suma tu nombre y tu día —<br>estos son los números que definen tu frecuencia.</p>
    </div>
    <div class="ca-num-cards">
      ${cards.map(({ tipo, num, key, desc }) => {
        const texto = num != null ? (TEXTOS_NUM[key]?.[num] || '') : '';
        const titulo = num != null ? (TITULO_NUM[key]?.[num] || '') : '';
        const tags = num != null ? (TAGS_NUM[num] || []) : [];
        return `
        <div class="ca-num-card ca-reveal">
          <div class="ca-num-card__hd">
            <div class="ca-num-card__num">${num ?? '?'}</div>
            <div class="ca-num-card__info">
              <div class="ca-num-card__type">${tipo} <span class="ca-num-card__arrow">›</span></div>
              <div class="ca-num-card__titulo">${titulo}</div>
              ${tags.length ? `<div class="ca-num-card__tags">${tags.map(t=>`<span class="ca-num-tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          </div>
          <div class="ca-num-card__body">
            <p class="ca-num-card__desc">${desc}</p>
            <p class="ca-num-card__texto">${texto}</p>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  screen.querySelectorAll('.ca-num-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('is-open'));
  });

  const numData = calcNumerologia(nombre, nacimiento);
  UserStore.patch({ numerologia: numData }).catch(() => {});
}

// ─── Tarot ───────────────────────────────────────
function renderTarot() {
  const screen = document.getElementById('ca-screen-tarot'); if (!screen) return;
  const user   = getUser();
  const birth  = chartState?.date || user.nacimiento || '';
  const tirada = getTirada(birth);
  const cardDia = getCardOfDay(birth);
  const hoy = new Date().toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' });
  const POSICIONES = ['Pasado', 'Presente', 'Futuro'];

  screen.innerHTML = `
    <div class="ca-section-hd">
      <h2 class="ca-section-hd__title">Tarot</h2>
      <p class="ca-section-hd__sub">tirada de tres · arcanos mayores</p>
    </div>
    <p class="ca-tarot-date">${hoy}</p>
    <div class="ca-tirada" id="ca-tirada"></div>
    <p class="ca-tirada-hint">tocá cada carta para leer la interpretación</p>
    <div id="ca-detalles-tirada"></div>
    <div class="ca-carta-dia">
      <div class="ca-carta-dia__label">// ARCANO DEL DÍA</div>
      <div class="ca-carta-dia__content">
        <div class="ca-carta-dia__emoji">${cardDia.emoji}</div>
        <div class="ca-carta-dia__info">
          <div class="ca-carta-dia__name">${cardDia.nombre}</div>
          <div class="ca-carta-dia__keyword">${cardDia.keyword}</div>
          <p class="ca-carta-dia__texto">${cardDia.positivo}</p>
        </div>
      </div>
    </div>`;

  const tiradaEl   = screen.querySelector('#ca-tirada');
  const detallesEl = screen.querySelector('#ca-detalles-tirada');

  tirada.forEach(({ arcano, invertido }, i) => {
    // Card wrapper
    const wrap = document.createElement('div');
    wrap.className = 'ca-carta-wrap';

    const carta = document.createElement('div');
    carta.className = 'ca-carta';
    carta.innerHTML = `
      <div class="ca-carta__back"></div>
      <div class="ca-carta__face">
        <span class="ca-carta__num">${arcano.numero}</span>
        <span class="ca-carta__emoji">${arcano.emoji}</span>
        <span class="ca-carta__name">${arcano.nombre}</span>
        ${invertido ? '<span class="ca-carta__inv">invertida</span>' : ''}
      </div>`;
    wrap.appendChild(carta);

    const posLabel = document.createElement('p');
    posLabel.className = 'ca-carta-pos';
    posLabel.textContent = POSICIONES[i];
    wrap.appendChild(posLabel);
    tiradaEl.appendChild(wrap);

    // Detalle block (hidden until flip)
    const detalle = document.createElement('div');
    detalle.className = 'ca-carta-detalle';
    detalle.innerHTML = `
      <div class="ca-carta-detalle__hd">
        <span class="emoji">${arcano.emoji}</span>
        <span>${POSICIONES[i]}: ${arcano.nombre}${invertido?' (invertida)':''}</span>
      </div>
      <div class="ca-carta-detalle__keyword">${arcano.keyword}</div>
      <p class="ca-carta-detalle__texto">${invertido ? arcano.invertido : arcano.positivo}</p>`;
    detallesEl.appendChild(detalle);

    // Flip on click
    carta.addEventListener('click', () => {
      carta.classList.toggle('is-flipped');
      const flipped = carta.classList.contains('is-flipped');
      detalle.classList.toggle('is-visible', flipped);
    });
  });
}

// ─── Calculate chart ─────────────────────────────
async function calculateChart(date, time, cityData) {
  setLoadingCarta(true);
  try {
    const lat = parseFloat(cityData.lat), lon = parseFloat(cityData.lon);
    const utcOffset = await getTimezoneOffset(lat, lon);
    const [hh, mm] = time.split(':').map(Number);
    let ut = (hh + mm/60) - utcOffset;
    if (ut < 0) ut += 24; if (ut >= 24) ut -= 24;
    const raw = await fetchChartRaw(date, ut, lat, lon);
    const { planets, houses } = parseSwetest(raw);
    if (!Object.keys(planets).length) throw new Error('Sin datos — revisá los campos');
    const aspectos = calcAspectos(planets);
    chartState = { planets, houses, aspectos, lat, lon, date, time, ut, utcOffset, location: cityData.display_name };
    // Save to localStorage + MongoDB
    saveUser({ cartaAstral: chartState });
    UserStore.patch({ cartaAstral: chartState }).catch(() => {});
    renderCartaResults(chartState);
  } catch (err) {
    console.error('[carta-astral]', err);
    document.getElementById('ca-error-msg').textContent = `✦ ${err.message}`;
    document.getElementById('ca-error-msg').removeAttribute('hidden');
    setTimeout(() => document.getElementById('ca-error-msg')?.setAttribute('hidden',''), 5000);
  } finally {
    setLoadingCarta(false);
  }
}

function setLoadingCarta(on) {
  document.getElementById('ca-loading')?.toggleAttribute('hidden', !on);
  document.getElementById('ca-btn-calcular')?.toggleAttribute('disabled', on);
}

// ─── Autocomplete ────────────────────────────────
function initAutocomplete() {
  const input  = document.getElementById('ca-ciudad');
  const list   = document.getElementById('ca-ciudad-list');
  if (!input || !list) return;
  let dbc = null, cityResults = [];
  input.addEventListener('input', () => {
    clearTimeout(dbc); input._selected = null;
    const q = input.value.trim();
    if (q.length < 3) { list.hidden = true; return; }
    dbc = setTimeout(async () => {
      try {
        cityResults = await geocodeCity(q);
        if (!cityResults.length) { list.hidden = true; return; }
        list.innerHTML = cityResults.slice(0,5).map((r,i) =>
          `<li class="ca-dd-item" data-i="${i}">${r.display_name.split(',').slice(0,3).join(', ')}</li>`
        ).join('');
        list.hidden = false;
        list.querySelectorAll('.ca-dd-item').forEach(li => {
          li.addEventListener('click', () => {
            const r = cityResults[parseInt(li.dataset.i)];
            input._selected = r;
            input.value = r.display_name.split(',').slice(0,2).join(',').trim();
            list.hidden = true;
          });
        });
      } catch { list.hidden = true; }
    }, 320);
  });
  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !list.contains(e.target)) list.hidden = true;
  });
}

// ─── Mode toggle (Mapa / Inmersivo) ─────────────
function initModeToggle() {
  const btnMapa = document.getElementById('ca-modo-mapa');
  const btnInm  = document.getElementById('ca-modo-inm');
  const mapaV   = document.getElementById('ca-mapa-view');
  const inmV    = document.getElementById('ca-inm-view');
  if (!btnMapa) return;

  btnMapa.addEventListener('click', () => {
    btnMapa.classList.add('is-active'); btnInm.classList.remove('is-active');
    mapaV?.removeAttribute('hidden'); inmV?.setAttribute('hidden','');
    if (threeDispose) threeDispose();
  });

  btnInm?.addEventListener('click', async () => {
    if (!chartState) return;
    btnInm.classList.add('is-active'); btnMapa.classList.remove('is-active');
    mapaV?.setAttribute('hidden',''); inmV?.removeAttribute('hidden');
    await new Promise(r => requestAnimationFrame(r));
    const cv = document.getElementById('ca-inm-canvas');
    if (cv) await initThreeInmersivo(cv, chartState.planets, chartState.aspectos);
  });
}

// ─── PDF Export ──────────────────────────────────
async function exportPDF() {
  const btn = document.getElementById('ca-export-pdf');
  if (btn) { btn.textContent = 'Generando…'; btn.disabled = true; }
  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'),
      import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'),
    ]);
    const target = document.getElementById('ca-mapa-view') || document.getElementById('ca-results-block');
    if (!target) return;
    const cvs = await html2canvas(target, { scale:2, useCORS:true, backgroundColor:'#080a18' });
    const img = cvs.toDataURL('image/png');
    const pdf = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' });
    const pW = pdf.internal.pageSize.getWidth(), pH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pW/cvs.width, pH/cvs.height);
    pdf.addImage(img, 'PNG', 0, 0, cvs.width*ratio, cvs.height*ratio);
    pdf.save('carta-astral-apacheta.pdf');
  } catch(e) { console.error('[pdf]', e); }
  finally { if (btn) { btn.textContent = 'Guardar carta ↓'; btn.disabled = false; } }
}

// ─── INIT ─────────────────────────────────────────
export function initCartaAstral() {
  const panel = document.getElementById('ca-panel');
  if (!panel) return;

  // FAB / trigger
  document.getElementById('ca-fab')?.addEventListener('click', () => openPanel());
  document.getElementById('ca-panel-close')?.addEventListener('click', () => closePanel());

  const fab = document.getElementById('ca-fab');
  function openPanel() {
    panel.classList.add('open');
    fab?.classList.add('ca-fab--hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { renderTarot(); renderNumerologia(); }, 80);
  }
  function closePanel() {
    panel.classList.remove('open');
    fab?.classList.remove('ca-fab--hidden');
    document.body.style.overflow = '';
    if (threeDispose) threeDispose();
  }

  // Tab switching
  panel.querySelectorAll('.ca-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.ca-tab').forEach(t => t.classList.remove('is-active'));
      panel.querySelectorAll('.ca-screen').forEach(s => s.classList.remove('is-active'));
      tab.classList.add('is-active');
      const target = document.getElementById(`ca-screen-${tab.dataset.tab}`);
      target?.classList.add('is-active');
      if (tab.dataset.tab === 'numeros')  renderNumerologia();
      if (tab.dataset.tab === 'tarot')    renderTarot();
    });
  });

  // Restore saved chart
  const user = getUser();
  if (user.cartaAstral?.planets) {
    chartState = user.cartaAstral;
    const fe = document.getElementById('ca-fecha'), ho = document.getElementById('ca-hora');
    const ci = document.getElementById('ca-ciudad');
    if (fe && chartState.date)     fe.value = chartState.date;
    if (ho && chartState.time)     ho.value = chartState.time;
    if (ci && chartState.location) {
      ci.value = chartState.location.split(',').slice(0,2).join(',').trim();
      ci._selected = { lat: chartState.lat, lon: chartState.lon, display_name: chartState.location };
    }
    renderCartaResults(chartState);
  } else if (user.nacimiento) {
    const fe = document.getElementById('ca-fecha');
    if (fe && !fe.value) fe.value = user.nacimiento;
  }

  // Prefill nombre if available
  const nombreInput = document.getElementById('ca-nombre');
  if (nombreInput && user.nombre) nombreInput.value = user.nombre;

  initAutocomplete();
  initModeToggle();

  // Live update: nombre y fecha actualizan numerología + tarjetas + intro
  const liveUpdate = () => {
    renderNumerologia();
    updateUserDot();
    if (chartState && !document.getElementById('ca-results-block')?.hidden) {
      const n = document.getElementById('ca-nombre')?.value?.trim() || getUser().nombre || 'vos';
      const lc = document.getElementById('ca-planetas-list');
      if (lc) renderPlanetCards(lc, chartState.planets, chartState.houses);
      const introWrap = document.getElementById('ca-intro-wrap');
      if (introWrap && chartState.planets.Sol != null) {
        const { signo } = lonToSign(chartState.planets.Sol);
        const txt = TEXTOS_PLANETA.Sol?.[signo]?.(n) || '';
        introWrap.innerHTML = `<p class="ca-intro-quote ca-reveal"><em>Sol en ${signo}</em> — ${txt}</p>`;
      }
    }
  };
  document.getElementById('ca-fecha')?.addEventListener('change', liveUpdate);
  document.getElementById('ca-nombre')?.addEventListener('input', liveUpdate);

  // Calcular button
  document.getElementById('ca-btn-calcular')?.addEventListener('click', async () => {
    const fecha   = document.getElementById('ca-fecha')?.value;
    const hora    = document.getElementById('ca-hora')?.value || '12:00';
    const input   = document.getElementById('ca-ciudad');
    const ciudad  = input?._selected;
    const nombreV = document.getElementById('ca-nombre')?.value?.trim();

    if (!fecha)  { showErr('Ingresá la fecha de nacimiento.'); return; }
    if (!ciudad) { showErr('Seleccioná una ciudad de la lista.'); return; }

    // Save nombre if provided
    if (nombreV && nombreV !== user.nombre) {
      saveUser({ nombre: nombreV });
      UserStore.patch({ nombre: nombreV }).catch(() => {});
    }

    await calculateChart(fecha, hora, ciudad);
  });

  // Recalcular / editar
  document.getElementById('ca-btn-editar')?.addEventListener('click', () => {
    document.getElementById('ca-form-block')?.removeAttribute('hidden');
    document.getElementById('ca-results-block')?.setAttribute('hidden','');
  });

  // Export PDF
  document.getElementById('ca-export-pdf')?.addEventListener('click', exportPDF);

  function showErr(msg) {
    const el = document.getElementById('ca-error-msg'); if (!el) return;
    el.textContent = `✦ ${msg}`; el.removeAttribute('hidden');
    setTimeout(() => el.setAttribute('hidden',''), 4500);
  }

  // User dot: inicial del nombre
  function updateUserDot() {
    const dot = document.getElementById('ca-user-dot'); if (!dot) return;
    const n = getUser().nombre || document.getElementById('ca-nombre')?.value || '?';
    dot.textContent = n.charAt(0).toUpperCase();
  }
  updateUserDot();
  document.getElementById('ca-nombre')?.addEventListener('input', updateUserDot);

  // Expose open for nav-drawer
  window.openCartaAstral = openPanel;
}
