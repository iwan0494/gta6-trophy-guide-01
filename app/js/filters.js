// Leonida Ledger — filters and the spoiler rule (filters.js).
//
// One job: decide which trophies a view shows, and what a hidden story
// trophy looks like. The spoiler rule comes straight from the brief: a
// story trophy's name and description stay hidden until it is earned, so
// a player working through the story cannot be spoiled by their own guide.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  milestone: 'Milestone',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export function isStoryTrophy(trophy) {
  return trophy.kind === 'story';
}

export function isHiddenBySpoiler(trophy, earned, spoilerOn) {
  return spoilerOn && isStoryTrophy(trophy) && !earned.has(trophy.id);
}

export function trophyMatches(trophy, filters, earned) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.status === 'earned' && !earned.has(trophy.id)) return false;
  if (filters.status === 'remaining' && earned.has(trophy.id)) return false;
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

export function visibleTrophies(trophies, filters, earned) {
  return trophies.filter((trophy) => trophyMatches(trophy, filters, earned));
}

export function countByGrade(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    counts[trophy.grade][1] += 1;
    if (earned.has(trophy.id)) counts[trophy.grade][0] += 1;
  }
  return counts;
}
