#!/usr/bin/env node

/**
 * Post-build script to generate index.html for GitHub Pages deployment
 * This ensures that the client build has a proper entry point
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for app name
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const appName = packageJson.name || 'targetless';

const distClientPath = path.join(__dirname, '..', 'dist', 'client');
const indexPath = path.join(distClientPath, 'index.html');

// Check if dist/client exists
if (!fs.existsSync(distClientPath)) {
  console.error('Error: dist/client directory not found');
  process.exit(1);
}

// Check if index.html already exists (from prerendering)
if (fs.existsSync(indexPath)) {
  console.log('index.html already exists in dist/client - prerendering worked!');
} else {
  // Find the main JS file in assets
  const assetsPath = path.join(distClientPath, 'assets');
  let mainJs = '';
  let stylesCSS = '';

  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    // Find the main bundle (usually the largest JS file)
    mainJs = jsFiles.find(f => f.includes('main')) || jsFiles[jsFiles.length - 1] || '';
    stylesCSS = cssFiles.find(f => f.includes('styles')) || cssFiles[0] || '';
  }

  // Generate index.html
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/targetless/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName} - Event Tracker</title>
    ${stylesCSS ? `<link rel="stylesheet" href="/targetless/assets/${stylesCSS}" />` : ''}
  </head>
  <body>
    <div id="root"></div>
    ${mainJs ? `<script type="module" src="/targetless/assets/${mainJs}"></script>` : ''}
  </body>
</html>`;

  fs.writeFileSync(indexPath, html);
  console.log('Generated index.html for GitHub Pages');
  console.log(`  Main JS: ${mainJs}`);
  console.log(`  Styles: ${stylesCSS}`);
}

// Update manifest.json for GitHub Pages (only when GITHUB_PAGES env is set)
if (process.env.GITHUB_PAGES === 'true') {
  const manifestPath = path.join(distClientPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Update start_url and scope for GitHub Pages
    manifest.start_url = '/targetless/';
    manifest.scope = '/targetless/';
    
    // Update icon paths to include base path
    if (manifest.icons && Array.isArray(manifest.icons)) {
      manifest.icons = manifest.icons.map(icon => ({
        ...icon,
        src: `/targetless/${icon.src.replace(/^\//, '')}`
      }));
    }
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('Updated manifest.json for GitHub Pages');
  }
}

// Update service worker with build timestamp to ensure cache busting
const swPath = path.join(distClientPath, 'sw.js');
if (fs.existsSync(swPath)) {
  const buildTimestamp = Date.now();
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Replace the BUILD_TIMESTAMP placeholder with actual timestamp
  swContent = swContent.replace(/BUILD_TIMESTAMP/g, buildTimestamp.toString());
  
  fs.writeFileSync(swPath, swContent);
  console.log(`Updated service worker with build timestamp: ${buildTimestamp}`);
}
