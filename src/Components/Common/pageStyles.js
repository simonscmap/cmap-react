import { colors } from '../Home/theme';

const styles = () => ({
  pageContainer: {
    // padding: '150px 0 50px 0',
    width: '100%',
    color: '#ffffff',
    '& p a': {
      color: colors.green.lime,
      textDecoration: 'none',
      '&:hover': {
        color: 'var(--cmap-green)',
        // color: colors.green.lime,
        textDecoration: 'none',
      },
    },
  },
  titleSection: {
    padding: '150px 0 50px 0',
  },
  pageTitle: {
    // margin: ''
  },
});

export default styles;
