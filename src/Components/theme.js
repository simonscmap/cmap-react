/**
 * Legacy site theme entry point.
 *
 * The application previously defined its main theme here. The theme now
 * lives in src/theme/index.js, built from the design tokens in
 * src/theme/tokens.json. This module re-exports it so existing imports
 * keep working. New code should import from src/theme directly.
 */
import theme from '../theme';

export default theme;
