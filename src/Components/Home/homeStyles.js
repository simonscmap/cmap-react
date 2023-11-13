import { colors } from './theme';

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
  }
});

export default homeStyles;
