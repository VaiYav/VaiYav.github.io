import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const copies = [
  ['v2/index.html', 'public/v2/index.html'],
  ['2000/resume-2000.html', 'public/2000/resume-2000.html'],
  ['Web-Prototype/valentyn-yakovliev-recruiter-resume.html', 'public/valentyn-yakovliev-recruiter-resume.html'],
  ['assets/unnamed.jpg', 'public/assets/unnamed.jpg'],
];

const oldTarget = resolve(root, 'public/resume-recruiter/resume-recruiter.html');
try { rmSync(oldTarget); } catch { /* generated legacy target may not exist */ }

for (const [source, destination] of copies) {
  const target = resolve(root, destination);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(root, source), target);
}

console.log(`Synced ${copies.length} legacy assets into public/`);
