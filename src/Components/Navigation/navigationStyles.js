import { pxToRem } from '../Home/theme';
import zIndex from '../../enums/zIndex';

const navigationStyles = () => ({
  // CONTAINERS

  navigationContainer: {
    // height: '82px',
    padding: '0',
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: zIndex.NAVBAR,
    '@media (max-width:900px)': {
      position: 'fixed',
      // height: '44px',
    },
  },
  widthConstraint: {
    // copied from feature grid inner container
    position: 'relative',
    maxWidth: '1380px',
    width: 'calc(100% - 50px)',
  },

  widthConstraintCollapsable: {
    width: '100%',
  },

  // CONTAINERS -> variants
  containLeft: {
    width: 'calc(100% - 50px)',
    padding: '0 25px',
    maxWidth: 'none',
    margin: '0 auto 0 0',
    '& #navigationInnerContainer': {
      maxWidth: 'none',
    },
    '& #menu-control': {
      right: '20px',
    },
    '& #mark': {
      left: '39px',
    },
  },
  containCenter: {
    margin: '0 auto',
  },

  navigationInnerContainer: {
    padding: '0 30px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    maxWidth: '1380px',
    transition: 'margin 0.2s ease-out, width 0.2s ease-out',
    '@media (max-width:1280px)': {
      flexDirection: 'column',
      padding: '0',
    },
  },
  innerContainerCollapsable: {
    transition: 'margin 0.2s ease-out, width 0.2s ease-out',
    // width: '100%',
    // margin: '0 auto 0 -30px',
    background: '#274870',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  navigationGroupFirst: {
    order: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '110px',
    marginLeft: '104px',
    '& a': {
      marginTop: '3px', // this top margin corrects for the flex center
      // not centering correctly; 2px fixes on -moz, 3px fixes it on webkit
      height: '30px',
      color: 'white',
      fontFamily: 'Lato, sans-serif',
      fontStyle: 'normal',
      fontWeight: 700,
      lineHeight: '27px',
      padding: '3px 14px',
      borderRadius: '30px',
      textDecoration: 'none',
    },
    '& a:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      textDecoration: 'none',
    },
    '@media (max-width:1280px)': {
      order: 2, // re-order first and second groups
      // such that the second group stacks on top
      flexDirection: 'row',
      marginTop: 0,
      marginLeft: 0,
      height: '50px',
      justifyContent: 'flex-end',
    },
    '@media (max-width:900px)': {
      order: 1,
      marginLeft: '0px',
      marginTop: '70px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      height: 'auto',
      '& a': {
        display: 'block',
        // width: 'calc(100% - 38px)',
        textAlign: 'left',
      },
    },
  },
  navigationGroupSecond: {
    order: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '110px',
    '& a': {
      height: '30px',
      color: 'white',
      fontFamily: 'Lato, sans-serif',
      fontStyle: 'normal',
      fontWeight: 700,
      lineHeight: '27px',
      padding: '3px 14px',
      borderRadius: '30px',
      textDecoration: 'none',
    },
    '& a:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      textDecoration: 'none',
    },
    '@media (max-width:1280px)': {
      order: 1,
      height: '50px',
      '& a': {
        fontSize: pxToRem[14],
      },
      '& span': {
        fontSize: pxToRem[14],
      },
    },
    '@media (max-width:900px)': {
      order: 3,
      marginLeft: '0px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      height: 'auto',
      paddingBottom: '40px',
      '& a': {
        display: 'block',
        // width: 'calc(100% - 38px)',
        textAlign: 'left',
      },
      '& #nav-help-toggle-button': {
        width: '100%',
      },
    },
  },

  // LOGO

  cmapMark: {
    zIndex: 100,
    position: 'absolute',
    left: '14px',
    top: '14px',
    width: '82px',
    height: '82px',
    backgroundImage: "url('/images/home/cmap-logo-mark.svg')",
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    '@media (max-width: 1320px)': {
      // left: '29px',
    },
    '@media (max-width:910px)': {
      width: '44px',
      height: '44px',
    },
  },

  // SCRIM

  scrim: {
    zIndex: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transition: 'height .2s ease-out, background .2s ease-out',
  },
  scrimHide: {
    height: 0,
  },
  scrimShow: {
    height: '65px',
    background:
      'linear-gradient(0deg, rgba(23,57,147,0) 0%, rgba(7,39,77,0.1806615776081425) 33%, rgba(7,39,77,0.7247706422018348) 100%)',
  },

  // MENU CONTROL
  // The button that opens and closes the menu at smaller screen widths

  menuControl: {
    zIndex: '1',
    position: 'absolute',
    right: '14px',
    transition: 'top .2s ease-out',
    width: '20px',
    height: '20px',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    cursor: 'pointer',
  },
  hideMenuControl: {
    top: '-50px',
  },
  showMenuControl: {
    top: '27px',
  },
  menuClosed: {
    backgroundImage: "url('/images/home/menu-closed.svg')",
  },
  menuOpen: {
    backgroundImage: "url('/images/home/menu-open.svg')",
  },

  // EXPANDABLE MENU ITEMS

  expandableItemContainer: {
    // height: 'calc(30px + 6px)', // plus the child's 6px of vertical padding
    '@media (max-width:900px)': {
      width: '100%',
      textAlign: 'left',
    },
  },
  expandableItem: {
    // looks exactly like a link
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '30px',
    cursor: 'pointer',
    color: 'white',
    fontFamily: 'Lato, sans-serif',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '27px',
    padding: '3px 14px',
    borderRadius: '30px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      textDecoration: 'none',
    },
  },
  expandableChevronOpen: {
    lineHeight: '27px',
    height: '27px',
    marginLeft: '7px',
    transition: 'transform .2s ease-out',
    '& svg': {
      marginTop: '3px',
      height: '21px',
      width: '21px',
    },
  },
  expandableChevronClose: {
    lineHeight: '27px',
    height: '27px',
    marginLeft: '7px',
    transform: 'rotate(180deg)',
    transition: 'transform .2s ease-out',
    '& svg': {
      marginTop: '3px',
      height: '21px',
      width: '21px',
    },
  },
  effectContainer: {
    // allow children to have a transitionable height
    // without forcing the parent flex container to recenter its children
    position: 'absolute',
    zIndex: zIndex.NAVBAR_DROPDOWN,
    '@media (max-width:900px)': {
      position: 'relative',
    },
  },
  effectContainerRightEdge: {
    right: '40px',
    '@media (max-width:1280px)': {
      right: '10px',
    },
  },
  expandableItemChildren: {
    whiteSpace: 'noWrap',
    background: '#274870',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    padding: '29px',
    borderRadius: '6px',
    marginTop: '11px',
    '@media (max-width:900px)': {
      background: 'none',
      boxShadow: 'none',
      padding: '0',
      borderRadius: '0',
      marginTop: '0',
      marginLeft: '15px',
    },
    '& a': {
      height: '30px',
      color: 'white',
      fontFamily: 'Lato, sans-serif',
      fontStyle: 'normal',
      fontWeight: 700,
      lineHeight: '27px',
      padding: '3px 14px',
      borderRadius: '30px',
      textAlign: 'left',
      display: 'block',
    },
  },

  // HORIZONTAL RULE

  navGroupHR: {
    display: 'none',
    '@media (max-width:900px)': {
      order: 2,
      display: 'block',
      width: '100%',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0px -1px 1px rgba(0, 0, 0, 0.4)',
    },
  },
});

export default navigationStyles;
