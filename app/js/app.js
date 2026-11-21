// Leonida Ledger boot: load data, render the list, wire tabs, toolbar and detail.
import { loadEarned, saveEarned, exportText, importText } from './store.js';
import { filterTrophies, isHiddenBySpoiler } from './filters.js';
import { renderRoadmap } from './roadmap.js';
import { renderDetail } from './detail.js';

const LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
let all = [];
let earned = loadEarned();
let selectedId = 28;
let justEarnedId = null;

const $ = (id) => document.getElementById(id);

function counts() {
  const total = all.length;
  const got = all.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((got / total) * 100) : 0;
  $('ringText').innerHTML = `${got}<small>of ${total}</small>`;
  $('ring').style.background = `conic-gradient(var(--teal) ${pct * 3.6}deg, #e5dcc4 0deg)`;
  $('earnedLine').textContent = `${got} of ${total} trophies earned`;
  $('earnedPct').textContent = `${pct}% — ${got === total ? 'platinum earned!' : 'the platinum is waiting'}`;
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  $('gradeCounts').innerHTML = '';
  for (const g of grades) {
    const n = all.filter((t) => t.grade === g).length;
    const e = all.filter((t) => t.grade === g && earned.has(t.id)).length;
    const pill = document.createElement('span');
    pill.className = `pill ${g}`;
    pill.textContent = `${g[0].toUpperCase() + g.slice(1)} ${e}/${n}`;
    $('gradeCounts').appendChild(pill);
  }
}

function visible() {
  return filterTrophies(all, {
    q: $('search').value,
    grade: $('gradeFilter').value,
    kind: $('kindFilter').value,
  });
}

function renderList() {
  const list = $('trophyList');
  list.innerHTML = '';
  const rows = visible();
  const spoiler = $('spoilerToggle').checked;
  $('listMeta').textContent = `Showing ${rows.length} of ${all.length} trophies · ${earned.size} earned · click a row for its guide`;
  for (const t of rows) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '') + (t.id === justEarnedId ? ' just-earned' : '');
    btn.dataset.trophyId = t.id;
    const medal = document.createElement('span');
    medal.className = `medal ${t.grade}`;
    medal.textContent = LETTER[t.grade] || '?';
    const body = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = isHiddenBySpoiler(t, earned, spoiler) ? 'Hidden trophy — earn it to reveal' : t.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = isHiddenBySpoiler(t, earned, spoiler) ? 'Story trophy, hidden by the spoiler setting.' : t.description;
    const tags = document.createElement('span');
    tags.className = 'tags';
    for (const [label, cls] of [[t.grade, t.grade], [t.kind, 'kind'], ...(t.missable ? [['Missable', 'missable']] : [])]) {
      const tag = document.createElement('span');
      tag.className = `tag ${cls}`;
      tag.textContent = label;
      tags.appendChild(tag);
    }
    body.append(name, desc, tags);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggle(t);
    });
    btn.append(medal, body, box);
    btn.addEventListener('click', () => {
      selectedId = t.id;
      justEarnedId = null;
      renderAll();
    });
    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderDetailPane() {
  const t = all.find((x) => x.id === selectedId) || null;
  renderDetail($('detail'), t, earned, toggle);
}

function toggle(t) {
  const wasEarned = earned.has(t.id);
  if (wasEarned) earned.delete(t.id);
  else earned.add(t.id);
  justEarnedId = wasEarned ? null : t.id;
  selectedId = t.id;
  saveEarned(earned);
  renderAll();
  if (!wasEarned) showToast(`✓ ${t.name} earned — ${earned.size} of ${all.length} trophies`);
}

let toastTimer = null;
function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

function renderAll() {
  counts();
  renderList();
  renderDetailPane();
  renderRoadmap($('roadmapStages'), all, earned, (t) => {
    selectedId = t.id;
    switchView('checklist');
    renderAll();
  });
  const miss = all.filter((t) => t.missable);
  const box = $('missablesList');
  box.innerHTML = '';
  for (const t of miss) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const h = document.createElement('h3');
    h.textContent = t.name;
    const warn = document.createElement('div');
    warn.className = 'missable-banner';
    warn.textContent = 'MISSABLE — meditate at all 18 spots before the story ends.';
    const p = document.createElement('p');
    p.textContent = t.guide;
    const s = document.createElement('p');
    s.className = 'sources';
    s.textContent = `Sources: ${(t.sources || []).join(' · ')}`;
    card.append(h, warn, p, s);
    box.appendChild(card);
  }
}

function switchView(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
  for (const view of document.querySelectorAll('.view')) {
    view.hidden = view.id !== `view-${name}`;
  }
}

async function boot() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  all = data.trophies;
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  }
  for (const id of ['search', 'gradeFilter', 'kindFilter', 'spoilerToggle']) {
    $(id).addEventListener('input', renderList);
    $(id).addEventListener('change', renderList);
  }
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([exportText(earned)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-ledger-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Progress exported — leonida-ledger-progress.json');
  });
  $('importFile').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      earned = importText(await file.text());
      saveEarned(earned);
      renderAll();
      showToast(`Progress imported — ${earned.size} of ${all.length} trophies`);
    } catch {
      showToast('That file is not a Leonida Ledger export');
    }
  });
  $('resetBtn').addEventListener('click', () => {
    earned = new Set();
    saveEarned(earned);
    justEarnedId = null;
    renderAll();
  });
  renderAll();
}

boot();
