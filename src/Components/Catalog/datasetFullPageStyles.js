import colors from '../../enums/colors';

const styles = (theme) => ({
  guideSection: {
    width: '80%',
    margin: '65px auto 0 auto',
    textAlign: 'left',
    padding: '12px 32px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px 12px',
      margin: '16px auto 16px auto',
      width: '90%',
    },
    fontFamily: '"roboto", Serif',
    backgroundColor: 'rgba(0,0,0,.4)',
    marginBottom: '20px',
  },
  sectionHeader: {
    margin: '16px 0 2px 0',
    fontWeight: 100,
    fontFamily: '"roboto", Serif',
  },
  divider: {
    backgroundColor: theme.palette.primary.main,
    marginBottom: '8px',
  },
  navListSubItemText: {
    fontSize: '.785rem',
  },
  navListSubSubItemText: {
    fontSize: '.7rem',
  },
  outerContainer: {
    marginTop: '70px',
    color: 'white',
  },

  markdown: {
    '& img': {
      maxWidth: '100%',
      margin: '20px auto 20px auto',
      display: 'block',
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
    },
    '& p': {
      fontSize: '1rem',
      fontFamily: '"Lato",sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  downloadLink: {
    color: colors.primary,
    display: 'inline-block',
    marginRight: '1em',
    '& > svg': {
      marginBottom: '-5px',
      marginRight: '5px',
    },
  },
  smallText: {
    fontSize: '.8rem',
  },
  pageHeader: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.4rem',
    },
  },
  helpIcon: {
    fontSize: '1.2rem',
  },
  helpButton: {
    padding: '12px 12px 12px 8px',
  },
  cartButtonClass: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    display: 'inline-block',
    marginTop: '6px',
    '& svg': {
      marginBottom: '-4px',
    },
  },
  cruiseLink: {
    display: 'block',
    marginBottom: '3px',
    color: colors.primary,
  },
  bottomAlignedText: {
    display: 'inline-block',
    marginBottom: '-5px',
  },

});

export default styles;
