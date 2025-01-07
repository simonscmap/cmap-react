import colors from '../../enums/colors';
import z from '../../enums/zIndex';

const salmonAlert = 'rgb(209, 98, 101)';
const yellowAlert = 'rgb(255, 227, 54)'

const drawerWidth = 280;

const styles = (theme) => ({
  drawerPaper: {
    width: drawerWidth,
    height: 'auto',
    top: 120,
    left: '10px',
    padding: '7px',
    // borderRadius: '0 4px 4px 0',
    // boxShadow: '2px 2px  2px 2px #242424',
    // border: 'none',
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: '5px',
    overflow: 'visible',
    // backgroundColor: colors.backgroundGray,
    background: 'rgba(20,20,20,0.75)',
    backdropFilter: 'blur(2px)',
  },

  openPanelChevron: {
    position: 'fixed',
    left: '5px',
    top: '380px',
    zIndex: z.CONTROL_PRIMARY,
  },

  closePanelChevron: {
    position: 'fixed',
    left: drawerWidth + 23,
    top: '380px',
    zIndex: z.CONTROL_PRIMARY,
  },

  // variable search overlay container
  dataSearchMenuPaper: {
    position: 'fixed',
    top: 100,
    bottom: 0,
    left: 0,
    width: '98vw',
    height: 'auto',
    zIndex: z.CONTROL_PRIMARY,
    backgroundColor: 'rgba(0,0,0,.75)',
    backdropFilter: 'blur(5px)',
    overflowY: 'scroll',
  },
  alertBoxHandle: {
    position: 'absolute',
    top: '11px',
    left: '294px',
    '& svg': {
      color: yellowAlert,
    }
  },
  alertBox: {
    position: 'absolute',
    top: '12px',
    left: '340px',
    width: '500px',
    zIndex: z.CONTROL_PRIMARY,
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  formGridItem: {
    // border: '1px solid #313131',
    // borderBottom: 'none',
    // borderTop: 'none',
    // backgroundColor: colors.backgroundGray,
  },

  padLeft: {
    padding: '6px 0 2px 7px',
  },

  dateTimeInput: {
    padding: '6px 0 2px 7px',
    alignItems: 'start',
  },

  helperText: {
    color: 'yellow',
    fontSize: '12px',
  },

  varSearchButton: {
    fontWeight: 500,
  },

  controlPanelItem: {
    textTransform: 'none',
    textAlign: 'left',
    fontSize: '17px',
    fontWeight: 500,
    color: colors.primary,
    justifyContent: 'flex-start',
    height: '56px',
  },

  controlPanelItemLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
  },

  controlPanelItemStartIcon: {
    display: 'inline-block',
  },

  textField: {
    width: '100%',
    // prevent arrow controls from rendering on firefox
    '& input': {
      '-moz-appearance': 'textfield',
    },
    '& label.Mui-disabled': {
      color: theme.palette.primary.main
    },
    '& input.Mui-disabled': {
      color: '#aaa'
    }
  },

  drawHelpText: {
    position: 'fixed',
    top: 120,
    margin: '0 calc(50vw - 226px)',
    zIndex: z.CONTROL_PRIMARY,
    color: 'white',
    fontSize: '18px',
    backgroundColor: 'rgba(0, 0, 0, .6)',
    padding: '8px',
    backdropFilter: 'blur(5px)',
    borderRadius: '4px',
  },

  popoutButtonPaper: {
    position: 'absolute',
    top: '119px',
    left: '298px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '5px',
    background: 'rgba(20,20,20,0.75)',
    backdropFilter: 'blur(2px)',

    // borderRadius: '2px',
    // boxShadow: '2px 2px  2px 2px #242424',
    // backgroundColor: colors.backgroundGray,
  },

  popoutButtonIcon: {
    width: '24px',
    height: '24px',
  },

  popoutButtonBase: {
    padding: '9px',
    '&:disabled': {
      color: '#ccc'
    }
  },
  lockButtonBase: {
    padding: '0 0 9px 9px',
    '&:disabled': {
      color: '#ccc'
    }

  },
});

export default styles;
