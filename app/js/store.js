// Leonida Ledger — saved progress (store.js).
//
// One job: keep the earned set in this browser's localStorage, and move it
// in and out as a JSON file. Nothing here touches the network. The file
// format is a plain JSON array of trophy ids, so an export from any version
// of this guide imports back cleanly.

export const STORAGE_KEY = 'leonida-ledger-progress-v1';

// The demo seed the screenshot run uses: a believable mid-story ledger
// (opening chapters and their missions earned, the platinum road ahead).
export const DEMO_EARNED_IDS = [2, 3, 8, 10, 15, 21, 35, 44, 46];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Private mode or a full store: the checklist still works in memory.
  }
}

export function exportProgressFile(earned) {
  const blob = new Blob([JSON.stringify([...earned].sort((a, b) => a - b), null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  return new Set(ids.filter((id) => Number.isInteger(id)));
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored; nothing to clear.
  }
  return new Set();
}
