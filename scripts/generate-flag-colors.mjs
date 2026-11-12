import { readFile, mkdir, writeFile } from 'node:fs/promises';

const source = JSON.parse(
  await readFile(new URL('../node_modules/country-json/src/country-by-flag.json', import.meta.url), 'utf8'),
);

const output = {};
for (const entry of source) {
  if (!entry.flag_base64) continue;
  const encoded = entry.flag_base64.split(',')[1];
  if (!encoded) continue;
  const svg = Buffer.from(encoded, 'base64').toString('utf8').toLowerCase();
  const fills = new Set();
  for (const match of svg.matchAll(/(?:(?:fill|stroke)[=:]\s*["']?|(?:fill|stroke):)(#[0-9a-f]{3,8}|[a-z]+)(?:[;"'\s])/g)) {
    const color = match[1];
    if (!['none', 'transparent', 'currentcolor'].includes(color)) fills.add(color);
  }
  if ([...svg.matchAll(/<path\b[^>]*>/g)].some(([tag]) => !/(?:fill|stroke)[=:]/.test(tag))) {
    fills.add('#000');
  }
  output[entry.country] = Math.max(1, Math.min(9, fills.size || 1));
}

const target = new URL('../src/generated/flag-colors.json', import.meta.url);
await mkdir(new URL('../src/generated/', import.meta.url), { recursive: true });
await writeFile(target, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated flag color counts for ${Object.keys(output).length} countries.`);
