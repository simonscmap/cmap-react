/**
 * Design tokens (JS layer).
 *
 * The raw values live in ./tokens.json, which is the single source of truth
 * for the design system. This module re-exports those values with convenient
 * names for use in components, styles, and the Material-UI theme.
 *
 * Rules of use:
 *  - Do not hardcode hex colors in components; import from this module or
 *    from the theme.
 *  - The legacy modules `src/enums/colors.js` and `src/Components/Home/theme.js`
 *    re-export values from here for backward compatibility. New code should
 *    import from `src/theme` directly.
 *
 * See DESIGN_SYSTEM.md for the full description of the system.
 */
import tokens from './tokens.json';

export const color = tokens.color;

function hexTriplet(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].join(', ');
}

// rgb triplet strings ("R, G, B") for every hex color token, for consumers
// that need to build rgba() values with their own alpha (for example Plotly
// trace colors, which cannot resolve CSS custom properties).
export const rgb = Object.keys(tokens.color).reduce(function (acc, key) {
  var v = tokens.color[key];
  if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) {
    acc[key] = hexTriplet(v);
  }
  return acc;
}, {});

// Numeric [r, g, b] arrays for consumers that take color arrays rather than
// CSS strings (for example ArcGIS/esri symbol definitions).
export const rgbArray = Object.keys(rgb).reduce(function (acc, key) {
  acc[key] = rgb[key].split(', ').map(Number);
  return acc;
}, {});
export const gradient = tokens.gradient;
export const font = tokens.font;
export const radius = tokens.radius;
export const spacingUnit = tokens.spacingUnit;
export const elevationShadow = tokens.elevationShadow;

export default tokens;
