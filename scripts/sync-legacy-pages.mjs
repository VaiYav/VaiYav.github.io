import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const copies = [
  ['v2/index.html', 'public/v2/index.html'],
  ['2000/resume-2000.html', 'public/2000/resume-2000.html'],
  ['resume-recruiter/resume-recruiter.html', 'public/resume-recruiter/resume-recruiter.html'],
  ['assets/unnamed.jpg', 'public/assets/unnamed.jpg'],
];

for (const [source, destination] of copies) {
  const target = resolve(root, destination);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(root, source), target);
}

console.log(`Synced ${copies.length} legacy assets into public/`);
