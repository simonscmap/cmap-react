const styles = (theme) => ({
  wrapperDiv: {
    boxSizing: 'border-box',
    flexGrow: '3',
  },
  resultsWrapper: {
    padding: '16px 0 16px 20px',
    margin: '-54px 0 24px 0',
    [theme.breakpoints.down('md')]: {
      padding: '0',
      margin: '26px 0 0 0',
    },
    backgroundColor: 'transparent',
    // remove the margin from the first result to make it
    // align with the top of the FixedSizeList and its scroll bar
    '& div.MuiPaper-root:first-child': {
      marginTop: 0,
    },
  },
  downloadWrapper: {
    fontSize: '1rem',
    color: 'white',
    cursor: 'pointer',    borderRadius: '6px',
    padding: '1px 8px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  downloadIcon: {
    marginRight: '7px',
    marginBottom: '-3px',
    fontSize: '1.2rem',
  },
  helpButton: {
    padding: '0 2px',
    marginTop: '-9.5px',
    color: 'white',
    fontSize: '1.2rem',
  },
  helpIcon: {
    color: 'white',
    fontSize: '1.2rem',
  },
  infoShelf: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '13px',
  },
  fixedSizeList: {
    // padding allows beacons to render without being clipped
    padding: '10px 0 0 15px',
    margin: '0 0 0 -15px',
    width: '100%',
    overflow: 'visible',
    // transparent scrollbar bg prevents box shadow of results from
    // being occluded
    scrollbarColor: '#9dd162 transparent',
  },
  fixedSizeListScrolled: {
    // make it look like the results are scrolling under a shadow
    background: `
        linear-gradient(transparent 30%, hsla(0,0%,100%, 0)),
        linear-gradient(hsla(0,0%,100%,0) 10px, white 70%) bottom,
        radial-gradient(at top, rgba(0,0,0,0.2), transparent 70%),
        radial-gradient(at bottom, rgba(0,0,0,0.2), transparent 70%) bottom`,

    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 20px, 100% 20px, 100% 10px, 100% 10px',
    backgroundAttachment: 'local, local, scroll, scroll',
    // boxShadow: '0px -10px 20px -15px #000000',
  },
  resultsCount: {
    textAlign: 'left',
    display: 'inline-block',
  },
});

export default styles;
