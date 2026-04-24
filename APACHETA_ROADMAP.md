# APACHETA — Roadmap de Features
## Próximas iteraciones · Prioridades y guía técnica

**Marca:** AJETREOS DEL SUR · CBA · 2026  
**Stack:** React + Vite · Puerto 3005  
**Última actualización:** Abril 2026

---

## ÍNDICE DE FEATURES

| # | Feature | Prioridad | Complejidad |
|---|---|---|---|
| F1 | Partículas de background por sección | Alta | Media |
| F2 | Input boxes (links, texto, repos, fotos) | Alta | Media |
| F3 | Sistema de gamificación de colores | Alta | Alta |
| F4 | Overlay de personalización al inicio | Media | Alta |
| F5 | Arquitectura de datos locales (localStorage) | Alta | Media |
| F6 | Dashboard arquitectura (secciones modulares) | Media | Alta |
| F7 | Botón de notas mejorado | Baja | Baja |
| F8 | Profundidad visual (layering + partículas avanzadas) | Media | Alta |

---

## F1 — PARTÍCULAS DE BACKGROUND POR SECCIÓN

### Concepto
Cada sección tiene un fondo de partículas animadas temático. No es decorativo puro: refuerza el significado de cada espacio.

### Variantes por sección

| Sección | Forma de partículas | Color | Comportamiento |
|---|---|---|---|
| Modo Alucinaje | Cerebro / neuronas | Rosa (`#f0c4c4`) | Flotan, parpadean |
| Respirar | Corazón / ondas | Azul/crema | Pulso sincronizado con la respiración |
| Chakras | Mandala / espiral | Color del chakra activo | Rotación lenta |
| NADA/TODO | Puntos que se expanden | Rosa-amarillo | Explosion suave en loop |
| Conexiones | Líneas conectando puntos | Sage green | Red dinámica |

### Implementación técnica

**Opción A: Canvas API (recomendada para control total)**

Crear un componente `ParticleCanvas.jsx` reutilizable:

```jsx
// src/components/Particles/ParticleCanvas.jsx
import { useEffect, useRef } from 'react';

export default function ParticleCanvas({ shape = 'dots', color = '#f0c4c4', count = 40 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let animId;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, [color, count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
```

**Opción B: CSS puro con keyframes (para formas simples)**

```css
/* Para partículas simples flotantes */
.particle {
  position: absolute;
  border-radius: 50%;
  animation: float var(--duration, 6s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 0.7; }
}
```

**Opción C: Librería tsParticles (para formas complejas tipo cerebro/corazón)**

```bash
npm install @tsparticles/react @tsparticles/slim
```

```jsx
// Para forma de corazón en Respirar
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const heartConfig = {
  particles: {
    number: { value: 30 },
    shape: {
      type: 'path',
      options: {
        path: {
          data: 'M0,-10 C5,-20 20,-20 20,-10 C20,0 10,10 0,20 C-10,10 -20,0 -20,-10 C-20,-20 -5,-20 0,-10Z',
        },
      },
    },
    color: { value: '#e8a0a0' },
    opacity: { value: 0.4 },
    size: { value: 8 },
    move: { enable: true, speed: 1 },
  },
};
```

### Archivos a tocar
- `src/components/Particles/ParticleCanvas.jsx` — nuevo componente
- `src/components/Particles/particleConfigs.js` — configs por sección
- `src/sections/AlucinajeMode.jsx` — importar partículas
- `src/sections/BreatheSection.jsx` — partículas sincronizadas
- `src/sections/ChakrasSection.jsx` — color dinámico según chakra activo

### Consideraciones de performance
- Usar `will-change: transform` en elementos animados.
- Reducir `count` en dispositivos low-end (detectar con `navigator.hardwareConcurrency < 4`).
- Pausar animación cuando la tab no es visible (`document.visibilitychange`).

---

## F2 — INPUT BOXES (Links, Texto Libre, Repos, Fotos)

### Concepto
El usuario puede pegar cualquier cosa: links de artículos, repos de GitHub, texto libre, o subir fotos de pizarrones/notas. El sistema lo parsea y lo guarda con contexto.

### Tipos de input

#### 2.1 Input de texto libre
Campo de texto expandible (tipo textarea auto-resize). Tags automáticos basados en contenido.

```jsx
// src/components/Input/TextInput.jsx
import { useState, useRef } from 'react';

export default function TextInput({ onSave }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleSave = () => {
    if (!value.trim()) return;
    onSave({
      type: 'text',
      content: value,
      timestamp: Date.now(),
      tags: autoDetectTags(value),
    });
    setValue('');
  };

  return (
    <div className="input-box">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder="¿Qué querés guardar?"
        rows={2}
      />
      <button onClick={handleSave}>Guardar →</button>
    </div>
  );
}

function autoDetectTags(text) {
  const keywords = {
    filosofía: ['estoico', 'conciencia', 'ser', 'nada', 'verdad', 'tiempo'],
    tech: ['código', 'algoritmo', 'sistema', 'datos', 'función'],
    emocional: ['sentir', 'emoción', 'miedo', 'amor', 'paz'],
    cuántico: ['universo', 'energía', 'partícula', 'frecuencia'],
  };
  return Object.entries(keywords)
    .filter(([, words]) => words.some(w => text.toLowerCase().includes(w)))
    .map(([tag]) => tag);
}
```

#### 2.2 Input de links (URL parser)

```jsx
// src/components/Input/LinkInput.jsx
import { useState } from 'react';

export default function LinkInput({ onSave }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePaste = async (e) => {
    const pasted = e.clipboardData.getData('text');
    if (isValidUrl(pasted)) {
      setLoading(true);
      // Usar Open Graph meta para preview
      const meta = await fetchLinkMeta(pasted);
      setLoading(false);
      onSave({ type: 'link', url: pasted, meta, timestamp: Date.now() });
    }
  };

  return (
    <input
      type="url"
      placeholder="Pegá un link..."
      onPaste={handlePaste}
      value={url}
      onChange={e => setUrl(e.target.value)}
    />
  );
}

// Para obtener metadata del link (title, description, image)
// Usar una API proxy como linkpreview.net o implementar con el backend
async function fetchLinkMeta(url) {
  // Opción: usar https://api.linkpreview.net/?key=KEY&q=URL
  // Opción: scraping con un edge function (Cloudflare Workers / Vercel Edge)
  return { title: '', description: '', image: '' };
}
```

#### 2.3 Detección de repos GitHub

```js
// src/utils/detectInputType.js
export function detectInputType(text) {
  if (text.includes('github.com')) return 'github';
  if (isValidUrl(text)) return 'link';
  if (text.startsWith('data:image') || text.match(/\.(jpg|png|webp)$/)) return 'image';
  return 'text';
}

// Para repos GitHub, usar la API pública:
export async function fetchGitHubRepo(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const [, owner, repo] = match;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  return res.json(); // { name, description, language, stargazers_count, ... }
}
```

#### 2.4 Subida de fotos (pizarrones/notas)

```jsx
// src/components/Input/PhotoInput.jsx
import { useRef } from 'react';

export default function PhotoInput({ onSave }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSave({
        type: 'photo',
        dataUrl: ev.target.result,
        name: file.name,
        timestamp: Date.now(),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button onClick={() => fileRef.current.click()}>
        📷 Subir foto de pizarrón
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"   // abre cámara en mobile
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </>
  );
}
```

### Archivos a tocar / crear
- `src/components/Input/TextInput.jsx`
- `src/components/Input/LinkInput.jsx`
- `src/components/Input/PhotoInput.jsx`
- `src/components/Input/InputHub.jsx` — contenedor que detecta tipo y renderiza el input correcto
- `src/utils/detectInputType.js`
- `src/utils/autoTagger.js`
- FAB "+" → abre `InputHub` como bottom sheet o modal

---

## F3 — GAMIFICACIÓN DE COLORES (Selección → Desbloqueo de Sección)

### Concepto
Al inicio (o desde el FAB), el usuario selecciona 3 colores de una paleta. Eso desencadena una animación y desbloquea una sección o tarjeta rasca específica, ligada a la combinación elegida.

### Flujo completo

```
Usuario abre overlay
  → Ve paleta de ~12 colores
  → Selecciona 3 (tap/click)
  → Ícono central gira (animación CSS)
  → Se calcula la "frecuencia" de la combinación
  → Se desbloquea una sección específica
  → Aparece tarjeta rasca con el contenido revelado
```

### Implementación

#### ColorPicker.jsx — Selección de 3 colores

```jsx
// src/components/Gamification/ColorPicker.jsx
import { useState } from 'react';

const PALETTE = [
  { id: 'cream', hex: '#f5f0e8', name: 'Crema' },
  { id: 'pink', hex: '#f0c4c4', name: 'Rosa' },
  { id: 'yellow', hex: '#f5d848', name: 'Amarillo' },
  { id: 'sage', hex: '#7a9e8a', name: 'Sage' },
  { id: 'navy', hex: '#1a1f3a', name: 'Marino' },
  { id: 'green', hex: '#2d4a1e', name: 'Verde' },
  { id: 'orange', hex: '#e8833a', name: 'Naranja' },
  { id: 'purple', hex: '#7b5ea7', name: 'Púrpura' },
  { id: 'blue', hex: '#4a90d9', name: 'Azul' },
  { id: 'red', hex: '#c0392b', name: 'Rojo' },
  { id: 'gold', hex: '#d4a017', name: 'Dorado' },
  { id: 'teal', hex: '#2e9e94', name: 'Verde agua' },
];

export default function ColorPicker({ onComplete }) {
  const [selected, setSelected] = useState([]);

  const toggle = (color) => {
    if (selected.find(c => c.id === color.id)) {
      setSelected(selected.filter(c => c.id !== color.id));
    } else if (selected.length < 3) {
      const next = [...selected, color];
      setSelected(next);
      if (next.length === 3) {
        setTimeout(() => onComplete(next), 400); // pequeña pausa para feedback
      }
    }
  };

  return (
    <div className="color-picker">
      <p className="color-picker__label">Elegí tu frecuencia · {selected.length}/3</p>
      <div className="color-picker__grid">
        {PALETTE.map(color => (
          <button
            key={color.id}
            className={`swatch ${selected.find(c => c.id === color.id) ? 'selected' : ''}`}
            style={{ background: color.hex }}
            onClick={() => toggle(color)}
            aria-label={color.name}
          />
        ))}
      </div>
      {/* Indicadores de selección */}
      <div className="color-picker__selection">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="slot"
            style={{ background: selected[i]?.hex || 'transparent' }}
          />
        ))}
      </div>
    </div>
  );
}
```

#### SpinningIcon.jsx — Animación de desbloqueo

```jsx
// src/components/Gamification/SpinningIcon.jsx
import { useEffect, useState } from 'react';

export default function SpinningIcon({ colors, onAnimationEnd }) {
  const [phase, setPhase] = useState('spinning'); // 'spinning' | 'exploding' | 'done'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exploding'), 1200);
    const t2 = setTimeout(() => {
      setPhase('done');
      onAnimationEnd();
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`spinning-icon phase-${phase}`}>
      <div
        className="icon-ring"
        style={{
          background: `conic-gradient(${colors.map(c => c.hex).join(', ')})`,
        }}
      />
      <span className="icon-symbol">∞</span>
    </div>
  );
}
```

```css
/* Animación CSS */
.spinning-icon .icon-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  animation: spin 1.2s linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(720deg); }
}

.phase-exploding .icon-ring {
  animation: explode 0.6s ease-out forwards;
}

@keyframes explode {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}
```

#### colorToSection.js — Lógica de mapeo

```js
// src/utils/colorToSection.js

// Cada combinación de colores desbloquea una sección/contenido específico
const COLOR_COMBOS = [
  {
    ids: ['pink', 'yellow', 'cream'],
    unlocks: 'nothing-everything',
    label: 'Consciencia pura',
    scratchContent: 'La nada y el todo son el mismo punto visto desde distinta frecuencia.',
  },
  {
    ids: ['navy', 'purple', 'blue'],
    unlocks: 'alucinaje',
    label: 'Modo alucinaje',
    scratchContent: 'Tu cerebro crea la realidad. La realidad crea tu cerebro.',
  },
  {
    ids: ['green', 'sage', 'teal'],
    unlocks: 'conexiones',
    label: 'Red de ideas',
    scratchContent: 'Fibonacci aparece en las galaxias, en las flores y en tus pensamientos.',
  },
  {
    ids: ['orange', 'red', 'gold'],
    unlocks: 'chakras',
    label: 'Fuego interior',
    scratchContent: 'Manipura: el sol que vivís adentro. Todo lo que hacés emana de ahí.',
  },
  // Fallback para cualquier combo no mapeado
];

export function getUnlockedSection(selectedColors) {
  const ids = selectedColors.map(c => c.id).sort();
  const match = COLOR_COMBOS.find(combo =>
    JSON.stringify([...combo.ids].sort()) === JSON.stringify(ids)
  );
  return match || {
    unlocks: 'library',
    label: 'Tu frecuencia única',
    scratchContent: 'Esta combinación es tuya. No existe en ningún otro sistema.',
  };
}
```

#### ScratchCard.jsx — Tarjeta rasca (Canvas)

```jsx
// src/components/Gamification/ScratchCard.jsx
import { useRef, useEffect, useState } from 'react';

export default function ScratchCard({ content, color = '#f0c4c4' }) {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const isDrawing = useRef(false);
  const scratchedPixels = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('Rascá para revelar', canvas.width / 2, canvas.height / 2);
  }, []);

  const scratch = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Detectar si ya se reveló suficiente (>50% del canvas)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const transparent = imageData.data.filter((_, i) => (i + 1) % 4 === 0 && imageData.data[i] === 0).length;
    const total = canvas.width * canvas.height;
    if (transparent / total > 0.5 && !revealed) setRevealed(true);
  };

  return (
    <div className="scratch-card" style={{ position: 'relative', width: '280px', height: '160px' }}>
      {/* Contenido de fondo */}
      <div className="scratch-card__content" style={{ position: 'absolute', inset: 0, padding: '1rem', display: 'flex', alignItems: 'center' }}>
        <p style={{ fontStyle: 'italic', textAlign: 'center' }}>{content}</p>
      </div>
      {/* Canvas por encima */}
      {!revealed && (
        <canvas
          ref={canvasRef}
          width={280}
          height={160}
          style={{ position: 'absolute', inset: 0, borderRadius: '12px', cursor: 'crosshair' }}
          onMouseDown={() => { isDrawing.current = true; }}
          onMouseUp={() => { isDrawing.current = false; }}
          onMouseMove={scratch}
          onTouchStart={() => { isDrawing.current = true; }}
          onTouchEnd={() => { isDrawing.current = false; }}
          onTouchMove={scratch}
        />
      )}
    </div>
  );
}
```

### Archivos a tocar / crear
- `src/components/Gamification/ColorPicker.jsx`
- `src/components/Gamification/SpinningIcon.jsx`
- `src/components/Gamification/ScratchCard.jsx`
- `src/components/Gamification/GamificationFlow.jsx` — orquesta el flujo completo
- `src/utils/colorToSection.js`
- FAB "+" o Overlay inicial → lanza `GamificationFlow`

---

## F4 — OVERLAY DE PERSONALIZACIÓN AL INICIO

### Concepto
La primera vez que el usuario abre la app (o al hacer reset), aparece un overlay full-screen de bienvenida. El usuario elige: nombre, colores preferidos, símbolo personal. Esto configura el estado global de la app.

### Flujo

```
Primera visita detectada (localStorage.getItem('apacheta_setup') === null)
  → Overlay fullscreen aparece
  → Step 1: "¿Cómo querés que te llame?" (input de nombre)
  → Step 2: "Elegí tus 3 colores base" (ColorPicker)
  → Step 3: "Elegí tu símbolo" (grid de íconos: ∞ ☽ ◎ △ ✦ ⊕)
  → Confirmar → animar transición → guardar en localStorage → app cargada
```

### Implementación

```jsx
// src/components/Onboarding/SetupOverlay.jsx
import { useState } from 'react';
import ColorPicker from '../Gamification/ColorPicker';
import { saveUserProfile } from '../../utils/storage';

const SYMBOLS = ['∞', '☽', '◎', '△', '✦', '⊕', '⌬', '❋'];

export default function SetupOverlay({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [colors, setColors] = useState([]);
  const [symbol, setSymbol] = useState('');

  const finish = () => {
    saveUserProfile({ name, colors, symbol });
    onComplete({ name, colors, symbol });
  };

  return (
    <div className="setup-overlay">
      {step === 1 && (
        <div className="setup-step">
          <h1>Apacheta</h1>
          <p>Tu biblia. Tu lenguaje. Tu frecuencia.</p>
          <label>¿Cómo querés que te llame?</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="godofredo"
            autoFocus
          />
          <button onClick={() => name && setStep(2)}>Siguiente →</button>
        </div>
      )}

      {step === 2 && (
        <div className="setup-step">
          <h2>Tu frecuencia cromática</h2>
          <ColorPicker onComplete={(c) => { setColors(c); setStep(3); }} />
        </div>
      )}

      {step === 3 && (
        <div className="setup-step">
          <h2>Tu símbolo</h2>
          <div className="symbol-grid">
            {SYMBOLS.map(s => (
              <button
                key={s}
                className={`symbol-btn ${symbol === s ? 'selected' : ''}`}
                onClick={() => setSymbol(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={finish} disabled={!symbol}>Entrar →</button>
        </div>
      )}
    </div>
  );
}
```

```jsx
// src/App.jsx — integración
import { useState } from 'react';
import SetupOverlay from './components/Onboarding/SetupOverlay';
import { getUserProfile } from './utils/storage';

export default function App() {
  const [profile, setProfile] = useState(getUserProfile());

  if (!profile) {
    return <SetupOverlay onComplete={(p) => setProfile(p)} />;
  }

  return <MainApp profile={profile} />;
}
```

### Archivos a tocar / crear
- `src/components/Onboarding/SetupOverlay.jsx`
- `src/components/Onboarding/StepName.jsx`
- `src/components/Onboarding/StepSymbol.jsx`
- `src/utils/storage.js` — ver F5
- `src/App.jsx` — lógica de primera visita

---

## F5 — ARQUITECTURA DE DATOS LOCALES (localStorage)

### Concepto
Todo el estado persistente del usuario vive en localStorage. No hay backend. La app funciona offline como PWA.

### Esquema de datos

```js
// src/utils/storage.js

const KEYS = {
  PROFILE: 'apacheta_profile',
  NOTES: 'apacheta_notes',
  MANIFESTS: 'apacheta_manifests',
  LIBRARY_PROGRESS: 'apacheta_library',
  WEEK_DATA: 'apacheta_week',
  UNLOCKED_SECTIONS: 'apacheta_unlocked',
  SETUP_DONE: 'apacheta_setup',
};

// --- PERFIL ---
export function saveUserProfile(profile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  localStorage.setItem(KEYS.SETUP_DONE, 'true');
}

export function getUserProfile() {
  const raw = localStorage.getItem(KEYS.PROFILE);
  return raw ? JSON.parse(raw) : null;
}

// --- NOTAS ---
export function saveNote(note) {
  const notes = getNotes();
  notes.unshift({ ...note, id: Date.now() });
  localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
}

export function getNotes() {
  const raw = localStorage.getItem(KEYS.NOTES);
  return raw ? JSON.parse(raw) : [];
}

export function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
}

// --- MANIFIESTOS ---
export function saveManifest(manifest) {
  const manifests = getManifests();
  manifests.unshift({ ...manifest, id: Date.now() });
  localStorage.setItem(KEYS.MANIFESTS, JSON.stringify(manifests));
}

export function getManifests() {
  const raw = localStorage.getItem(KEYS.MANIFESTS);
  return raw ? JSON.parse(raw) : [];
}

// --- PROGRESO BIBLIOTECA ---
export function markWorkExplored(workId) {
  const progress = getLibraryProgress();
  if (!progress.includes(workId)) {
    progress.push(workId);
    localStorage.setItem(KEYS.LIBRARY_PROGRESS, JSON.stringify(progress));
  }
}

export function getLibraryProgress() {
  const raw = localStorage.getItem(KEYS.LIBRARY_PROGRESS);
  return raw ? JSON.parse(raw) : [];
}

// --- SECCIONES DESBLOQUEADAS ---
export function unlockSection(sectionId) {
  const unlocked = getUnlockedSections();
  if (!unlocked.includes(sectionId)) {
    unlocked.push(sectionId);
    localStorage.setItem(KEYS.UNLOCKED_SECTIONS, JSON.stringify(unlocked));
  }
}

export function getUnlockedSections() {
  const raw = localStorage.getItem(KEYS.UNLOCKED_SECTIONS);
  return raw ? JSON.parse(raw) : [];
}

// --- RESET COMPLETO ---
export function resetAll() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}
```

### Hook personalizado: `useLocalStorage`

```js
// src/hooks/useLocalStorage.js
import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(stored) : value;
    setStored(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [stored, setValue];
}
```

### Esquema completo de lo que se persiste

```json
{
  "apacheta_profile": {
    "name": "godofredo",
    "colors": [{ "id": "pink", "hex": "#f0c4c4" }, ...],
    "symbol": "∞",
    "createdAt": 1714000000000
  },
  "apacheta_notes": [
    {
      "id": 1714000001000,
      "type": "text",
      "content": "La restricción crea libertad",
      "tags": ["filosofía"],
      "timestamp": 1714000001000
    }
  ],
  "apacheta_manifests": [
    {
      "id": 1714000002000,
      "category": "filosofía",
      "title": "El control es una ilusión útil.",
      "body": "...",
      "timestamp": 1714000002000
    }
  ],
  "apacheta_library": ["kind-of-blue", "godel-escher-bach"],
  "apacheta_unlocked": ["nothing-everything", "alucinaje"]
}
```

### Archivos a tocar / crear
- `src/utils/storage.js` — módulo principal de persistencia
- `src/hooks/useLocalStorage.js` — hook reactivo
- `src/context/AppContext.jsx` — Context provider con estado global

---

## F6 — DASHBOARD ARQUITECTURA (Secciones Modulares)

### Concepto
El home se convierte en un dashboard donde las secciones se pueden expandir/contraer, reorganizar, o abrirse como "modales" o "sheets" desde el menú.

### Implementación

#### Secciones como módulos expandibles

```jsx
// src/components/Dashboard/Section.jsx
import { useState } from 'react';

export default function Section({ id, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`section-module ${open ? 'open' : 'collapsed'}`} data-id={id}>
      <button className="section-module__header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="chevron">{open ? '↑' : '↓'}</span>
      </button>
      {open && (
        <div className="section-module__body">
          {children}
        </div>
      )}
    </div>
  );
}
```

#### Bottom Sheet para secciones profundas

```jsx
// src/components/Dashboard/BottomSheet.jsx
import { useEffect } from 'react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose} />}
      <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
        <div className="bottom-sheet__handle" />
        <h2>{title}</h2>
        <div className="bottom-sheet__content">{children}</div>
      </div>
    </>
  );
}
```

```css
.bottom-sheet {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--bg, #f5f0e8);
  border-radius: 24px 24px 0 0;
  padding: 1.5rem;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  z-index: 100;
  max-height: 90vh;
  overflow-y: auto;
}

.bottom-sheet.open {
  transform: translateY(0);
}
```

### Archivos a tocar / crear
- `src/components/Dashboard/Section.jsx`
- `src/components/Dashboard/BottomSheet.jsx`
- `src/components/Dashboard/DashboardLayout.jsx`
- `src/pages/Home.jsx` — refactor para usar `DashboardLayout`

---

## F7 — BOTÓN DE NOTAS MEJORADO

### Concepto
El FAB "+" y el acceso a notas debe ser más ameno, rápido y satisfactorio. Una acción de un tap para capturar pensamientos.

### Mejoras

- FAB con menú radial: al mantener presionado o hacer long-press, se despliegan 3-4 opciones (✏️ Nota | 🔗 Link | 📷 Foto | 📖 Manifiesto).
- Feedback háptico si el dispositivo lo soporta (`navigator.vibrate(30)`).
- Guardado inmediato con animación de confirmación (tarjeta vuela hacia arriba y desaparece).
- Input sin fricción: teclado aparece directamente, sin modales intermedios.

```jsx
// src/components/Nav/FABMenu.jsx
import { useState } from 'react';

const ACTIONS = [
  { icon: '✏️', label: 'Nota', type: 'text' },
  { icon: '🔗', label: 'Link', type: 'link' },
  { icon: '📷', label: 'Foto', type: 'photo' },
  { icon: '📖', label: 'Manifiesto', type: 'manifest' },
];

export default function FABMenu({ onSelect }) {
  const [open, setOpen] = useState(false);

  const handle = (type) => {
    navigator.vibrate?.(30);
    setOpen(false);
    onSelect(type);
  };

  return (
    <div className="fab-container">
      {open && ACTIONS.map((action, i) => (
        <button
          key={action.type}
          className="fab-action"
          style={{ '--i': i }}
          onClick={() => handle(action.type)}
        >
          {action.icon}
        </button>
      ))}
      <button className={`fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        +
      </button>
    </div>
  );
}
```

---

## F8 — PROFUNDIDAD VISUAL (Layering + Partículas Avanzadas)

### Concepto
Agregar capas de profundidad visual para que la app se sienta viva: parallax suave en el scroll, blur layers de fondo, elementos flotantes con z-index calculado.

### Técnicas

#### Parallax suave en scroll

```js
// src/hooks/useParallax.js
import { useEffect, useRef } from 'react';

export function useParallax(speed = 0.3) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const onScroll = () => {
      const y = window.scrollY * speed;
      el.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return ref;
}
```

#### Blur layers de fondo

```css
/* Forma orgánica en segundo plano con blur */
.bg-blob {
  position: absolute;
  border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
  filter: blur(40px);
  opacity: 0.35;
  pointer-events: none;
  animation: morphBlob 8s ease-in-out infinite alternate;
}

@keyframes morphBlob {
  0% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
  50% { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
  100% { border-radius: 50% 50% 60% 40% / 40% 70% 30% 60%; }
}
```

#### Glassmorphism en cards

```css
.card-glass {
  background: rgba(245, 240, 232, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

---

## PRIORIZACIÓN RECOMENDADA

### Sprint 1 — Fundación (1-2 semanas)
1. **F5 — localStorage** completo: perfil, notas, manifiestos, progreso.
2. **F4 — Overlay de setup**: primera visita, nombre + colores + símbolo.
3. **F2 — Input básico**: TextInput + guardado.

### Sprint 2 — Interacción (1-2 semanas)
4. **F3 — Gamificación**: ColorPicker + animación + ScratchCard.
5. **F7 — FAB mejorado**: menú radial, feedback háptico.

### Sprint 3 — Visual (1-2 semanas)
6. **F1 — Partículas**: Canvas básico para Alucinaje y Respirar primero.
7. **F8 — Profundidad**: Blur layers + glassmorphism en cards.

### Sprint 4 — Arquitectura (2+ semanas)
8. **F6 — Dashboard modular**: Bottom sheets, secciones expandibles.
9. **F2 avanzado**: LinkInput + PhotoInput + GitHub repo parser.

---

## NOTAS TÉCNICAS GENERALES

- **PWA:** Configurar `vite-plugin-pwa` para service worker y manifest. Permite instalar en home screen y uso offline.
- **Performance mobile:** Preferir CSS animations sobre JS animations cuando sea posible. Usar `transform` y `opacity` (propiedades que no causan reflow).
- **Accesibilidad:** Todos los botones interactivos deben tener `aria-label`. El contraste de texto debe pasar WCAG AA.
- **Testing de modos:** Testear manualmente cambiando la hora del sistema, o agregar un `?mode=morning|afternoon|night` en la URL para desarrollo.
- **Estado global:** Considerar Zustand (ligero) en lugar de Context + useReducer si el estado crece. `npm install zustand`.

---

*Última actualización: Abril 2026 — AJETREOS DEL SUR · CBA*
