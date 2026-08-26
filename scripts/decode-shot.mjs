/**
 * Decodes the most recent CDP Page.captureScreenshot response into a PNG.
 * Usage: node scripts/decode-shot.mjs <output-name>
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const logDir = join(homedir(), '.cursor', 'browser-logs');
const out = process.argv[2] ?? 'shot';

const latest = readdirSync(logDir)
  .filter((f) => f.includes('Page.captureScreenshot'))
  .map((f) => ({ f, t: statSync(join(logDir, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t)[0];

if (!latest) {
  console.error('No screenshot response found');
  process.exit(1);
}

const json = JSON.parse(readFileSync(join(logDir, latest.f), 'utf8'));
const data = json.data ?? json.result?.data;
mkdirSync('.shots', { recursive: true });
const target = `.shots/${out}.png`;
writeFileSync(target, Buffer.from(data, 'base64'));
console.log(target);
