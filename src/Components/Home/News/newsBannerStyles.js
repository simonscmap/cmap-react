import { colors } from '../theme';

const newsBannerStyles = (theme) => ({
  news: {
    width: '100%',
    position: 'relative',
    paddingTop: '.5em' // prevent newsFlow's scrollbar from peeking up past the title
  },
  date: {
    opacity: '0.8',
    lineHeight: '2em',
  },
  // container for news section
  newsFlow: {
    width: '100%',
    transition: 'all .2s ease-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '1em',
    // padding: '0 1em 1em 1em',
    borderRadius: '.75em',
    background: 'rgba(0,0,0,0.10)',
    marginTop: '-1em', // position underneath the blurry title bar
    marginBottom: '2em',
    height: '1785px',
    scrollSnapType: 'both mandatory',
    scrollPaddingTop: '3em',
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarColor: `rgba(161,246,64,1) transparent`,
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(161,246,64,1)',
      borderRadius: '4px',
    },
    '& > div': {
      padding: '450px 0 0 0',
      marginLeft: '1em',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: '1em',
      width: 'calc(100% - 1em)',
    }
  },
  sectionTitleContainer: {
    // contains title; blurs news flow scrolling underneath
    position: 'absolute',
    top: 0,
    left: '1em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 'calc(100% - 2em)',
    padding: '1em',
    margin: '-1em -1em 0 -1em',
    borderRadius: '.75em .75em 0 0',
    backdropFilter: 'blur(20px)',
  },
  sectionFooter: {
    position: 'absolute',
    height: '1.5em',
    bottom: '1.5em',
    left: 0,
    width: 'calc(100% - 2em)',
    padding: '0 1em',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: '0 0 .75em .75em',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 -2px 5px -5px rgba(0,0,0,0.5)',
    '& span': {
      fontSize: '.8em',
      color: 'white',
      cursor: 'pointer',
    }
  },
  pager: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '.5em',
    '& p': {
      color:'#93a9c3',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      fontSize: '.8em',
      paddingRight: '5px',
    },
  },
  active: {
    color: colors.blue.teal,
    fontWeight: 'bold',
  },
  inactive: {
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      color: 'grey'
    }
  },
  cardTopLine: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'top',
  },
  newsTitle: {
    width: 'calc(100% - 2em)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: '0 1em 0 0',
  },
  newsCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: 'calc(100% - 2.5em)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderRadius: '6px',
    padding: '1em',
    border: `1px solid ${colors.blue.teal}`,
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',
    '&:nth-child(0)': {
      marginTop: '2.8em'
    }
  },
  newsCardContent: {
    textAlign: 'left',
    '& p': {
      lineHeight: '1.5em',
      wordBreak: 'break-word',
    },
    '& h2': {
      margin: '.75em 0'
    },
    '& h2 a': {
      color: colors.blue.teal,
      textDecoration: 'none',
      '&:visited': {
        color: colors.blue.teal,
      },
      '&:hover': {
        color: colors.green.lime,
        textDecoration: 'underline',
      },
    },
    '& a': {
      color: 'white',
      '&:visited': {
        color: 'white',
      },
      '&:hover': {
        color: theme.palette.secondary.light,
      }
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
  cardShadow: {
    // background: 'linear-gradient(293.11deg, #999999 10.23%, #555555 92.6%)',
    opacity: 0.2,
    '& p': {
      opacity: 0.1,
    },
    '& h4': {
      opacity: 0.1,
    },
  },
});

export default newsBannerStyles;
