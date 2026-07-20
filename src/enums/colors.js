/**
 * Legacy color enum, retargeted onto the design tokens.
 *
 * Historically this module defined its own palette. It now derives every
 * value from src/theme/tokens.json so that a palette change in the token
 * file propagates to every component that imports this enum. The legacy
 * key names are preserved for backward compatibility; canonical keys are
 * added for new code. New code should prefer importing from src/theme.
 *
 * Semantic notes on the legacy names:
 *  - `primary` and `secondary` now both resolve to the interactive teal.
 *  - `errorYellow` and `blockingError` historically rendered errors in
 *    yellow. Blocking errors now resolve to the semantic red; the yellow
 *    name maps to the amber warning color for non-blocking cautions.
 */
import { color } from '../theme/tokens';

const colors = {
  // Canonical keys (mirror src/theme/tokens.json)
  background: color.background,
  surface: color.surface,
  elevated: color.elevated,
  primary: color.primary,
  green: color.green,
  error: color.error,
  warning: color.warning,
  info: color.info,
  success: color.success,
  textMuted: color.textMuted,
  divider: color.divider,
  hover: color.hover,

  // Legacy keys (values retargeted to tokens)
  solidPaper: color.surface,
  backgroundGray: color.surface,
  secondary: color.primary,
  errorYellow: color.warning,
  greenHover: color.hover,
  blueHover: color.hoverStrong,
  teal: color.primary,
  slate: color.elevated,
  deeps: color.background,
  blockingError: color.error,
  nonBlockingInfo: color.info,
  lightGreen: color.green,
  darkBlue: color.surface,
  darkBlueLight: color.elevated,
  deepSlate: color.elevated,
};

export default Object.freeze(colors);
