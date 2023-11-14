import { colors, pxToRem } from './theme';

const homeStyles = (theme) => ({
  homeWrapper: {
    width: '100%',
    minWidth: '375px',
    margin: 0,
    padding: 0,
  },
  mainWrapper: {
    width: '100%',
    minWidth: '375px',
    margin: 0,
    padding: '0 0 100px 0',
    background: colors.gradient.slate2,
  },
  alignmentWrapper: {
    margin: '0 auto',
    maxWidth: '1900px',
    paddingTop: '150px',
    '@media (max-width: 1920px)': {
      paddingLeft: '20px',
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: '130px',
    }
  },
  sectionTitle: {
    textAlign: 'left',
    width: 'calc(100% - 70px)',
    '& h2': {
      fontSize: pxToRem[22],
      fontWeight: 500,
      color: 'white',
      textDecoration: 'underline',
      textDecorationColor: colors.blue.teal,
      textDecorationThickness: '2px',
      textUnderlineOffset: '8px',
      marginBottom: '1em',
    },
    '& p': {

    }
  },
  rightGridContainer: { // keep summary and news pushed to top
    flexDirection: 'column',
    justifyContent: 'flex-start',
  }
});

export default homeStyles;
