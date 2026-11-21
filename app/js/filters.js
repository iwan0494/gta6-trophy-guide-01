// List filtering: text search, grade, kind, and the spoiler shield.
export function filterTrophies(all, opts) {
  const q = (opts.q || '').trim().toLowerCase();
  return all.filter((t) => {
    if (opts.grade && t.grade !== opts.grade) return false;
    if (opts.kind && t.kind !== opts.kind) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function isHiddenBySpoiler(t, earned, spoilerOn) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.id);
}
