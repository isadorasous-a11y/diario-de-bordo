const STORAGE_KEY = 'diario:entradas:v1';

// Estado em memória
let entradas = [];
let instalarEvent = null;

// Utilidades
const $ = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

// DOM refs
const form = byId('formEntrada');
const tituloEl = byId('titulo');
const dataEl = byId('data');
const descEl = byId('descricao');
const msgForm = byId('msgForm');
const listaEl = byId('lista');
const vazioEl = byId('vazio');
const instalarBtn = byId('instalarBtn');
const exportarBtn = byId('exportarBtn');

// ===== Persistência =====
function carregar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    entradas = raw ? JSON.parse(raw) : [];
  } catch {
    entradas = [];
  }
}

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
}

// ===== Render =====
function render() {
  listaEl.innerHTML = '';
  listaEl.setAttribute('aria-busy', 'true');

  if (!entradas.length) {
    vazioEl.style.display = 'block';
    listaEl.setAttribute('aria-busy', 'false');
    return;
  }
  vazioEl.style.display = 'none';

  // Ordena por data (desc) e createdAt (desc)
  const sorted = [...entradas].sort((a, b) => {
    if (a.dataISO > b.dataISO) return -1;
    if (a.dataISO < b.dataISO) return 1;
    return b.createdAt - a.createdAt;
  });

  for (const e of sorted) {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div>
        <p class="item-title">${escapeHTML(e.titulo)}</p>
        <p class="item-meta">${formatarData(e.dataISO)}</p>
        <p class="item-desc">${escapeHTML(e.descricao)}</p>
      </div>
      <div>
        <button class="btn danger small" aria-label="Remover entrada" data-id="${e.id}">Remover</button>
      </div>
    `;
    listaEl.appendChild(li);
  }

  listaEl.setAttribute('aria-busy', 'false');
}

function escapeHTML(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

function formatarData(iso) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(d);
  } catch {
    return iso;
  }
}

// ===== CRUD =====
function adicionarEntrada({ titulo, dataISO, descricao }) {
  const id = genId();
  const createdAt = Date.now();
  entradas.push({ id, titulo, dataISO, descricao, createdAt });
  salvar();
  render();
}

function removerEntrada(id) {
  entradas = entradas.filter(e => e.id !== id);
  salvar();
  render();
}

// Fallback para ambientes sem crypto.randomUUID (consistência com testes)
function genId() {
  const g = globalThis;
  if (g?.crypto?.randomUUID) return g.crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

// ===== Eventos =====
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = tituloEl.value.trim();
  const dataISO = dataEl.value; // yyyy-mm-dd
  const descricao = descEl.value.trim();

  if (!titulo || !dataISO || !descricao) {
    msgForm.textContent = 'Preencha título, data e descrição.';
    return;
  }
  adicionarEntrada({ titulo, dataISO, descricao });
  form.reset();
  msgForm.textContent = 'Entrada adicionada.';
  tituloEl.focus();
});

listaEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  removerEntrada(id);
});

exportarBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(entradas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `diario-de-bordo-${new Date().toISOString().slice(0,10)}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
});

// PWA: beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  instalarEvent = e;
  instalarBtn.hidden = false;
});

instalarBtn.addEventListener('click', async () => {
  if (!instalarEvent) return;
  instalarBtn.disabled = true;
  try {
    const choice = await instalarEvent.prompt();
    // opcional: analisar choice.outcome === 'accepted'
  } finally {
    instalarEvent = null;
    instalarBtn.hidden = true;
    instalarBtn.disabled = false;
  }
});

// PWA: registrar SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      /* sem erro ruidoso; app funciona mesmo assim */
    });
  });
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('✅ SW registrado:', reg))
      .catch(err => console.error('❌ Erro ao registrar SW:', err));
  });
}


// Boot
carregar();
render();
