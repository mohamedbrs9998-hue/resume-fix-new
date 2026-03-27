import fs from 'fs/promises';
import path from 'path';

const targets = ['.next', '.vercel', 'coverage', 'dist', 'build'];

for (const target of targets) {
  const full = path.join(process.cwd(), target);
  await fs.rm(full, { recursive: true, force: true }).catch(() => null);
}

console.log('Cleaned build artifacts');
