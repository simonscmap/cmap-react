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
    left: 'calc(1vw - 1em)',
    width: '98vw',
    height: 'auto',
    zIndex: 1500,
    padding: '1em',
    backgroundColor: 'rgba(0,0,0,.6)',
    backdropFilter: 'blur(4px)',
  },
  closeIcon: {
    float: 'right',
    cursor: 'pointer',
    color: theme.palette.primary.main,
    textTransform: 'none',
    fontSize: '15px',
  },
  biggerIcon: {
    fontSize: '1.2em',
    cursor: 'pointer',
  },
  pointer: {
    cursor: 'pointer',
  },
  inputRoot: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
  openSearchButtonPaper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: '1px 1px 1px 1px #242424',
  },
  openSearchButton: {
    textTransform: 'none',
    color: theme.palette.primary.main,
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
  label: {
    color: theme.palette.primary.main,
  },
  searchOption: {
    '&:hover': {
      backgroundColor: colors.greenHover,
    },
    cursor: 'pointer',
    height: '38px',
  },
  groupedByValue: {
    width: 'calc(90%)',
    textAlign: 'left',
  },
  memberCount: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    paddingRight: '1em'
  },
  variablesWrapper: {
    paddingTop: '10px',
    paddingBottom: '10px'
  },
  variableItem: {
    height: '38px',
    textAlign: 'left',
    fontSize: '14px',
    '&:hover': {
      // background: colors.blueHover,
      backgroundColor: colors.greenHover,
    },
  },
  listControls: {
    textAlign: 'left',
    alignItems: 'center',
  },
  searchAndFilterContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '1em',
    flexWrap: 'wrap',
  },
  dropdowns: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: '1em',
    '& >div': {
      position: 'relative',
      width: '250px',
      height: '50px',
      '& >div': {
        position: 'absolute',
        zIndex: 2500,
      }
    }
  },
  controlRowLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '.5em',
    marginRight: '2em',
    whiteSpace: 'nowrap',
  },
  tabWrapper: {
    flexDirection: 'row',
    gap: '1em',
    '& >svg': {
      marginBottom: '0px !important',
      padding: 0,
    }
  },
  heading: {
    textAlign: 'left',
    padding: '8px 6px',
    color: theme.palette.primary.main,
    fontSize: '16px',
    marginTop: '5px',
    backgroundColor: 'rgba(0,0,0,.4)',
  },
  cruiseItemRowHeader: {
    textAlign: 'left',
    fontSize: '.9em',
    paddingRight: '1em',
    color: theme.palette.primary.main,
  },
  cruiseItemRow: {
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& a': {
      color: 'white',
      textDecoration: 'underline',
    }
  },
  selectedCruises: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '1em 1em 1em 2em',
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
  },
  paper: {
    background: '#000000',
  },
  groupBySelectMenu: {

  },
  groupBySelectItem: {
      textAlign: 'left'
  },
  formControl: {
    minWidth: '150px'
  },
  summaryHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: '1em',
  },
  clearAllControl: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    cursor: 'pointer',
    '& p:hover': {
      color: theme.palette.primary.main,
    }
  },
  filterChips: {
    '& > div': {
      margin: '0 .5em'
    }
  },
  searchAndFilterWrapper: {
    paddingRight: '2em',
  }
});

export default styles;
