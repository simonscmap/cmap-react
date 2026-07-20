#!/usr/bin/env node
/**
 * generate-scss-tokens.js
 *
 * Regenerates src/Stylesheets/_tokens.scss from src/theme/tokens.json.
 *
 * The SCSS partial exposes the design tokens to build-time Sass consumers
 * (principally the ag-grid material theme in App.scss, whose Sass color
 * functions require literal values). Run this script after editing
 * tokens.json, then commit both files together:
 *
 *     node scripts/generate-scss-tokens.js
 *
 * Runtime stylesheets should prefer the CSS custom properties injected by
 * src/theme/cssVariables.js and do not require regeneration.
 */
var fs = require('fs');
var path = require('path');

var tokensPath = path.join(__dirname, '..', 'src', 'theme', 'tokens.json');
var outPath = path.join(__dirname, '..', 'src', 'Stylesheets', '_tokens.scss');

var tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

var lines = [];
lines.push('// GENERATED FILE — do not edit by hand.');
lines.push('//');
lines.push('// Source of truth: src/theme/tokens.json');
lines.push('// Regenerate with:  node scripts/generate-scss-tokens.js');
lines.push('//');
lines.push('// This partial exposes the design tokens as SCSS variables for build-time');
lines.push('// consumers that cannot read CSS custom properties, principally the ag-grid');
lines.push('// material theme, whose Sass functions (darken, lighten) require literal');
lines.push('// color values. Runtime stylesheets should prefer the CSS custom properties');
lines.push('// injected by src/theme/cssVariables.js (var(--cmap-...)).');
lines.push('');

Object.keys(tokens.color).forEach(function (key) {
  lines.push('$cmap-' + kebab(key) + ': ' + tokens.color[key] + ';');
});

fs.writeFileSync(outPath, lines.join('\n') + '\n');
process.stdout.write('Wrote ' + outPath + '\n');
