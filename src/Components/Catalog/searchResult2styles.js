const styles = (theme) => ({
  resultSpacingWrapper: {
    padding: '0 0 20px 0',
  },
  resultPaper: {
    background: 'transparent',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.secondary.main}`,
  },
  resultWrapper: {
    padding: '1em',
  },
  imageWrapper: {
    height: 'calc(100% - 6px)',
    margin: '6px 0 0 0',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    backgroundPosition: 'center right',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundOrigin: 'content-box',
  },
  gridRow: {
    textAlign: 'left',
  },
  // link
  longName: {
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '1.15rem',
    display: 'block',
    margin: '6px 0 0 0',
    color: theme.palette.secondary.main,
  },
  denseText: {
    fontSize: '.9rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fixedWidthText: {
    fontSize: '.9rem',
    textOverflow: 'ellipsis',
    fontFamily: 'mono',
    color: theme.palette.secondary.light,
  },
  cartButtonClass: {
    textTransform: 'none',
    color: theme.palette.secondary.main,
  },

  warningIcon: {
    color: '#e3e61a',
    marginLeft: '14px',
    marginBottom: '-7px',
    fontSize: '1.45rem',
  },
  downloadLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    textTransform: 'none',
    textIndent: '.5em',
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minWidth: 0,
  },

  resultActions: {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'left',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '.5em',
  },
  bottomAlignedText: {
    display: 'inline-block',
    // marginBottom: '-5px',
    whiteSpace: 'nowrap',
  },
});

export default styles;
