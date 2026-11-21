// Leonida Ledger — boot and wiring (app.js).
//
// One job: load the trophy list, keep the three views (checklist, roadmap,
// missables) in sync with the toolbar, and remember what the player has
// earned. The URL carries the state — ?view=roadmap, ?grade=silver,
// ?trophy=28, ?spoiler=on, ?seed=demo — so a screenshot can open the exact
// view it needs, and a link back to a trophy still works.

import {
  DEMO_EARNED_IDS,
  clearProgress,
  exportProgressFile,
  importProgressFile,
  loadProgress,
  saveProgress,
} from './store.js';
import {
  GRADE_ORDER,
  KIND_LABELS,
  countByGrade,
  isHiddenBySpoiler,
  visibleTrophies,
} from './filters.js';
import { renderRoadmap } from './roadmap.js';
import { renderDetail } from './detail.js';

const params = new URLSearchParams(location.search);
const trophies = (await (await fetch('data/trophies.json')).json()).trophies;
const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));

let earned = loadProgress();
if (params.get('seed') === 'demo' && earned.size === 0) {
  earned = new Set(DEMO_EARNED_IDS);
  saveProgress(earned);
}

let selectedId = Number(params.get('trophy') ?? '0') || null;
if (selectedId && !byId.has(selectedId)) selectedId = null;

let lastJustEarned = null;

function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    elements.toast.hidden = true;
  }, 6000);
}

const filters = {
  query: '',
  grade: params.get('grade') ?? 'all',
  kind: 'all',
  status: 'all',
  spoiler: params.get('spoiler') === 'on',
};

const elements = {
  ring: document.getElementById('progressRing'),
  pct: document.getElementById('progressPct'),
  count: document.getElementById('progressCount'),
  sub: document.getElementById('progressSub'),
  gradeCounts: document.getElementById('gradeCounts'),
  search: document.getElementById('searchInput'),
  grade: document.getElementById('gradeFilter'),
  kind: document.getElementById('kindFilter'),
  status: document.getElementById('statusFilter'),
  spoiler: document.getElementById('spoilerToggle'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  resetBtn: document.getElementById('resetBtn'),
  toast: document.getElementById('toast'),
  toolbar: document.getElementById('toolbar'),
  list: document.getElementById('trophyList'),
  listMeta: document.getElementById('listMeta'),
  listEmpty: document.getElementById('listEmpty'),
  detail: document.getElementById('detailPane'),
  roadmap: document.getElementById('roadmapStages'),
  missables: document.getElementById('missablesList'),
};

elements.grade.value = filters.grade;
elements.spoiler.checked = filters.spoiler;

function updateProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  elements.pct.textContent = `${pct}%`;
  elements.ring.style.background = `conic-gradient(var(--teal) ${pct * 3.6}deg, #e5dcc4 0deg)`;
  elements.ring.setAttribute('aria-label', `${done} of ${total} trophies earned`);
  elements.count.textContent = `${done} of ${total}`;
  elements.sub.textContent =
    done === total
      ? 'Platinum earned — Vice Got a Price! is yours, Leonida Legend.'
      : `Platinum: Vice Got a Price! — ${total - done} to go`;
  const counts = countByGrade(trophies, earned);
  elements.gradeCounts.replaceChildren();
  for (const grade of GRADE_ORDER) {
    const pill = document.createElement('span');
    pill.className = `grade-pill ${grade}`;
    pill.textContent = `${grade} ${counts[grade][0]}/${counts[grade][1]}`;
    elements.gradeCounts.append(pill);
  }
}

function renderList() {
  const shown = visibleTrophies(trophies, filters, earned);
  elements.list.replaceChildren();
  elements.listEmpty.hidden = shown.length > 0;
  elements.listMeta.textContent =
    `${shown.length} of ${trophies.length} trophies shown · 1 platinum · 2 gold · 6 silver · 46 bronze`;
  for (const trophy of shown) {
    const hidden = isHiddenBySpoiler(trophy, earned, filters.spoiler);
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `trophy-row${earned.has(trophy.id) ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}${lastJustEarned === trophy.id ? ' just-earned' : ''}`;
    button.setAttribute('aria-pressed', String(earned.has(trophy.id)));

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(trophy.id);
    });

    const main = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = hidden ? 'Earn it to reveal the story trophy.' : trophy.description;
    const tags = document.createElement('span');
    tags.className = 'trophy-tags';
    for (const [label, cls] of [
      [trophy.grade, trophy.grade],
      [KIND_LABELS[trophy.kind] ?? trophy.kind, 'kind'],
      ...(trophy.missable ? [['Missable', 'missable']] : []),
    ]) {
      const tag = document.createElement('span');
      tag.className = `tag ${cls}`;
      tag.textContent = label;
      tags.append(tag);
    }
    main.append(name, desc, tags);

    const dot = document.createElement('span');
    dot.className = `grade-dot ${trophy.grade}`;
    dot.title = trophy.grade;

    button.addEventListener('click', () => openTrophy(trophy.id));
    button.append(box, main, dot);
    row.append(button);
    elements.list.append(row);
  }
}

function renderMissables() {
  const missable = trophies.filter((trophy) => trophy.missable);
  elements.missables.replaceChildren();
  for (const trophy of missable) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const banner = document.createElement('p');
    banner.className = 'missable-banner';
    banner.textContent = '⚠ The only missable trophy';
    const heading = document.createElement('h3');
    heading.textContent = `${trophy.name} — ${trophy.grade}`;
    const official = document.createElement('p');
    official.className = 'detail-official';
    official.textContent = `“${trophy.description}” — official description`;
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const note = document.createElement('p');
    note.className = 'missable-banner';
    note.textContent = trophy.missableNote ?? '';
    const sources = document.createElement('p');
    sources.className = 'detail-sources';
    sources.textContent = `Sources: ${(trophy.sources ?? []).map((s) => s.name).join(' · ')}`;
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = 'Open the full guide';
    open.addEventListener('click', () => openTrophy(trophy.id));
    card.append(banner, heading, official, guide, note, sources, open);
    elements.missables.append(card);
  }
}

function renderDetailPane() {
  renderDetail(elements.detail, selectedId ? byId.get(selectedId) : null, earned, filters.spoiler, toggleEarned);
}

function renderAll() {
  updateProgress();
  renderList();
  renderDetailPane();
}

function toggleEarned(id) {
  const wasEarned = earned.has(id);
  if (wasEarned) earned.delete(id);
  else earned.add(id);
  saveProgress(earned);
  lastJustEarned = wasEarned ? null : id;
  renderAll();
  if (!wasEarned) showToast(`✓ ${byId.get(id).name} earned — ${earned.size} of 55 trophies`);
}

function openTrophy(id) {
  selectedId = id;
  showView('checklist');
  renderAll();
  const url = new URL(location.href);
  url.searchParams.set('trophy', String(id));
  history.replaceState(null, '', url);
  document.getElementById('detailPane').scrollIntoView({ block: 'nearest' });
}

function showView(view) {
  for (const tab of document.querySelectorAll('.tab')) {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  document.getElementById('checklistView').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.getElementById('missablesView').hidden = view !== 'missables';
  if (elements.toolbar) elements.toolbar.style.display = view === 'checklist' ? '' : 'none';
  const url = new URL(location.href);
  url.searchParams.set('view', view);
  history.replaceState(null, '', url);
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}

elements.search.addEventListener('input', () => {
  filters.query = elements.search.value.trim();
  renderList();
});
elements.grade.addEventListener('change', () => {
  filters.grade = elements.grade.value;
  renderList();
});
elements.kind.addEventListener('change', () => {
  filters.kind = elements.kind.value;
  renderList();
});
elements.status.addEventListener('change', () => {
  filters.status = elements.status.value;
  renderList();
});
elements.spoiler.addEventListener('change', () => {
  filters.spoiler = elements.spoiler.checked;
  renderAll();
});
elements.exportBtn.addEventListener('click', () => {
  exportProgressFile(earned);
  showToast(`Exported leonida-ledger-progress.json — ${earned.size} of 55 earned`);
});
elements.importInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    earned = await importProgressFile(file);
    saveProgress(earned);
    renderAll();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
  event.target.value = '';
});
elements.resetBtn.addEventListener('click', () => {
  if (confirm('Clear all earned trophies in this browser?')) {
    earned = clearProgress();
    selectedId = null;
    renderAll();
  }
});

renderRoadmap(elements.roadmap, trophies, openTrophy);
renderMissables();
showView(params.get('view') ?? 'checklist');
renderAll();
