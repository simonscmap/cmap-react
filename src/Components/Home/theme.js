import { createTheme } from '@material-ui/core/styles';

// see: https://v4.mui.com/customization/typography/#font-size
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

export const colors = {
  blue: {
    teal: '#69FFF2',
    royal: '#173993',
    slate: '#274870',
    dark: '#07274D',
  },
  green: {
    lime: '#A1F640',
    olive: '#96CE57',
    basil: '#638E32',
    dark: '#3B5B17',
  },
  purple: {
    light: '#9253A8',
    dark: '#76248E',
    bright: '#E089FF',
  },
  gradient: {
    royal: 'linear-gradient(103.17deg, #173993 16.08%, #07274D 87.84%)',
    slate: 'linear-gradient(164.32deg, #274870 18.14%, #07274D 79.18%)',
    slate2: 'linear-gradient(103.17deg, #213d5e 18.14%, #07274D 79.18%)',
    deeps: 'linear-gradient(0deg, #03172F 54.92%, #041d3d 177.03%)',
    newsTitle: 'linear-gradient(293.11deg, #76248E 10.23%, #9253A8 92.6%)',
    newsBlock: 'linear-gradient(293.11deg, #4D0E64 10.23%, #723B85 92.6%)',
    newsBanner: 'linear-gradient(269.89deg, #600082 0%, #79139D 100%)',
  },
};

export const homeTheme = createTheme({
  typography: {
    fontFamily: ['"Lato"', 'sans-serif'].join(','),
    h1: {
      // green page header
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontWeight: 500, // note: bumped this from 400 specified in the design to 500
      fontSize: pxToRem[36],
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: colors.green.lime,
    },
    h2: {
      // green section header (".section-heading" in design doc)
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontWeight: 500, // note: bumped this from 400 specified in the design to 500
      fontSize: pxToRem[18],
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: colors.green.lime,
    },
    h3: {
      // blue lower section header
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontWeight: 500, // note: bumped this from 400 specified in the design to 500
      fontSize: pxToRem[22], // changed from design's 18px
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: colors.blue.teal,
    },
    h4: {
      // title ("title" in design doc)
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontWeight: 700,
      fontSize: pxToRem[22],
      color: '#ffffff',
      letterSpacing: '0.03em',
    },
    h5: {
      // body medium
      // would be a subtitle 3 if mui allowed for one
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontWeight: 400,
      fontSize: pxToRem[24],
      '@media (max-width:1280px)': {
        fontSize: pxToRem[20],
      },
      color: '#ffffff',
      '& a': {
        color: '#ffffff',
        textDecoration: 'none',
        '&:hover': {
          color: colors.green.lime,
          textDecoration: 'none',
        },
      },
    },
    h6: {
      // grey title used in footer
      fontFamily: 'Montserrat',
      fontStyle: 'normal',
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '22px',
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      color: 'rgba(255, 255, 255, 0.38)',
    },
    subtitle1: {
      // extra large ("body-xl" from the design doc)
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontSize: pxToRem[30],
      color: '#ffffff',
      fontWeight: 400,
      '@media (max-width:1280px)': {
        fontSize: pxToRem[24],
      },
    },
    subtitle2: {
      // large ("body-lg" from the design doc)
      fontFamily: ['Montserrat', 'sans-serif'].join(','),
      fontSize: pxToRem[25],
      color: '#ffffff',
      fontWeight: 400,
      '@media (max-width:1280px)': {
        fontSize: pxToRem[24],
      },
    },
    body1: {
      // body default
      fontWeight: 'normal',
      lineHeight: '1.3em',
      fontSize: pxToRem[20],
      color: '#ffffff',
      '@media (max-width:1280px)': { // "lg" breakpoint
        fontSize: pxToRem[18],
      },
    },
    body2: {
      // body-sm
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: pxToRem[16],
      lineHeight: '16px',
      color: 'white',
    },
    button: {},
    caption: {},
    overline: {},
  },
  palette: {
    primary: {
      main: colors.green.lime,
    },
    secondary: {
      main: colors.blue.teal,
    },
    // error: {},
    // warning: {},
    // info: {},
    // success: {},
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 900,
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

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  overrides: {
    // PAPER
    MuiPaper: {
      root: {
        backgroundColor: colors.blue.slate,
        borderRadius: '6px',
        color: 'white',
      },
    },
    // DIALOG
    MuiDialogContentText: {
      root: {
        color: 'white',
      },
    },
    // INPUT
    MuiOutlinedInput: {
      input: {
        padding: '12px 14px',
      },

      root: {
        color: 'white',
        border: `2px solid ${colors.blue.dar}`,
        // borderColor: colors.blue.dark,
        '&$hover': {
          border: `2px solid ${colors.blue.dark}`,
        },

        '&$focused': {
          borderColor: colors.green.lime,
        },
      },
    },
    // Step Input
    MuiStepLabel: {
      label: {
        color: 'white',
        '&$active': {
          color: 'white',
        },
        '&$completed': {
          color: 'white',
        },
      },
    },
    MuiStepIcon: {
      root: {
        color: colors.blue.dark,
      },
      text: {
        fill: 'white',
        '&$active': {
          fill: colors.blue.dark,
        },
      },
    },
    /* MuiInputBase: {
*   input: {
*     border: `2px solid ${colors.blue.royal}`,
*     background: colors.blue.dark,
*     '&$focus': {
*       border: `2px solid ${colors.blue.royal}`,
*     },
*   },
* }, */
    MuiInput: {
      root: {
        color: 'white',
        '&$error': {
          // color:
        },
      },

      underline: {
        '&:before': {
          borderColor: 'white',
          borderBottom: '1px solid white',
          '&::hover': {
            borderColor: 'white',
            borderBottom: '1px solid white',
          },
        },
        '&:hover': {
          borderColor: 'white',
          borderBottom: '1px solid white',
        },
      },
    },
    MuiFormLabel: {
      root: {
        color: 'white',
        '&$error': {
          // color: colors.blue.teal,
        },
      },
    },
    MuiFormHelperText: {
      root: {
        color: 'white',
        '&$error': {
          color: colors.blue.teal,
        },
      },
    },
    Mui: {
      root: {
        '&$error': {
          color: colors.purple.light,
          '&:after': {
            borderBottomColor: colors.purple.light,
          },
        },
      },
    },
    MuiButton: {
      contained: {
        '&$disabled': {
          color: 'rgba(255, 255, 255, 0.3)',
          border: `2px solid rgba(161, 247, 64, 0.3)`,
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: "1em",
        backgroundColor: 'rgba(0,0,0,0.85)'
      }
    }
  },
});
