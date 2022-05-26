import { colors } from './theme';

const featureGridStyles = () => ({
  featureGridOuterContainer: {
    background: colors.gradient.slate2,
    paddingTop: '80px',
    overflow: 'hidden',
  },
  featureGridInnerContainer: {
    width: '1134px',
    margin: '0 auto 0 auto',
    paddingBottom: '5em', // match buffer bettween sections
    '@media (max-width:1280px)': {
      width: '840px',
    },
    '@media (max-width:900px)': {
      width: 'calc(100% - 50px)',
    },
    '@media (max-width:600px)': {
      // width: '540px',
    },
  },
  gridSectionOuterContainer: {
    margin: '5em auto 0 auto',
  },
  gridSectionInnerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '120px',
    '@media (max-width:900px)': {
      flexDirection: 'column',
      rowGap: '60px'
    }
  },
  sectionTextContainer: {
    '@media (max-width:1280px)': {
      '& button': {
        padding: '20px', // reduce from 23px
        // otherwise in "submit data" don't fit
      }
    },
    '@media (max-width:900px)': {
      order: 2,
    },

  },
  sectionArtFlexContainer: {
    '@media (max-width:1280px)': {
      order: 1,
    }
  },
  sectionArtFindDataSpacing: {
    marginTop: '2em',
  },
  sectionArt: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  sectionArt_findData: {
    // backgroundImage: "url('images/home/catalog-search.svg')",
    // width: '355px',
    // height: '135px',
    '@media (max-width:1280px)': {
      // width: '257px',
      // height: '100px',
    },
  },
  sectionArt_accessData: {
    backgroundImage: "url('images/home/sdk-logos.svg')",
    width: '355px',
    height: '194px',
    '@media (max-width:1280px)': {
      width: '258px',
      height: '142px',
    },
    '@media (max-width:900px)': {
      // switch to one row
      // we could reduce the bundle size by 34kb if we break
      // this into 4 images and reflow the layout
      backgroundImage: "url('images/home/sdk-logos-900.svg')",
      width: '534px',
      height: '74px',
    },
    '@media (max-width:600px)': {
      backgroundImage: "url('images/home/sdk-logos.svg')",
      width: '258px',
      height: '142px',
    },
  },
  sectionArt_visualizeData: {
    backgroundImage: "url('images/home/visualize.svg')",
    width: '355px',
    height: '273px',
    '@media (max-width:1280px)': {
      width: '258px',
      height: '205px',
    },
  },
  sectionArt_submitData: {
    backgroundImage: "url('images/home/submit-data-flow.svg')",
    width: '356px',
    height: '300px',
    transform: 'rotate(90deg) translate(-65px, 0)',
    '@media (max-width:1280px)': {
      width: '211px',
      height: '240px',
    },
  },
  textAlignLeft: {
    textAlign: 'left',
  },
  h3adjust: {
    marginBottom: '1.4em',
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: '2em',
    gap: '2em',
    '@media (max-width: 500px)': {
      flexDirection: 'column',
    }
  },
  gridHR: {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0px -1px 1px rgba(0, 0, 0, 0.4)',
    marginBottom: '60px',
  },
});

export default featureGridStyles;
