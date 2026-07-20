/**
 * Legacy home theme entry point.
 *
 * The homepage redesign introduced this module with its own palette and
 * theme. Both are now derived from the design tokens in
 * src/theme/tokens.json, and the exported theme is the unified site theme,
 * so the 36 modules that import from here follow the token system
 * automatically. The exported shapes (`colors`, `pxToRem`, `homeTheme`)
 * are preserved for backward compatibility. New code should import from
 * src/theme directly.
 *
 * Palette notes:
 *  - `blue.teal` and `green.lime` now resolve to the calmer canonical
 *    accents. The former neon values remain available as tokens
 *    (color.neonTeal, color.neonLime) for data-visualization highlights.
 */
import theme, { pxToRem as sharedPxToRem } from '../../theme';
import { color, gradient } from '../../theme/tokens';

export const pxToRem = sharedPxToRem;

export const colors = {
  blue: {
    teal: color.primary,
    royal: color.royal,
    slate: color.elevated,
    dark: color.surfaceDark,
  },
  green: {
    lime: color.green,
    olive: color.green,
    basil: color.greenBasil,
    dark: color.greenDeep,
  },
  purple: {
    light: color.purple,
    dark: color.purpleDark,
    bright: color.purpleBright,
  },
  gradient: {
    royal: gradient.royal,
    slate: gradient.slate,
    slate2: gradient.slate2,
    deeps: gradient.deeps,
    newsTitle: gradient.newsTitle,
    newsBlock: gradient.newsBlock,
    newsBanner: gradient.newsBanner,
  },
};

export const homeTheme = theme;

export default homeTheme;
