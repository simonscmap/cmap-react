import { pxToRem } from './theme';

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
  arrangeLeftSideHeroContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logo: {
    textAlign: 'left',
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'center',
    },
    '& img': {
      width: '70%',
      [theme.breakpoints.down('sm')]: {
        // width: '60%',
      },
      [theme.breakpoints.down('xs')]: {
        // width: '60%',
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
  tagline: {
    margin: '0 0 .5em 0',
    textAlign: 'left',
    '& h2': {
      color: 'white',
      fontSize: pxToRem[22],
    },
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
      '& h2': {
      fontSize: pxToRem[18],
    },
    }
  },
});

export default heroStyles;
