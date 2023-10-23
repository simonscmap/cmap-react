import colors from '../../enums/colors';
const esriFontColor = 'white';
const esriFonts =
  '"Avenir Next W00","Helvetica Neue",Helvetica,Arial,sans-serif';


const styles = (theme) => ({
  outerDiv: {
    padding: '12px',
    maxWidth: '360px',
    backgroundColor: 'transparent',
    color: esriFontColor,
    borderRadius: '4px',
    boxShadow: '2px',
    backdropFilter: 'blur(2px)',
    transform: 'translateY(35px)',
    marginTop: '24px',
    position: 'fixed',
    left: 0,
    top: 140,
  },

  cruiseInfo: {
    color: esriFontColor,
    fontFamily: esriFonts,
    margin: '12px auto 0 auto',
  },

  cruiseInfoCell: {
    color: esriFontColor,
    fontFamily: esriFonts,
    borderStyle: 'none',
  },

  linkWrapper: {
    padding: '12px',
    fontSize: '14px',
  },

  searchMenuPaper: {
    position: 'fixed',
    top: 120,
    bottom: 60,
    left: 0,
    width: '98vw',
    height: 'auto',
    zIndex: 1500,
    backgroundColor: 'rgba(0,0,0,.6)',
    backdropFilter: 'blur(5px)',
  },

  closeIcon: {
    float: 'right',
    cursor: 'pointer',
    color: colors.primary,
    textTransform: 'none',
    fontSize: '15px',
  },

  inputRoot: {
    border: `1px solid ${colors.primary}`,
  },

  openSearchButtonPaper: {
    backgroundColor: colors.backgroundGray,
    boxShadow: '1px 1px 1px 1px #242424',
  },

  openSearchButton: {
    textTransform: 'none',
    color: colors.primary,
    fontSize: '15px',
    padding: '6px 42px',
  },

  resetButton: {
    textTransform: 'none',
    width: '160px',
    height: '37px',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    marginTop: '12px',
    whiteSpace: 'nowrap'
  },

  yearHeader: {
    backgroundColor: 'rgba(0, 0, 0, .7)',
    height: '36px',
    fontSize: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchOption: {
    '&:hover': {
      backgroundColor: colors.greenHover,
    },

    cursor: 'pointer',
    height: '38px',
    boxShadow: '0px 1px 1px 1px #242424',
    backgroundColor: 'rgba(0,0,0,.4)',
  },

  memberCount: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  variablesWrapper: {
    backgroundColor: 'rgba(0,0,0,.2)',
    paddingTop: '10px',
    paddingBottom: '10px'
  },

  variableItem: {
    height: '38px',
    textAlign: 'left',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.greenHover,
    },
  },

  cruiseName: {
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  heading: {
    textAlign: 'left',
    padding: '8px 6px',
    color: colors.primary,
    fontSize: '16px',
    marginTop: '5px',
    backgroundColor: 'rgba(0,0,0,.4)',
  },

  cruiseYearHeader: {
    textAlign: 'left',
    fontSize: '9px',
    color: colors.primary,
  },

  selectedCruises: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '1em 0 1em 2em',
    margin: '2em 0 0 0',
    border: '1px solid #242424', // mimics "box-shadow" style of selctor input fields
    '& > div': {
      textAlign: 'left',
    },
    '& h6': {
      marginBottom: '1em',
    },
    '& a': {
      color: 'white',
    }
  },

  renderButton: {
    textTransform: 'none',
    height: '37px',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    marginTop: '12px',
    whiteSpace: 'nowrap',
    padding: '0, 1em',
    '&:disabled': {
      color: colors.secondary,
      borderColor: colors.secondary,
    }
  },

  dataPoints: {
    marginTop: '1em'
  }


});

export default styles;
