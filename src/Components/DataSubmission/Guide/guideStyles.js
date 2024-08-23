import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles ((theme) => ({
  container: {
    margin: '0 auto',
    padding: '1em',
    maxWidth: '1860px',
    '& li': {
      margin: '.5em 0'
    },
    '& figure': {
      maxWidth: 'calc(100% - 32px)',
      margin: '1em auto'
    },

  },
  layout: {
    marginBottom: '50px',
    display: 'flex',
    flexDirection: 'row',
    gap: '1em',
    height: '800px',
    width: '100%',
  },
  nav: {
    minWidth: '325px',
    paddingRight: '5px',
    height: '100%',
    overflowY: 'scroll',
    overflowX: 'auto',
    flex: 0,
    boxSizing: 'border-box',
    paddingTop: '1em',
    scrollBehavior: 'smooth',
    transition: 'scrollTop .2s ease-out',
  },
  content: {
    height: '100%',
    flex: 1,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2em',
    '& svg': {
      color: theme.palette.secondary.main,
      margin: '0 .5em',
    }
  },
  title: {
    color: 'white',
    fontWeight: 100,
    fontSize: '32px',
    fontFamily: 'Lato',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    padding: '1em',
    boxSizing: 'border-box',
    '& p': {
      // fontSize: '1.5em'
    },
    '& .MuiTypography-body1': {
      fontSize: '1.2em'
    },

    '& .MuiListItemIcon-root':{
      color: 'white'
    }
  },
  contentTitle: {
    fontSize: '1.5em',
    flex: 0,
  },
  selectedContent: {
    overflow: 'scroll',
    padding: '0 20px 20px 0',
    flex: 1,
    maxWidth: '1467px',
  },
  fwdbckContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 0,
    paddingTop: '20px',
  },
  fwdbck: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 0,
    paddingTop: '5px',
    gap: '2em',
  },
  bck: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignContent: 'center',
    alignItems: 'center',
    gap: '1em',
    flex: 1,
    '& .MuiSvgIcon-root': {
      fontSize: '42px',
    }
  },
  fwd: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignItems: 'center',
    gap: '1em',
    flex: 1,
    '& .MuiSvgIcon-root': {
      fontSize: '42px',
    }
  }

}));

export default useStyles;

export const sectionStyles = makeStyles((theme) => ({
  header: {
    fontSize: '2em',
    margin: '0 0 0 0',
  },
  subHeader: {
    color: '#69FFF2',
    fontSize: '1.5em',
    margin: '1em 0 .5em 0',
  },
  accordionSubHeader: {
    color: '#69FFF2',
    fontSize: '1.2em',
    margin: '1em 0 .5em 0',
  },
  container: {
    position: 'relative',
    '& p a': {
      color: theme.palette.primary.main,
    },
    '& p a:visited': {
      color: theme.palette.primary.main,
    },
    '& em': {
      fontStyle: 'bold',
    },
    '& code': {
      fontStyle: 'bold',
      color: 'rgb(105, 255, 242)',
    },
    // make lists more compact
    '& .MuiListItem-gutters': {
      padding: 0,
      margin: 0,
    },
    // most paragraphs need vertical margin
    '& .MuiTypography-body1': {
      margin: '.5em 0'
    },
    // but not in lists
    '& .MuiListItemText-primary.MuiTypography-body1': {
      margin: '0'
    },

    // ACCORDIONS
    '& .MuiAccordion-root.MuiPaper-root': {
      backgroundColor: 'rgba(0,0,0, 0.2)',
      borderRadius: '6px',
    },
    '& .MuiAccordionSummary-content': {
      alignItems: 'center',
      fontSize: '1.2em',
      gap: '8px',
      '& svg': {
        fontSize: '24px',
        // paddingTop: '3px'
      }
    },
    '& .MuiAccordionDetails-root': {
      paddingLeft: '60px',
      paddingRight: '50px',
      overflow: 'hidden',
    }
  },
  divider: {
    '&.MuiDivider-root': {
      backgroundColor: '#47a3b369', // 'white',
      margin: '1em 0',
    }
  },
  icon: {
    fontSize: '30px',
  },
  inlineError: {
    textDecoration: 'underline',
    textDecorationColor: 'rgb(209, 98, 101)',
  },
  nonButton: {
    background: 'none',
    border: 'none',
    color: 'unset',
    padding: '0',
    margin: 'unset',
    cursor: 'crosshair',
    height: '24px',
  },

  focalToggleButton: {
    background: 'none',
    border: 'none',
    color: 'unset',
    padding: '0',
    margin: '0 2em',
    cursor: 'crosshair',
    '& svg': {
      fontSize: '24px'
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  standoutBox: {
    display: 'inline-block',
    borderRadius: '6px',
    boxSizing: 'border-box',
    border: '1px solid black',
    // margin: '2em 2em auto 2em',
    position: 'relative',
    boxShadow: `0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)`,
    '& img': {
      // width: '100%',
      borderRadius: '6px',
      display: 'block',
    },
    overflow: 'auto',
  },

  standoutBadge: {
    position: 'absolute',
    zIndex: 4,
    left: '51px',
    top: '16px',
    padding: '5px 20px',
    borderRadius: '15px',
    background: 'rgb(3, 25, 51)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '1px solid rgb(157, 209, 98)',
  },
  badge: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '15px',
    background: 'rgb(3, 25, 51)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    textIndent: 0,
  },
  badgeRequired: {
    display: 'inline-block',
    padding: '2px 20px',
    borderRadius: '15px',
    background: 'rgb(209, 98, 101)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    textIndent: 0,
  },
  badgeOptional: {
    display: 'inline-block',
    padding: '2px 20px',
    borderRadius: '15px',
    background: 'white',
    color: 'black',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'black',
    textIndent: 0,
  },

  scrollWrapper: {
    padding: '2em 2em 2em 35px',
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',

  },

  standoutBadgeContainer: {
    flex: 1,
    position: 'relative',
    '& > div': {
      margin: 0,
    },
    overflow: 'auto',
  },

  standoutBadgeContainerFullWidth: {
    position: 'relative',
    margin: '2em 2em 2em 35px',
    '& > div': {
      margin: 0,
    },
  },

  focusedAccordionSummary: {
    display: 'flex',
    flexDirection: 'row',
    gap: '.5em',
    alignItems: 'center',
    padding: '6px 8px'
  },

  focusPadding: {
    padding: '6px 8px'
  },


  metaContainer: {
    fontSize: '1em',
    // padding: '0 1em',
    // margin: '1em 0 2em 0',
    // borderLeft: '2px solid rgb(105, 255, 242)',
    // background: 'rgba(0,0,0,0.2)',
    // boxShadow: `0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)`,
  },



  glow: {
    animation: '$glow 1000ms ease-out infinite alternate',
    border: `1px solid rgba(157, 209, 98, 0.1)`,
    borderRadius: '5px',
    '& svg': {
      color: 'rgb(105, 255, 242)',
      padding: 0,
    }
  },

  '@keyframes glow': {
    '0%': {
      borderColor: '#393',
      boxShadow: '0 0 5px rgba(105, 255, 242, 0.2), inset 0 0 5px rgba(105, 255, 242, 0.1), 0 2px 0 #000'
    },
    '100%': {
      borderColor: '#6f6',
      boxShadow: '0 0 20px rgba(105, 255, 242, 0.6), inset 0 0 10px rgba(105, 255, 242, 0.4), 0 2px 0 #000'
    },
  },

  // svg arrow marker

  sourceArrow: {
    width: '100px',
    height: '100px',
  },
  pointerArrow: {
    stroke: '#8fbcbb',
    strokeWidth: '1.5px',
    fill: 'none'
  },
  arrowHead: {
    fill: '#8fbcbb'
  }

}));

// const blue = 'rgb(105, 255, 242)'
// const green = 'rgba(157, 209, 98)';
