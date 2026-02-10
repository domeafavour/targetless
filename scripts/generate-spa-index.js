#!/usr/bin/env node

import { writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Find the main JS and CSS files
const distDir = 'dist/client';
const assetsDir = join(distDir, 'assets');

const files = readdirSync(assetsDir);
const mainJs = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
const stylesCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

if (!mainJs) {
  console.error('Could not find main JS file');
  process.exit(1);
}

const basePath = process.env.GITHUB_PAGES === 'true' ? '/targetless/' : '/';

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TanStack Start Starter</title>
    <link rel="icon" href="${basePath}favicon.ico" />
    ${stylesCss ? `<link rel="stylesheet" href="${basePath}assets/${stylesCss}" />` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${basePath}assets/${mainJs}"></script>
  </body>
</html>`;

writeFileSync(join(distDir, 'index.html'), html);

// Also create 404.html for client-side routing on GitHub Pages
const notFoundHtml = html;
writeFileSync(join(distDir, '404.html'), notFoundHtml);

console.log('✅ Generated index.html and 404.html for GitHub Pages deployment');
