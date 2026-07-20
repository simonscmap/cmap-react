/**
 * Injects the design tokens as CSS custom properties on the document root.
 *
 * This makes every token available to plain CSS and SCSS at runtime as
 * `var(--cmap-<token-name>)`, so stylesheets can follow the token system
 * without a build step. Imported once from src/index.js, before the
 * application mounts.
 *
 * Token names are converted from camelCase to kebab-case, prefixed with
 * `--cmap-`. Examples:
 *   color.surface        -> --cmap-surface
 *   color.textSecondary  -> --cmap-text-secondary
 *   gradient.deeps       -> --cmap-gradient-deeps
 *   radius.md            -> --cmap-radius-md
 */
import tokens from './tokens.json';

function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function inject() {
  if (typeof document === 'undefined' || !document.documentElement) {
    return;
  }
  var root = document.documentElement.style;

  Object.keys(tokens.color).forEach(function (key) {
    var v = tokens.color[key];
    root.setProperty('--cmap-' + kebab(key), v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      root.setProperty(
        '--cmap-' + kebab(key) + '-rgb',
        [
          parseInt(v.slice(1, 3), 16),
          parseInt(v.slice(3, 5), 16),
          parseInt(v.slice(5, 7), 16),
        ].join(', ')
      );
    }
  });
  Object.keys(tokens.gradient).forEach(function (key) {
    root.setProperty('--cmap-gradient-' + kebab(key), tokens.gradient[key]);
  });
  Object.keys(tokens.radius).forEach(function (key) {
    root.setProperty('--cmap-radius-' + kebab(key), tokens.radius[key]);
  });
  Object.keys(tokens.font).forEach(function (key) {
    root.setProperty('--cmap-font-' + kebab(key), tokens.font[key]);
  });
}

inject();

export default inject;
