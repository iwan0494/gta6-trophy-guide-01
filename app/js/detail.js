// Leonida Ledger — the guide pane (detail.js).
//
// One job: show one trophy properly — official name, description and grade,
// its kind and roadmap stage, the guide in this ledger's own words, the
// steps, and the published guides its facts were checked against. A story
// trophy hidden by the spoiler setting shows a placeholder instead.

import { KIND_LABELS, isHiddenBySpoiler } from './filters.js';
import { stageForTrophy } from './roadmap.js';

function sourceLine(source) {
  return source.name;
}

export function renderDetail(pane, trophy, earned, spoilerOn, onToggleEarned) {
  pane.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('div');
    empty.className = 'detail-empty';
    const heading = document.createElement('h2');
    heading.textContent = 'Pick a trophy';
    const text = document.createElement('p');
    text.textContent =
      'Select any trophy on the left to read its guide: what to do, where and how, when it can be ' +
      'missed, and which published guide the facts were checked against.';
    const hint = document.createElement('p');
    hint.textContent = 'Start with the flagged one: Positive Mental Attitude is the only missable trophy in the game.';
    empty.append(heading, text, hint);
    pane.append(empty);
    return;
  }

  const hidden = isHiddenBySpoiler(trophy, earned, spoilerOn);
  const tags = document.createElement('div');
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

  const heading = document.createElement('h2');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const official = document.createElement('p');
  official.className = 'detail-official';
  official.textContent = hidden
    ? 'Earn this trophy to reveal its name and description.'
    : `“${trophy.description}” — official description`;
  const stage = document.createElement('p');
  stage.className = 'stage-line';
  stage.textContent = `Roadmap stage ${stageForTrophy(trophy.id)} · ${trophy.grade} trophy`;
  pane.append(tags, heading, official, stage);

  if (trophy.missable) {
    const banner = document.createElement('p');
    banner.className = 'missable-banner';
    banner.textContent = '⚠ Missable — read the warning below before you play past Chapter 1.';
    pane.append(banner);
  }

  if (!hidden) {
    const guide = document.createElement('p');
    guide.className = 'detail-guide';
    guide.textContent = trophy.guide;
    pane.append(guide);
    if (Array.isArray(trophy.steps) && trophy.steps.length > 0) {
      const steps = document.createElement('ol');
      steps.className = 'detail-steps';
      for (const step of trophy.steps) {
        const item = document.createElement('li');
        item.textContent = step;
        steps.append(item);
      }
      pane.append(steps);
    }
    if (trophy.missableNote) {
      const note = document.createElement('p');
      note.className = 'missable-banner';
      note.textContent = trophy.missableNote;
      pane.append(note);
    }
    const sources = document.createElement('p');
    sources.className = 'detail-sources';
    sources.textContent = `Sources: ${(trophy.sources ?? []).map(sourceLine).join(' · ')}`;
    pane.append(sources);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'earn-btn';
  toggle.textContent = earned.has(trophy.id) ? '✓ Earned — mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => onToggleEarned(trophy.id));
  pane.append(toggle);
}
