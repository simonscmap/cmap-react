import { colors } from './theme';

const newsBannerStyles = () => ({
  newsBanner: {
    margin: '10px auto 0 auto',
    padding: '14px 0',
    // height: '40px',
    maxWidth: '1380px',
    width: 'calc(100% - 50px)',
    '@media (max-width:700px)': {
      width: '90%',
      height: 'auto',
    },
    background: 'linear-gradient(269.89deg, #600082 0%, #79139D 100%)',
    borderRadius: '6px',
    transition: 'height .2s ease-out, padding-top .2s ease-out',
    overflow: 'hidden',
    '& a': {
      color: 'white',
      '& :visited': {
        color: 'white',
      },
    },
  },
  newsBlock: {
    padding: '40px 0 30px 0',
    margin: '10px 0 0 0',
    width: '100%',
    height: 'calc(393px - 70px)',
    background: colors.gradient.newsBlock,
    transition: 'height .2s ease-out, padding-top .2s ease-out',
    overflow: 'hidden',
  },

  newsInnerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '1280px',
    width: 'calc(100% - 40px)', // 40px is the sum of parent's lateral padding
    padding: '0 20px',
    margin: '0 auto',
    '@media (max-width:900px)': {
      width: 'calc(100% - 50px)',
    },
    '@media (max-width:700px)': {
      padding: 0,
    },
  },
  newsBannerInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    // note this is an irregular breakpoint
    // it prevents the button text from wrapping
    '@media (max-width:700px)': {
      flexDirection: 'column',
      rowGap: '28px',
    },
  },
  newsBlockInnerContainer: {
    height: 'calc(393px - 70px)',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '2em',
  },
  newsBlockDate: {
    opacity: '0.8',
    lineHeight: '2em',
  },
  newsBannerLink: {
    order: 1, // when displaying a link in banner mode, it should be first
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0 10px 0 0',
    minWidth: '345px',
    '&:hover': {
      textDecoration: 'underline',
    },
    '@media (max-width:700px)': {
      minWidth: 'auto',
    },
  },
  bannerExpandButton: {
    order: 2,
    minWidth: '265px',
  },
  blockControls: {
    order: 1, // when expanded, the controls should be first
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scrollControlsContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
  },
  arrowButtonContainer: {
    cursor: 'pointer',
    opacity: 0.4,
    transition: 'opacity 0.2s ease-out',
    '&:hover': {
      opacity: 1,
    },
  },

  newsFlow: {
    order: 2, // when expanded, news is after the controls
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '30px',
  },
  newsCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '10px',
    padding: '30px',
    width: '299px',
    height: '185px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.14)',
    '&:hover': {
      background: 'linear-gradient(293.11deg, #76248E 10.23%, #9253A8 92.6%)',
    },
    transition:
      'margin .3s ease-out, background 0.5s ease-out, opacity 0.5s ease-out',
    overflowY: 'scroll',
    overflowX: 'clip',
    scrollbarColor: `rgba(0,0,0,0.15) transparent`,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: colors.blue.teal,
      borderRadius: '5px',
      border: 'none',
    },
  },
  newsCardContent: {
    textAlign: 'left',

    '& h4 a': {
      color: 'white',
    },
    '& a': {
      color: 'white',
      '& :visited': {
        color: 'white',
      },
    },
    '& em': {
      fontWeight: 700,
      fontStyle: 'normal',
    },
    '& i': {
      fontStyle: 'italic',
      fontWeight: 300,
    },
  },
  cardFaded: {
    background: 'linear-gradient(293.11deg, #555555 10.23%, #999999 92.6%)',
    opacity: 0.5,
    '&:hover': {
      opacity: 0.7,
      background: 'linear-gradient(293.11deg, #999999 10.23%, #555555 92.6%)',
    },
  },
  cardShadow: {
    background: 'linear-gradient(293.11deg, #999999 10.23%, #555555 92.6%)',
    opacity: 0.2,
    '&:hover': {
      opacity: 0.5,
      background: 'linear-gradient(293.11deg, #999999 10.23%, #555555 92.6%)',
    },
    '& p': {
      opacity: 0.1,
    },
    '& h4': {
      opacity: 0.1,
    },
  },
  cardSecond: {
    opacity: 1,
    '@media (max-width:1280px)': {
      opacity: 0.3,
    },
  },
  cardThird: {
    opacity: 0.7,
    '@media (max-width:1280px)': {
      opacity: 0.3,
    },
  },
  cardTail: {
    opacity: 0.3,
  },
});

export default newsBannerStyles;
