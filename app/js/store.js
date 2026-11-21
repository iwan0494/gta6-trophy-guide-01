// Progress storage for Leonida Ledger: localStorage plus export / import.
export const KEY = 'leonida-ledger-v3';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed.earned) ? parsed.earned : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(KEY, JSON.stringify({ earned: [...earned], savedAt: new Date().toISOString() }));
}

export function exportText(earned) {
  return JSON.stringify({ app: 'leonida-ledger', version: 3, earned: [...earned] }, null, 2);
}

export function importText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.earned)) throw new Error('Not a Leonida Ledger export');
  return new Set(parsed.earned.map(Number).filter((n) => Number.isInteger(n)));
}
