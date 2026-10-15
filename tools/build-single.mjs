// Empaqueta el juego en un único HTML autocontenido (dist/aqpixel.html),
// útil para compartirlo o publicarlo sin servidor.
// También genera dist/aqpixel-fragment.html, sin <html>/<head>/<body>, para hosts que agregan su propio esqueleto.

import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const FONTS = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap';

const result = await build({
  entryPoints: ['js/main.js'],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  write: false,
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = await readFile('css/style.css', 'utf8');

const head = [
  '<title>AQPixel</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  `<link rel="stylesheet" href="${FONTS}">`,
  `<style>${css}</style>`,
].join('\n');
const body = `<div id="app"></div>\n<script>${js}</script>`;

const full = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
${body}
</body>
</html>
`;

await mkdir('dist', { recursive: true });
await writeFile('dist/aqpixel.html', full);
await writeFile('dist/aqpixel-fragment.html', `${head}\n${body}\n`);
console.log(`dist/aqpixel.html (${(full.length / 1024).toFixed(1)} KB)`);
