/**
 * CMAP Design System Tokens
 *
 * This file contains the extracted visual fingerprint from the CMAP application
 * and provides a comprehensive design system with tokens for colors, typography,
 * spacing, layout, and other visual elements.
 *
 * This design system is independent of Material-UI and can be used to gradually
 * replace it while maintaining the application's unique visual identity.
 */

/* ============================================================================
 * COLOR PALETTE
 * ============================================================================ */

/**
 * Core brand colors - the visual fingerprint of CMAP
 */
export const colors = {
  // Primary Colors
  primary: {
    main: '#9dd162',        // rgb(157, 209, 98) - Signature lime green
    light: '#b4df7e',       // Lighter variation
    dark: '#619526',        // Darker variation
    contrastText: '#000000',
  },

  secondary: {
    main: '#22A3B9',        // Teal
    light: '#4eb8cc',
    dark: '#187380',
    contrastText: '#ffffff',
  },

  // Extended brand color families
  green: {
    lime: '#A1F640',        // Bright lime (home page primary)
    olive: '#96CE57',
    basil: '#638E32',
    dark: '#3B5B17',
    legacy: '#9dd162',      // Legacy primary green
    hover: 'rgba(97, 149, 38, 0.4)',
  },

  blue: {
    teal: '#69FFF2',        // Bright cyan
    royal: '#173993',
    slate: '#274870',
    dark: '#07274D',
    navy: '#1F4A63',
    solidPaper: '#184562',
    popover: '#1B4156',
    hover: 'rgba(105, 255, 242, 0.4)',
  },

  purple: {
    light: '#9253A8',
    dark: '#76248E',
    bright: '#E089FF',
  },

  // Semantic colors
  error: {
    main: '#f44336',        // Material red
    light: '#ff9800',       // Orange warning
    yellow: '#ffe336',      // Legacy error yellow
    contrastText: '#ffffff',
  },

  success: {
    main: '#4caf50',
    light: '#8bc34a',
    contrastText: '#ffffff',
  },

  warning: {
    main: '#ff9800',
    light: '#ffc107',
    contrastText: '#000000',
  },

  // Background colors
  background: {
    default: '#424242',     // Main background gray
    paper: '#424242',
    dark: '#282c34',
    darker: '#000000',
    slate: '#274870',
    gradient: 'linear-gradient(to bottom right, #1c4b6b, rgb(48, 120, 158), #265777, rgb(51, 119, 155))',
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#9dd162',   // Uses primary green
    disabled: '#9e9e9e',
    muted: 'rgba(255, 255, 255, 0.38)',
    accent: '#69FFF2',
  },

  // Utility colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.15)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.4)',
    heavy: 'rgba(0, 0, 0, 0.85)',
  },

  // Border colors
  border: {
    primary: '#9dd162',
    secondary: '#22A3B9',
    dark: '#242424',
    darker: '#143445',
    black: '#000000',
  },

  // Gradients
  gradient: {
    royal: 'linear-gradient(103.17deg, #173993 16.08%, #07274D 87.84%)',
    slate: 'linear-gradient(164.32deg, #274870 18.14%, #07274D 79.18%)',
    slate2: 'linear-gradient(103.17deg, #213d5e 18.14%, #07274D 79.18%)',
    deeps: 'linear-gradient(0deg, #03172F 54.92%, #041d3d 177.03%)',
    newsTitle: 'linear-gradient(293.11deg, #76248E 10.23%, #9253A8 92.6%)',
    newsBlock: 'linear-gradient(293.11deg, #4D0E64 10.23%, #723B85 92.6%)',
    newsBanner: 'linear-gradient(269.89deg, #600082 0%, #79139D 100%)',
  },

  // Status indicators (for collections, data validation, etc.)
  status: {
    warning: 'rgba(255, 193, 7, 0.6)',
    error: 'rgba(211, 47, 47, 0.6)',
    neutral: 'rgba(128, 128, 128, 0.6)',
    special: 'rgba(156, 39, 176, 0.8)',
    active: '#8bc34a',
  },

  // Badge colors
  badge: {
    success: {
      background: '#c8e6c9',
      text: '#2e7d32',
    },
    error: {
      background: '#ffcdd2',
      text: '#c62828',
    },
  },

  // AG Grid specific colors
  grid: {
    background: '#184562',
    header: {
      background: '#184562',
      foreground: '#9dd162',
    },
    border: '#000000',
    chip: '#234d6b',          // lighten(#184562, 10%)
    hover: '#4d6b00',         // darken(#9dd162, 35%)
    panel: '#133d52',         // darken(#184562, 5%)
    rowStub: '#22a3b9',
  },
};


/* ============================================================================
 * TYPOGRAPHY
 * ============================================================================ */

/**
 * Font families used throughout the application
 */
export const fonts = {
  primary: '"Lato", sans-serif',
  heading: '"Montserrat", sans-serif',
  monospace: '"Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace',
};

/**
 * Font weight scale
 */
export const fontWeights = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

/**
 * Font size scale with pixel and rem values
 * Based on 16px root font size
 */
export const fontSizes = {
  xs: { px: '11px', rem: '0.6875rem' },    // Extra small UI elements
  sm: { px: '12px', rem: '0.75rem' },      // Small text
  base: { px: '14px', rem: '0.875rem' },   // Base UI text
  md: { px: '16px', rem: '1rem' },         // Body text default
  lg: { px: '18px', rem: '1.125rem' },     // Large body text
  xl: { px: '20px', rem: '1.25rem' },      // Extra large body
  '2xl': { px: '22px', rem: '1.375rem' },  // Section headers
  '3xl': { px: '24px', rem: '1.5rem' },    // Subtitles
  '4xl': { px: '25px', rem: '1.5625rem' }, // Large subtitles
  '5xl': { px: '30px', rem: '1.875rem' },  // Extra large headings
  '6xl': { px: '36px', rem: '2.25rem' },   // Main headlines
};

/**
 * Line height scale
 */
export const lineHeights = {
  none: 1.0,
  tight: 1.2,
  snug: 1.3,
  normal: 1.4,
  relaxed: 1.5,
  loose: 1.6,
  extraLoose: 1.9,
};

/**
 * Letter spacing scale
 */
export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.03em',
  wider: '0.05em',
  widest: '0.1em',
};

/**
 * Typography variants matching common use cases
 */
export const typography = {
  // Headings
  h1: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['6xl'].rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase',
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.lg.rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase',
  },
  h3: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['2xl'].rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase',
  },
  h4: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['2xl'].rem,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.wide,
  },
  h5: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['3xl'].rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  h6: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.lg.rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase',
  },

  // Body text
  bodyDefault: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xl.rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.snug,
  },
  bodyLarge: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.lg.rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  bodySmall: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.md.rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },

  // Subtitles
  subtitleXL: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['5xl'].rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.snug,
  },
  subtitleLarge: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['4xl'].rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.snug,
  },

  // UI elements
  button: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.base.rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },
  buttonSmall: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.xs.rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },
  buttonMedium: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.sm.rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },
  buttonLarge: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.base.rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },
  buttonXLarge: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.md.rem,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },
  label: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.base.rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  helper: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm.rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  caption: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs.rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  code: {
    fontFamily: fonts.monospace,
    fontSize: fontSizes.md.rem,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
  },
};


/* ============================================================================
 * SPACING
 * ============================================================================ */

/**
 * Spacing scale based on 8px base unit
 * This follows Material-UI's default spacing but is independent
 */
const BASE_UNIT = 8;

export const spacing = {
  0: '0px',
  0.5: `${BASE_UNIT * 0.5}px`,    // 4px
  0.8: `${BASE_UNIT * 0.8}px`,    // 6.4px
  1: `${BASE_UNIT}px`,             // 8px
  1.5: `${BASE_UNIT * 1.5}px`,    // 12px
  2: `${BASE_UNIT * 2}px`,         // 16px
  2.5: `${BASE_UNIT * 2.5}px`,    // 20px
  3: `${BASE_UNIT * 3}px`,         // 24px
  4: `${BASE_UNIT * 4}px`,         // 32px
  5: `${BASE_UNIT * 5}px`,         // 40px
  6: `${BASE_UNIT * 6}px`,         // 48px
  7: `${BASE_UNIT * 7}px`,         // 56px
  8: `${BASE_UNIT * 8}px`,         // 64px
  9: `${BASE_UNIT * 9}px`,         // 72px
  10: `${BASE_UNIT * 10}px`,       // 80px
  12: `${BASE_UNIT * 12}px`,       // 96px
  15: `${BASE_UNIT * 15}px`,       // 120px
  16: `${BASE_UNIT * 16}px`,       // 128px
};

/**
 * Semantic spacing values for common use cases
 */
export const spacingSemantic = {
  // Component spacing
  componentGap: spacing[2],         // 16px - Default gap between components
  sectionGap: spacing[4],           // 32px - Gap between major sections

  // Padding presets
  paddingXS: spacing[0.5],          // 4px
  paddingSM: spacing[1],            // 8px
  paddingMD: spacing[2],            // 16px
  paddingLG: spacing[3],            // 24px
  paddingXL: spacing[4],            // 32px

  // Margin presets
  marginXS: spacing[0.5],           // 4px
  marginSM: spacing[1],             // 8px
  marginMD: spacing[2],             // 16px
  marginLG: spacing[3],             // 24px
  marginXL: spacing[4],             // 32px

  // Layout spacing
  navbarHeight: spacing[15],        // 120px
  navbarOffset: spacing[12],        // 100px (legacy)

  // Form spacing
  formFieldGap: spacing[1],         // 8px
  formSectionGap: spacing[3],       // 24px
};


/* ============================================================================
 * LAYOUT & PROPORTIONS
 * ============================================================================ */

/**
 * Breakpoint system for responsive design
 * Note: Mobile viewport is intentionally not supported
 */
export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 1020,
    lg: 1280,
    xl: 1920,
  },
  // Utility functions for media queries
  up: (breakpoint) => `@media (min-width: ${breakpoints.values[breakpoint]}px)`,
  down: (breakpoint) => `@media (max-width: ${breakpoints.values[breakpoint] - 1}px)`,
  between: (min, max) => `@media (min-width: ${breakpoints.values[min]}px) and (max-width: ${breakpoints.values[max] - 1}px)`,
};

/**
 * Home page breakpoints (slightly different from main app)
 */
export const homeBreakpoints = {
  values: {
    xs: 0,
    sm: 900,
    md: 1020,
    lg: 1280,
    xl: 1920,
  },
  up: (breakpoint) => `@media (min-width: ${homeBreakpoints.values[breakpoint]}px)`,
  down: (breakpoint) => `@media (max-width: ${homeBreakpoints.values[breakpoint] - 1}px)`,
};

/**
 * Container max-widths for different breakpoints
 */
export const containers = {
  sm: '600px',
  md: '960px',
  lg: '1200px',
  xl: '1440px',
  full: '100%',
};

/**
 * Grid system
 */
export const grid = {
  columns: 12,
  gutter: spacing[2],      // 16px
  margin: spacing[2],      // 16px
};

/**
 * Common layout proportions
 */
export const layout = {
  // Sidebar widths
  sidebarNarrow: '240px',
  sidebarWide: '320px',

  // Panel widths
  panelSmall: '400px',
  panelMedium: '600px',
  panelLarge: '800px',

  // Modal widths
  modalSmall: '400px',
  modalMedium: '600px',
  modalLarge: '900px',
  modalXLarge: '1200px',

  // Heights
  navbarHeight: '64px',
  footerHeight: '200px',

  // Content widths
  contentNarrow: '640px',
  contentMedium: '768px',
  contentWide: '1024px',
};


/* ============================================================================
 * ELEVATION & SHADOWS
 * ============================================================================ */

/**
 * Box shadow system for depth and elevation
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Application-specific shadows
  navigation: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  helpHint: '0 3px 20px 20px rgba(0, 0, 0, 0.2)',
  inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Glow effects
  glowCyan: '0 0 5px rgba(105, 255, 242, 0.2)',
  glowGreen: '0 0 8px rgba(157, 209, 98, 0.3)',
};


/* ============================================================================
 * BORDERS & RADIUS
 * ============================================================================ */

/**
 * Border radius scale
 */
export const radii = {
  none: '0',
  xs: '2px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',

  // Component-specific radii
  button: '4px',
  input: '4px',
  card: '6px',
  modal: '8px',
  pill: '9999px',
};

/**
 * Border width scale
 */
export const borderWidths = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
};


/* ============================================================================
 * Z-INDEX LAYERS
 * ============================================================================ */

/**
 * Z-index system for proper layering
 * Centralized management ensures no overlapping conflicts
 */
export const zIndex = {
  // Base layers
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,

  // Control layers
  controlPrimary: 2000,
  controlSecondary: 3000,
  controlTertiary: 4000,

  // Navigation & UI
  docsSidebar: 4500,
  navbar: 5000,

  // Modals & Overlays
  nonHelpDialog: 6000,
  helpDialog: 7000,
  navbarDropdown: 8000,
  tooltip: 9000,
  slideOutPanel: 9500,
  muiDialog: 9700,
  modalLayer1Popper: 9750,
  secondaryModal: 9800,
  modalLayer2Popper: 9850,
  loginDialog: 9900,
  confirmationDialog: 9900,
  modalLayer3Popper: 9950,
  loadingOverlay: 9999,
  snackbar: 10000,
};


/* ============================================================================
 * TRANSITIONS & ANIMATIONS
 * ============================================================================ */

/**
 * Transition duration scale
 */
export const durations = {
  instant: '0ms',
  fast: '150ms',
  base: '200ms',
  moderate: '300ms',
  slow: '400ms',
  slower: '600ms',
};

/**
 * Easing functions
 */
export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
};

/**
 * Common transition presets
 */
export const transitions = {
  default: `all ${durations.base} ${easings.easeInOut}`,
  fast: `all ${durations.fast} ${easings.easeOut}`,
  color: `color ${durations.base} ${easings.easeInOut}, background-color ${durations.base} ${easings.easeInOut}`,
  transform: `transform ${durations.base} ${easings.easeOut}`,
  opacity: `opacity ${durations.base} ${easings.easeInOut}`,
};


/* ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================ */

/**
 * Convert px to rem
 * @param {number} px - Pixel value
 * @param {number} base - Base font size (default: 16)
 * @returns {string} - Rem value
 */
export const pxToRem = (px, base = 16) => `${px / base}rem`;

/**
 * Get spacing value
 * @param {number|number[]} multiplier - Spacing multiplier(s)
 * @returns {string} - Spacing value
 */
export const getSpacing = (...multipliers) => {
  if (multipliers.length === 1) {
    return spacing[multipliers[0]] || `${multipliers[0] * BASE_UNIT}px`;
  }
  return multipliers.map(m => spacing[m] || `${m * BASE_UNIT}px`).join(' ');
};

/**
 * Create a media query
 * @param {string} direction - 'up' or 'down'
 * @param {string} breakpoint - Breakpoint key
 * @returns {string} - Media query string
 */
export const mediaQuery = (direction, breakpoint) => {
  return breakpoints[direction](breakpoint);
};


/* ============================================================================
 * EXPORT DEFAULT
 * ============================================================================ */

/**
 * Complete design system export
 */
const designTokens = {
  colors,
  fonts,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacings,
  typography,
  spacing,
  spacingSemantic,
  breakpoints,
  homeBreakpoints,
  containers,
  grid,
  layout,
  shadows,
  radii,
  borderWidths,
  zIndex,
  durations,
  easings,
  transitions,
  pxToRem,
  getSpacing,
  mediaQuery,
};

export default designTokens;
