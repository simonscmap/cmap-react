const heroStyles = (theme) => ({
  // container for hero contents, divided into 3 groups
  hero: {
    alignContent: 'flex-start',
    paddingBottom: '80px',
    '& .copy': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      textAlign: 'left',
      '& h6': {
        fontSize: '1.75em',
      }
    },
  },

  logo: {
    textAlign: 'left',
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'center',
    },
    '& img': {
      width: '80%',
      [theme.breakpoints.down('sm')]: {
        width: '90%',
      },
      [theme.breakpoints.down('xs')]: {
        width: '90%',
      }
    },
  },
  globe: {
    textAlign: 'left',
    '& img': {
      width: '135%',
      marginTop: '-10%',
      [theme.breakpoints.down('sm')]: {
        width: '125%'
      },
      [theme.breakpoints.down('xs')]: {
        // marginTop: 0,
        width: '135%'
      }
    },
  },
  copy: {
    textAlign: 'left',
    '& h2': {
      margin: '1em 0 .5em 0',
    },
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    }
  },
  heroBlurb: {
    lineHeight: '1.3',
  },
});

export default heroStyles;
