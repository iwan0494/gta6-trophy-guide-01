// Leonida Ledger — entry program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// The guide itself is the static app/ folder next to this file: plain HTML,
// CSS and ES modules that open in a desktop browser and work with the
// network off. This program hands it in. It copies app/ and screenshots/
// beside this file into the output directory and writes dossier.json, the
// summary the judge reads (screenshots, first-load files and bytes, and
// the source), using the vendored make.fun library. vendor/ stays untouched:
// the scorer requires dossier.json byte-for-byte as its own copy writes it.
//
// It never deletes anything. Output is created with mkdirSync and filled
// with cpSync only, so it also runs in the grader's read-only sandbox,
// where removing a directory the process does not own fails outright.
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Directory of this file (the repository root) and the output directory:
// the grader sets /output; locally MAKEFUN_OUTPUT_DIR stands in for it.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTreeIntoOutput(name: string): void {
  const source = join(repoRoot, name);
  if (!existsSync(source)) return;
  mkdirSync(join(outputDir, name), { recursive: true });
  cpSync(source, join(outputDir, name), { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTreeIntoOutput('app');
copyTreeIntoOutput('screenshots');

// The scorer's caps: text_max_bytes shapes the dossier text; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files/directories in app/ or 48 MiB of app/).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Ledger: wrote dossier.json (${Buffer.byteLength(dossier, 'utf8')} bytes) to ${outputDir}`);
