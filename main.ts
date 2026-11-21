// Leonida Ledger R3 entrypoint (Node 22, standard library only).
// Hands the guide in: copies app/ and screenshots/ next to this file into
// the output directory and asks the vendored make.fun library to write the
// dossier the judge reads. Nothing is deleted here, ever.
import { cpSync as copyTree, existsSync as present, mkdirSync as makeDir, writeFileSync as putFile } from 'node:fs';
import { join as joinPath } from 'node:path';
import { fileURLToPath as hereFile } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = hereFile(new URL('.', import.meta.url));
const dest = process.env.MAKEFUN_OUTPUT_DIR || '/output';

makeDir(dest, { recursive: true });
copyTree(joinPath(repoRoot, 'app'), joinPath(dest, 'app'), { recursive: true });
makeDir(joinPath(dest, 'screenshots'), { recursive: true });
if (present(joinPath(repoRoot, 'screenshots'))) {
  copyTree(joinPath(repoRoot, 'screenshots'), joinPath(dest, 'screenshots'), { recursive: true });
}

// Caps from the kit's gate: at most 4 screenshots of 256 KiB, dossier text
// capped at 163840 bytes, app/ at most 993 files and 48 MiB.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
putFile(joinPath(dest, 'dossier.json'), buildDossier(dest, dossierCaps));
