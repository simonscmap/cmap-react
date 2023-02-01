import colors from '../../enums/colors';
import z from '../../enums/zIndex';


const drawerWidth = 280;

const styles = () => ({
 pageTitleWrapper: {
    position: 'absolute',
    top: '105px',
    left: '25px',
    textAlign: 'left',
  },
  pageTitle: {
    fontSize: '32px',
    color: 'white',
    fontWeight: '100',
  },
  drawerPaper: {
    width: drawerWidth,
    height: 'auto',
    top: 180,
    borderRadius: '0 4px 4px 0',
    boxShadow: '2px 2px  2px 2px #242424',
    border: 'none',
    overflow: 'visible',
    backgroundColor: colors.backgroundGray,
  },

  openPanelChevron: {
    position: 'fixed',
    left: '5px',
    top: '380px',
    zIndex: z.CONTROL_PRIMARY,
  },

  closePanelChevron: {
    position: 'fixed',
    left: drawerWidth + 5,
    top: '380px',
    zIndex: z.CONTROL_PRIMARY,
  },

  dataSearchMenuPaper: {
    position: 'fixed',
    top: 120,
    bottom: 0,
    left: 0,
    width: '98vw',
    height: 'auto',
    zIndex: z.CONTROL_PRIMARY,
    backgroundColor: 'rgba(0,0,0,.6)',
    backdropFilter: 'blur(5px)',
    overflowY: 'scroll',
  },

  formGridItem: {
    border: '1px solid #313131',
    borderBottom: 'none',
    borderTop: 'none',
    backgroundColor: colors.backgroundGray,
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

  controlPanelItem: {
    textTransform: 'none',
    textAlign: 'left',
    fontSize: '17px',
    fontWeight: 200,
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
    display: 'flex',
    borderRadius: '2px',
    boxShadow: '2px 2px  2px 2px #242424',
    backgroundColor: colors.backgroundGray,
  },

  popoutButtonIcon: {
    width: '24px',
    height: '24px',
  },

  popoutButtonBase: {
    padding: '9px',
  },
});

export default styles;
