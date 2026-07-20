/**
 * The unified Simons CMAP Material-UI theme.
 *
 * This theme replaces the two previous themes (`src/Components/theme.js` and
 * `src/Components/Home/theme.js`), which have become thin re-exports of this
 * module. Every palette, typography, and component-override decision here is
 * derived from the design tokens in src/theme/tokens.json.
 *
 * Design direction, in brief:
 *  - Deep-ocean navy surfaces (solid, not translucent, so cards look the same
 *    on every page).
 *  - One interactive accent: a calm teal (color.primary). The former neon
 *    accents (#69FFF2, #A1F640) remain available as tokens for data-viz
 *    highlights but are no longer used for text or controls.
 *  - Brand green (color.green) for section headings and success states.
 *  - Conventional semantic colors: red errors, amber warnings.
 *  - Montserrat for headings (mixed case), Lato for body text.
 */
import { createTheme } from '@material-ui/core/styles';
import z from '../enums/zIndex';
import { color, font, gradient, radius } from './tokens';

// Font-size helper retained from the previous home theme; several components
// import it. See https://v4.mui.com/customization/typography/#font-size
export const pxToRem = {
  12: '0.75rem',
  14: '0.875rem',
  16: '1rem',
  18: '1.125rem',
  20: '1.25rem',
  22: '1.375rem',
  24: '1.5rem',
  25: '1.5625rem',
  30: '1.875rem',
  36: '2.25rem',
};

const headingFont = [font.heading];
const bodyFont = [font.body];

const theme = createTheme({
  typography: {
    fontFamily: bodyFont.join(','),
    h1: {
      // page header
      fontFamily: headingFont.join(','),
      fontWeight: 600,
      fontSize: pxToRem[36],
      letterSpacing: '0.01em',
      color: color.textPrimary,
    },
    h2: {
      // section header
      fontFamily: headingFont.join(','),
      fontWeight: 600,
      fontSize: pxToRem[20],
      letterSpacing: '0.02em',
      color: color.green,
    },
    h3: {
      // lower section header
      fontFamily: headingFont.join(','),
      fontWeight: 600,
      fontSize: pxToRem[22],
      letterSpacing: '0.01em',
      color: color.primary,
    },
    h4: {
      // title
      fontFamily: headingFont.join(','),
      fontWeight: 700,
      fontSize: pxToRem[22],
      color: color.textPrimary,
      letterSpacing: '0.02em',
    },
    h5: {
      // body medium
      fontFamily: headingFont.join(','),
      fontWeight: 400,
      fontSize: pxToRem[24],
      '@media (max-width:1280px)': {
        fontSize: pxToRem[20],
      },
      color: color.textPrimary,
      '& a': {
        color: color.textPrimary,
        textDecoration: 'none',
        '&:hover': {
          color: color.primary,
          textDecoration: 'none',
        },
      },
    },
    h6: {
      // Readable content heading. The historical home theme styled h6 as a
      // faint uppercase footer label, but the rest of the application uses
      // h6 for real content (for example program descriptions), so the
      // unified theme keeps it legible; footer components can restyle
      // locally if a muted label is wanted.
      fontFamily: font.heading,
      fontStyle: 'normal',
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '1.5',
      letterSpacing: '0.02em',
      color: color.textPrimary,
    },
    subtitle1: {
      // extra large body
      fontFamily: headingFont.join(','),
      fontSize: pxToRem[30],
      color: color.textPrimary,
      fontWeight: 400,
      '@media (max-width:1280px)': {
        fontSize: pxToRem[24],
      },
    },
    subtitle2: {
      // large body
      fontFamily: headingFont.join(','),
      fontSize: pxToRem[25],
      color: color.textPrimary,
      fontWeight: 400,
      '@media (max-width:1280px)': {
        fontSize: pxToRem[24],
      },
    },
    body1: {
      fontFamily: bodyFont.join(','),
      fontWeight: 'normal',
      lineHeight: '1.4em',
      fontSize: pxToRem[20],
      color: color.textPrimary,
      '@media (max-width:1280px)': {
        fontSize: pxToRem[18],
      },
    },
    body2: {
      fontFamily: font.body,
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: pxToRem[16],
      lineHeight: '1.3em',
      color: color.textPrimary,
    },
    button: {
      fontFamily: bodyFont.join(','),
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {},
    overline: {
      fontFamily: headingFont.join(','),
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: color.textMuted,
    },
  },

  palette: {
    type: 'dark',
    primary: {
      main: color.primary,
      dark: color.primaryDark,
      contrastText: color.primaryContrast,
    },
    secondary: {
      main: color.green,
      contrastText: color.primaryContrast,
    },
    error: {
      main: color.error,
    },
    warning: {
      main: color.warning,
    },
    info: {
      main: color.info,
    },
    success: {
      main: color.success,
    },
    background: {
      default: color.background,
      paper: color.surface,
    },
    text: {
      primary: color.textPrimary,
      secondary: color.textSecondary,
      disabled: color.textDisabled,
    },
    divider: color.divider,
  },

  shape: {
    borderRadius: 6,
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1020,
      lg: 1280,
      xl: 1920,
    },
  },

  props: {
    MuiTypography: {
      variantMapping: {},
    },
  },

  overrides: {
    MuiPaper: {
      root: {
        // Solid surfaces: cards and dialogs no longer depend on what is
        // rendered behind them.
        backgroundColor: color.surface,
        borderRadius: radius.md,
        color: color.textPrimary,
      },
    },

    MuiPopover: {
      paper: {
        backgroundColor: color.elevated,
      },
    },

    MuiIconButton: {
      root: {
        color: color.primary,
        borderRadius: radius.md,
      },
    },

    MuiButton: {
      root: {
        borderRadius: radius.md,
      },
      contained: {
        '&$disabled': {
          color: color.textDisabled,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },

    MuiToggleButton: {
      root: {
        color: color.textSecondary,
        border: '1px solid ' + color.divider,
        '&:hover': {
          backgroundColor: color.hover,
        },
        '&$selected': {
          backgroundColor: color.hoverStrong,
          color: color.primary,
          border: '1px solid ' + color.primary,
          '&:hover': {
            backgroundColor: color.hoverStrong,
          },
        },
      },
    },

    MuiListItemIcon: {
      root: {
        minWidth: '40px',
      },
    },

    MuiFormHelperText: {
      filled: {
        paddingLeft: '1px',
        paddingRight: '1px',
        fontSize: '13px',
      },
      root: {
        color: color.textSecondary,
        '&$error': {
          color: color.error,
        },
      },
    },

    MuiListItem: {
      gutters: {
        paddingLeft: '6px',
        paddingRight: '10px',
      },
      root: {
        paddingTop: '4px',
        paddingBottom: '4px',
      },
    },

    MuiToolbar: {
      root: {
        backgroundColor: 'transparent',
        color: color.primary,
      },
    },

    MuiMenuItem: {
      root: {
        '&:hover': {
          backgroundColor: color.hover,
        },
      },
    },

    MuiTooltip: {
      tooltip: {
        backgroundColor: color.elevated,
        border: '1px solid ' + color.hoverStrong,
        fontSize: '.85em',
        color: color.textPrimary,
      },
      arrow: {
        color: color.elevated,
      },
      popper: {
        zIndex: z.TOOLTIP,
      },
    },

    MuiPickersBasePicker: {
      container: {
        backgroundColor: color.surface,
      },
    },

    MuiOutlinedInput: {
      input: {
        padding: '12px 14px',
      },
      root: {
        color: color.textPrimary,
        '&$focused': {
          borderColor: color.primary,
        },
      },
    },

    MuiInput: {
      root: {
        color: color.textPrimary,
      },
      underline: {
        '&:before': {
          borderBottom: '1px solid ' + color.textSecondary,
        },
        '&:hover:not($disabled):before': {
          borderBottom: '2px solid ' + color.primary,
        },
      },
    },

    MuiFormLabel: {
      root: {
        color: color.textSecondary,
        '&$focused': {
          color: color.primary,
        },
        '&$error': {
          color: color.error,
        },
      },
    },

    MuiStepLabel: {
      label: {
        color: color.textSecondary,
        '&$active': {
          color: color.textPrimary,
        },
        '&$completed': {
          color: color.textPrimary,
        },
      },
    },

    MuiStepIcon: {
      root: {
        color: color.surfaceDark,
      },
      text: {
        fill: color.textPrimary,
      },
    },

    MuiSnackbarContent: {
      message: {
        margin: 'auto',
      },
    },

    MuiButtonGroup: {
      groupedOutlined: {
        '&:not(:first-child)': {
          marginLeft: 0,
        },
      },
    },

    MuiTableCell: {
      root: {
        borderBottomColor: color.dividerFaint,
      },
    },

    MuiFormControl: {
      marginNormal: {
        marginTop: '8px',
      },
    },

    MuiDialogTitle: {
      root: {
        color: color.primary,
      },
    },

    MuiDialogContentText: {
      root: {
        color: color.textPrimary,
      },
    },

    MuiAccordion: {
      root: {
        '&$expanded': {
          margin: 0,
        },
      },
    },

    MuiAccordionDetails: {
      root: {
        display: 'block',
      },
    },

    MuiChip: {
      sizeSmall: {
        height: '18px',
      },
    },

    MuiSwitch: {
      root: {
        color: color.primary,
      },
    },

    MuiStepper: {
      root: {
        background: 'none',
      },
    },

    MuiFilledInput: {
      input: {
        paddingLeft: '6px',
      },
      adornedEnd: {
        paddingRight: '6px',
      },
      root: {
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&:disabled': {
          backgroundColor: 'transparent',
        },
      },
    },
  },
});

export { color, font, gradient, radius };
export default theme;
