// Leonida Ledger — the road to the platinum (roadmap.js).
//
// One job: the four stages of the platinum run, built from the official
// trophy descriptions — which chapters and missions, which collectibles
// and counts, in what order. Hours are the published guides' estimates
// for a first playthrough (about 200 hours in total, difficulty 4/10).

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Play the story — Chapters 1 to 5',
    hours: '60–80 hours',
    blurb:
      'Just play. Every chapter and named mission unlocks its trophy on its own, and progress you make ' +
      'along the way already counts toward 100% completion. Do not rush past Chapter 1: the morning after ' +
      'Down to Earth is the one missable moment in the game (see Missables).',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    note: 'Keep a manual save at the start and end of each chapter. There is no mission replay.',
  },
  {
    stage: 2,
    title: 'Strangers, side stories and the open world',
    hours: 'about 25 hours',
    blurb:
      'After the story opens Leonida up, finish the stranger strands and the side characters\' final ' +
      'missions. Hunt the unique animal for Bret, and try every activity type once — fishing, races, ' +
      'arcades, the shooting range — so the activity trophies start ticking over early.',
    trophyIds: [22, 23, 24, 25, 26, 27, 29, 16, 20, 21],
    note: 'Stranger strands appear across the state; check the map for new markers after each chapter.',
  },
  {
    stage: 3,
    title: 'Reach 100% Completion — A Long Road',
    hours: 'about 90 hours',
    blurb:
      'The long middle. The 100% Completion checklist appears under Progress after the final mission, ' +
      'and it asks for far less than everything: 15 of the 18 collectible card sets, 100 WAiNK locations, ' +
      '33 underwater discoveries, 100 flamingos, 200 of 277 vehicles, 100 of 255 animals, 70 of 80 ' +
      'challenges, and all 42 shooting-range gold medals. Explore every area of Leonida on the way.',
    trophyIds: [14, 30, 31, 35, 42, 17, 32],
    note: 'You only need 70 of 80 challenges — skip the hardest ones and come back if you want.',
  },
  {
    stage: 4,
    title: 'Clean up the grinds, then the platinum',
    hours: 'about 15 hours',
    blurb:
      'What is left is counting: 250 stunts, 20 different race wins, the robbery sets, the economy ' +
      'trophies, and the small moments — a cocktail on Ocean Beach, a bowling follow-through, a melee ' +
      'drive-by. When the last one pops, Vice Got a Price! follows on its own.',
    trophyIds: [15, 18, 19, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 1],
    note: 'Robberies: 39 gang operations, 22 bank jobs, 7 payday loan jobs and 8 bank vaults feed the robbery trophies.',
  },
];

export function stageForTrophy(trophyId) {
  for (const stage of ROADMAP_STAGES) {
    if (stage.trophyIds.includes(trophyId)) return stage.stage;
  }
  return 4;
}

export function renderRoadmap(container, trophies, onOpenTrophy) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const item = document.createElement('li');
    item.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    heading.textContent = `Stage ${stage.stage} — ${stage.title}`;
    const hours = document.createElement('p');
    hours.className = 'stage-hours';
    hours.textContent = `${stage.hours} · ${stage.trophyIds.length} trophies`;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophyIds) {
      const trophy = byId.get(id);
      if (!trophy) continue;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = `${trophy.name} · ${trophy.grade}`;
      chip.addEventListener('click', () => onOpenTrophy(trophy.id));
      chips.append(chip);
    }
    const note = document.createElement('p');
    note.className = 'stage-line';
    note.textContent = stage.note;
    item.append(heading, hours, blurb, chips, note);
    container.append(item);
  }
}
