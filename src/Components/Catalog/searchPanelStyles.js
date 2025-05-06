const styles = (theme) => ({
  pageTitleWrapper: {
    textAlign: 'left',
  },
  pageTitle: {
    color: 'white',
    fontWeight: 100,
    fontSize: '32px',
  },
  searchPaper: {
    padding: '14px 4px 14px 20px',
    // overflow must be visible to allow hints to expand outside
    // the boundary of the search container
    overflow: 'visible',
    flexGrow: '2',
    background: 'rgba(0,0,0,0.2)',
    boxShadow: 'none',
  },
  divWrapper: {
    flexGrow: '1',
    marginRight: '20px',
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: '1em',
    alignItems: 'center',
    margin: '0',
  },
  root: {
    // search root
    width: '400px',
    '& > *': {
      border: `1px solid ${theme.palette.primary.light}`,
    },
    '@media (max-width: 900px)': {
      width: 'unset',
    },
  },
  scrollingOptionsContainer: {
    maxHeight: '216px',
    paddingRight: '10px',
    overflowY: 'scroll',
    overflowX: 'hidden',
    scrollbarColor: `${theme.palette.secondary.main} transparent`,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '5px',
      border: 'none',
    },
  },
  searchOptionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-start',
    marginTop: '.7em',
    gap: '1em',
    '& > div': {
      flex: 1,
    },
  },
  searchPanelRow: {
    marginTop: '10px',
  },
  filtersRoot: {
    color: 'rgba(255,255,255,0.7)',
    '&.Mui-selected': {
      color: theme.palette.secondary.light,
    },
  },
});

export default styles;
