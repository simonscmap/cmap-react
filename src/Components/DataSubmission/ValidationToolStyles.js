const styles = (theme) => ({
  validationToolWrapper: {
    position: 'relative',
    '& > div': {
      // FullWidthContainer
      minHeight: 'calc(100vh - 120px)',
      paddingTop: '120px', // space from nav
    },
  },
  title: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '100',
  },
  button: {
    color: 'white',
    textTransform: 'none',
    display: 'block',
    maxWidth: '100px',
    margin: '12px auto 0px auto',
  },

  needHelp: {
    color: 'white',
    margin: '12px 0 0 12px',
    letterSpacing: 'normal',
  },

  addBorder: {
    border: `1px dashed ${theme.palette.primary.main}`,
  },

  chooseNewFileLabel: {
    display: 'inline',
    position: 'absolute',
    marginTop: '10px',
    marginLeft: '14px',
    fontSize: '11px',
    borderRadius: '2px',
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,.2)',
    },
  },

  linkLabel: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,.2)',
    },
  },

  tabPaper: {
    maxWidth: '80vw',
    height: 'calc(100vh - 320px)',
    minHeight: '300px',
    margin: '0 auto 24px auto',
  },

  currentlyViewingTypography: {
    marginLeft: '4px',
  },
});

export default styles;
