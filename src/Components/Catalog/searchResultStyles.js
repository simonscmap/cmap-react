const styles = (theme) => ({
  resultWrapper: {
    padding: '4px 12px',
  },
  imageWrapper: {
    height: '180px',
    margin: '10px 3px -27px 0',
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
  longName: {
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '1.15rem',
    display: 'block',
    margin: '6px 0',
    color: theme.palette.primary.main,
  },
  resultPaper: {
    marginTop: '22px',
    margin: '0 20px 0 0',
  },
  denseText: {
    fontSize: '.9rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cartButtonClass: {
    textTransform: 'none',
    color: theme.palette.primary.main,
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
    marginLeft: '2em',
    textTransform: 'none',
    textIndent: '.5em',
  },
  '@media (min-width: 1280px) and (max-width: 1482px)': {
    downloadLink: {
      backgroundColor: 'rgb(33, 82, 108, 0.9)',
      boxShadow:
        '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '&:hover': {
        background: 'rgb(33, 82, 108, 0.4)',
      },
    },
  },
  [theme.breakpoints.down('sm')]: {
    downloadLink: {
      backgroundColor: 'none',
      boxShadow: 'none',
      '&:hover': {
        background: 'none',
      },
    },
  },
  resultSpacingWrapper: {
    padding: '0 0 20px 0',
  },
  resultActions: {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'left',
  },
  '@media (max-width: 690px)': {
    resultActions: {
      flexDirection: 'column',
    },
    downloadLink: {
      margin: 0,
      justifyContent: 'left',
    },
  },
  bottomAlignedText: {
    display: 'inline-block',
    marginBottom: '-5px',
  },
});

export default styles;
