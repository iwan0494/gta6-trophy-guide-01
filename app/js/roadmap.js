// The four-stage roadmap to the platinum, about 200 hours in total.
export const STAGES = [
  { title: 'Stage 1 — Story, chapters 1–2', hours: '~25 hours', text: 'Play the story. Meditate at every spot you pass: Positive Mental Attitude is the only missable trophy.', ids: [2, 3, 4, 8, 28] },
  { title: 'Stage 2 — Story, chapters 3–4 and finale', hours: '~35 hours', text: 'Finish the story and the character strands. Try each activity type once for Master of None.', ids: [5, 6, 7, 16, 22, 23, 24, 26, 27] },
  { title: 'Stage 3 — Activities and collectibles', hours: '~70 hours', text: 'Stunts, races, shooting range, drone races, cards, WAiNK spots, exploration. The long middle of the hunt.', ids: [15, 17, 18, 19, 20, 21, 25, 29, 30, 31, 35, 42] },
  { title: 'Stage 4 — Clean-up and 100%', hours: '~70 hours', text: 'Challenges, combat feats, robberies, money trophies, and the final 100% push for A Long Road.', ids: [14, 32, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55] },
];

export function renderRoadmap(container, all, earned, onPick) {
  const byId = new Map(all.map((t) => [t.id, t]));
  container.innerHTML = '';
  for (const stage of STAGES) {
    const li = document.createElement('li');
    li.className = 'stage';
    const done = stage.ids.filter((id) => earned.has(id)).length;
    const head = document.createElement('h3');
    head.textContent = `${stage.title} — ${done}/${stage.ids.length} earned`;
    const hours = document.createElement('span');
    hours.className = 'stage-hours';
    hours.textContent = stage.hours;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.ids) {
      const t = byId.get(id);
      if (!t) continue;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = `${earned.has(id) ? '✓ ' : ''}${t.name}`;
      chip.addEventListener('click', () => onPick(t));
      chips.appendChild(chip);
    }
    li.append(head, hours, p, chips);
    container.appendChild(li);
  }
}
