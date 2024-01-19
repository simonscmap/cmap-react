const styles = (theme) => ({
  title: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '100',
  },
  input: {
    display: 'none',
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

  needHelpLink: {
    letterSpacing: 'normal',
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },

  fileSelectPaper: {
    margin: '30px 0',
    padding: '12px',
    whiteSpace: 'pre-wrap',
  },

  workbookAuditPaper: {
    margin: '30px 0',
    padding: '12px',
    minHeight: '110px',
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
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

  navigationButtons: {
    padding: '2em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '2em'
  },

  submitButton: {
    color: 'white',
    margin: '24px 0 12px 0',
    textTransform: 'none',
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

  ilb: {
    display: 'inline-block',
  },

  currentSectionSpan: {
    // margin: '4px 8px 0 8px',
    // width: '200px',
    // display: 'inline-block',
    textDecoration: 'underline',
  },

  divider: {
    margin: '8px 0',
  },

  workbookTab: {
    textTransform: 'none',
  },

  submittedTypography: {
    marginBottom: '12px',
  },
});

export default styles;
