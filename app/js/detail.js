// The detail pane: official description, our own-words guide, steps, sources.
const LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

export function renderDetail(container, t, earned, onToggle) {
  container.innerHTML = '';
  if (!t) {
    const empty = document.createElement('div');
    empty.innerHTML = '<h2>Pick a trophy</h2><p>Select any trophy on the left to see its guide, steps and sources.</p>';
    container.appendChild(empty);
    return;
  }
  const medal = document.createElement('div');
  medal.className = `medal ${t.grade}`;
  medal.textContent = LETTER[t.grade] || '?';
  const title = document.createElement('h2');
  title.textContent = t.name;
  const gradeLine = document.createElement('p');
  gradeLine.className = 'stage-line';
  gradeLine.textContent = `${t.grade[0].toUpperCase() + t.grade.slice(1)} trophy · ${t.kind} · #${t.id} of 55`;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official: “${t.description}”`;
  container.append(medal, title, gradeLine, official);
  if (t.missable) {
    const warn = document.createElement('div');
    warn.className = 'missable-banner';
    warn.textContent = '⚠ MISSABLE — the only missable trophy. Meditate at all 18 spots before the story ends.';
    container.appendChild(warn);
  }
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  container.appendChild(guide);
  const stepsTitle = document.createElement('h3');
  stepsTitle.textContent = 'Steps';
  const steps = document.createElement('ol');
  steps.className = 'steps';
  for (const s of t.steps || []) {
    const li = document.createElement('li');
    li.textContent = s;
    steps.appendChild(li);
  }
  container.append(stepsTitle, steps);
  const sources = document.createElement('p');
  sources.className = 'sources';
  sources.textContent = `Sources: ${(t.sources || []).join(' · ')} — guides in our own words; names, descriptions and grades from the official list.`;
  container.appendChild(sources);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earn-btn';
  btn.textContent = earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.addEventListener('click', () => onToggle(t));
  container.appendChild(btn);
}
