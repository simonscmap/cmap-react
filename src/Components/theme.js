import { createTheme } from '@material-ui/core/styles';
import z from '../enums/zIndex';
import colors from '../enums/colors';
import { colors as newColors } from './Home/theme';

const siteTheme = createTheme({
  typography: {
    // useNextVariants: true,
    fontFamily: ['"Lato"', 'sans-serif'].join(','),
    body1: {},
  },

  palette: {
    primary: {
      contrastText: '#000000',
      // main: '#69FFF2'
      main: colors.primary,
      // main: newColors.blue.teal,
    },

    error: {
      main: colors.errorYellow,
    },

    secondary: {
      main: colors.secondary,
      // contrastText: '#fff700',
    },

    background: {
      default: colors.backgroundGray,
      paper: colors.backgroundGray,
    },
    text: {
      primary: '#ffffff',
      secondary: colors.primary, // this will affect check boxes, unfocused select labels, among others
      // secondary: newColors.green.lime,

      // secondary: '#69FFF2',
    },
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

  overrides: {
    MuiIconButton: {
      root: {
        color: colors.primary,
        borderRadius: '10%',
      },
    },
    MuiToggleButton: {
      root: {
        backgroundColor: '#9dd162',
        '&:hover': {
          backgroundColor: '#9dd162',
        },
        '&$selected': {
          backgroundColor: '#9dd162',
          '&:hover': {
            backgroundColor: '#9dd162',
          },
        },
      },
    },

    MuiPaper: {
      root: {
        backgroundColor: 'rgba(0,0,0,.3)',
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
        color: colors.primary,
      },
    },

    MuiMenuItem: {
      root: {
        '&:hover': {
          backgroundColor: colors.greenHover,
        },
      },
    },

    MuiTooltip: {
      tooltip: {
        backgroundColor: '#1F4A63',
        border: '1px solid #9dd162',
        fontSize: '.8em',
      },
      arrow: {
        color: '#9dd162',
      },
      popper: {
        zIndex: z.TOOLTIP,
      },
    },

    MuiPickersBasePicker: {
      container: {
        backgroundColor: colors.backgroundGray,
      },
    },

    MuiOutlinedInput: {
      input: {
        padding: '12px 14px',
      },

      root: {
        '&$focused': {
          borderColor: colors.primary,
        },
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
        borderBottomColor: 'rgba(0, 0, 0, 0.9)',
      },
    },

    MuiFormControl: {
      marginNormal: {
        marginTop: '8px',
      },
    },

    MuiDialogContentText: {
      root: {
        color: 'white',
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
        color: colors.primary,
      },
    },

    MuiStepper: {
      root: {
        background: 'none',
      },
    },

    MuiDialogTitle: {
      root: {
        color: colors.primary,
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

    MuiPopover: {
      paper: {
        backgroundColor: '#1B4156',
      },
    },
  },
});

export default siteTheme;
