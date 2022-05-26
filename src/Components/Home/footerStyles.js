import { colors } from '../Home/theme';

const footerStyles = () => ({
  footerOuterContainer: {
    background: colors.gradient.deeps,
    paddingTop: '80px',
    borderTop: '1px solid #859db2',
  },
  footerInnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2em',
    width: '746px',
    margin: '0 auto 0 auto',
    paddingBottom: '5em',
    '@media (max-width:1280px)': {
      width: '746px',
    },
    '@media (max-width:900px)': {
      width: 'calc(100% - 50px)',
    },
    '@media (max-width:600px)': {
      // width: '540px',
    },
  },
  footerLinksContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '2em',
    '& a': {
      color: 'white',
      fontFamily: 'Lato',
      fontSize: '16px',
      fontWeight: '700',
      lineHeight: '21px',
      letterSpacing: '0em',
      textAlign: 'left',
      textDecoration: 'none',
    },
    '& a:hover': {
      textDecoration: 'underline',
    },
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  footerHR: {
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0px -1px 1px rgba(0, 0, 0, 0.4)',
  },
  variableHR: {
    display: 'none',
    '@media (max-width:900px)': {
      display: 'block',
    },
  },
  footerConnectLinks: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '40px',
    margin: '40px 0 80px 0',
    '& a:hover': {
      opacity: 0.7,
    },
    '@media (max-width:900px)': {
      marginBottom: '40px',
    },
  },
  greyTitle: {
    margin: '0 0 25px 0',
  },
  footerCollaboration: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '139px',
    margin: '0 0 20px 0',
    '@media (max-width:900px)': {
      flexDirection: 'column',
      alignItems: 'center',
      gap: '50px',
    },
  },
  footerPartnerLogos: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
});

export default footerStyles;
