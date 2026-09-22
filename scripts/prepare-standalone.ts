import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const standalone = path.join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error('missing .next/standalone — run next build first');
  process.exit(1);
}

const publicDir = path.join(root, 'public');
if (existsSync(publicDir)) {
  cpSync(publicDir, path.join(standalone, 'public'), { recursive: true });
}

const staticDir = path.join(root, '.next', 'static');
if (existsSync(staticDir)) {
  mkdirSync(path.join(standalone, '.next'), { recursive: true });
  cpSync(staticDir, path.join(standalone, '.next', 'static'), {
    recursive: true,
  });
}
