import { colors } from './theme';

const featureGridStyles = () => ({
  featureGridOuterContainer: {
    overflow: 'hidden',
  },
  featureGrid: {
    marginTop: '80px',
    marginBottom: '80px',
  },
  gridSectionInnerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '120px',
    '@media (max-width:900px)': {
      flexDirection: 'column',
      rowGap: '60px',
    },
  },
  sectionTextContainer: {
    '& h3': {
      marginBottom: '1.4em',
    },
    '@media (max-width:1280px)': {
      '& button': {
        padding: '20px', // reduce from 23px
        // otherwise in "submit data" don't fit
      },
    },
    '@media (max-width:900px)': {
      order: 2,
    },
  },
  art: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    '& img': {
      maxWidth: '300px',
    },
  },
  sectionArtFlexContainer: {
    '@media (max-width:1280px)': {
      order: 1,
    },
  },
  textAlignLeft: {
    textAlign: 'left',
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: '2em',
    gap: '2em',
    '@media (max-width: 500px)': {
      flexDirection: 'column',
    },
  },
  gridHR: {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0px -1px 1px rgba(0, 0, 0, 0.4)',
    marginBottom: '60px',
  },
});

export default featureGridStyles;
