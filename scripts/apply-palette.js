#!/usr/bin/env node
/**
 * apply-palette.js
 *
 * Switches the application to a named palette in one command:
 *
 *     node scripts/apply-palette.js <palette-name>
 *
 * where <palette-name> matches a file in palettes/<palette-name>.json.
 * Available palettes are listed by running the script with no argument.
 *
 * What it does:
 *  1. Reads the current color values from src/theme/tokens.json and the
 *     target values from the palette file.
 *  2. Writes the new values into src/theme/tokens.json, including inside
 *     gradient strings that reference a changed color.
 *  3. Regenerates src/Stylesheets/_tokens.scss (also regenerated
 *     automatically by the npm pre-build step on every start and build).
 *
 * No component files are touched: since the v0004 refactor, components
 * reference tokens through CSS custom properties or imports, so editing
 * tokens.json (which this script does) is the entire palette change.
 *
 * The operation is symmetric: applying palette A and then palette B is the
 * same as applying B directly, and the current state can always be
 * recovered by applying the palette that matches it.
 */
var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var root = path.join(__dirname, '..');
var tokensPath = path.join(root, 'src', 'theme', 'tokens.json');
var palettesDir = path.join(root, 'palettes');
var srcDir = path.join(root, 'src');

function listPalettes() {
  return fs
    .readdirSync(palettesDir)
    .filter(function (f) {
      return f.slice(-5) === '.json';
    })
    .map(function (f) {
      return f.slice(0, -5);
    });
}

var name = process.argv[2];
if (!name) {
  process.stdout.write('Usage: node scripts/apply-palette.js <palette-name>\n');
  process.stdout.write('Available palettes: ' + listPalettes().join(', ') + '\n');
  process.exit(1);
}

var palettePath = path.join(palettesDir, name + '.json');
if (!fs.existsSync(palettePath)) {
  process.stdout.write('ERROR: palette not found: ' + palettePath + '\n');
  process.stdout.write('Available palettes: ' + listPalettes().join(', ') + '\n');
  process.exit(1);
}

var tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
var palette = JSON.parse(fs.readFileSync(palettePath, 'utf8'));

function isHex(v) {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
}

function hexToTriplet(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return r + ', ' + g + ', ' + b;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 1. Compute the change set.
var hexMap = {}; // lowercased old hex -> new hex
var tripletMap = {}; // regex source of old triplet -> new triplet
var changedKeys = [];

Object.keys(palette.color).forEach(function (key) {
  var from = tokens.color[key];
  var to = palette.color[key];
  if (from === undefined) {
    process.stdout.write(
      'WARNING: palette key not present in tokens.json, skipping: ' + key + '\n'
    );
    return;
  }
  if (from === to) {
    return;
  }
  changedKeys.push(key);
  if (isHex(from) && isHex(to)) {
    hexMap[from.toLowerCase()] = to.toUpperCase();
    var fromTrip = hexToTriplet(from);
    var toTrip = hexToTriplet(to);
    tripletMap[
      fromTrip.replace(/, /g, ',\\s*')
    ] = toTrip;
  }
});

if (changedKeys.length === 0) {
  process.stdout.write('Palette already applied; nothing to do.\n');
  process.exit(0);
}

function retargetString(text) {
  Object.keys(hexMap).forEach(function (oldHex) {
    var re = new RegExp(escapeRegExp(oldHex), 'gi');
    text = text.replace(re, hexMap[oldHex]);
  });
  Object.keys(tripletMap).forEach(function (src) {
    var re = new RegExp('\\b' + src + '\\b', 'g');
    text = text.replace(re, tripletMap[src]);
  });
  return text;
}

// 2. Write the new tokens.json: direct assignments for the palette keys,
//    then string retargeting across every remaining color and gradient
//    value (covers rgba hover strings and gradients referencing a changed
//    color).
Object.keys(palette.color).forEach(function (key) {
  if (tokens.color[key] !== undefined) {
    tokens.color[key] = palette.color[key];
  }
});
Object.keys(tokens.color).forEach(function (key) {
  // Only retarget keys the palette does not set directly; a directly
  // assigned value is already correct, and retargeting it can collide
  // when a hex (for example #FFFFFF) is both an old value of one key and
  // the new value of another.
  if (palette.color[key] !== undefined) {
    return;
  }
  if (typeof tokens.color[key] === 'string') {
    tokens.color[key] = retargetString(tokens.color[key]);
  }
});
Object.keys(tokens.gradient).forEach(function (key) {
  tokens.gradient[key] = retargetString(tokens.gradient[key]);
});
// Explicit gradient overrides from the palette file take precedence over
// the string retargeting above.
if (palette.gradient) {
  Object.keys(palette.gradient).forEach(function (key) {
    if (tokens.gradient[key] !== undefined) {
      tokens.gradient[key] = palette.gradient[key];
    }
  });
}
fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2) + '\n');

// 3. Regenerate the SCSS partial from the updated tokens.
execSync('node ' + path.join(__dirname, 'generate-scss-tokens.js'), {
  stdio: 'inherit',
});

process.stdout.write(
  'Applied palette "' + name + '": ' + changedKeys.length + ' token(s) changed.\n'
);
process.stdout.write('Rebuild the application to see the change.\n');
