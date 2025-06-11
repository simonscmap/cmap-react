import colors from '../../../enums/colors';

const scrollableStyles = {
  overflowY: 'auto',
  paddingRight: '1em',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  },
};

const styles = (theme) => ({
  guideSection: {
    // width: '80%',
    maxWidth: '1800px',
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
  sectionHeadRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    whiteSpace: 'nowrap',
    '& > div': {
      verticalAlign: 'middle',
      margin: '0 5px',
    },
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
    // marginTop: '100px',
    color: 'white',
    padding: '0 10px',
    maxWidth: '1900px',
    margin: '0 auto',
  },
  errorContainer: {
    paddingTop: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markdown: {
    // minHeight: '500px',
    [theme.breakpoints.down('sm')]: {
      // minHeight: 0,
    },
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
      textAlign: 'justify',
      fontWeight: 400,
      lineHeight: 1.5,
      whiteSpace: 'pre-line',
    },
  },
  downloadLink: {
    color: theme.palette.primary.main,
    display: 'inline-block',
    marginRight: '1em',
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '2em',
    padding: '3px 16px',
    '& > svg': {
      marginBottom: '-5px',
      marginRight: '5px',
      height: '18px',
      width: '18px',
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
  gridSection: {
    marginTop: '3em',
  },
  horizontalFlex: {
    // accomodate news in description area
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2em',
  },
  descriptionContainer: {
    flex: 2,
    maxHeight: '60vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  descriptionContent: {
    maxHeight: '60vh',
    ...scrollableStyles,
  },
  acknowledgmentContent: {
    maxHeight: '30vh',
    ...scrollableStyles,
  },
});

export default styles;
