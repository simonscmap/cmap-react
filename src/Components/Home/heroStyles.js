const heroStyles = () => ({
  heroOuterContainer: {
    background: 'linear-gradient(103.17deg, #173993 16.08%, #07274D 87.84%)',
    paddingTop: '200px',
    paddingBottom: '20px',
    '@media(max-width: 1280px)': {
      paddingTop: '150px',
    },
    '@media(max-width: 900px)': {
      paddingTop: '100px',
    },
  },
  heroInnerContainer: {
    maxWidth: '1380px',
    width: '100%',
    margin: '0 auto 5em auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    '& .heroFirstGroup': {
      marginRight: '70px',
      width: '423px',
      height: '423px',
      backgroundImage: "url('/images/home/hero.svg')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    },
    '& .heroSecondGroup': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingLeft: '34px',
      textAlign: 'left',
      width: '672px',
    },
    '@media (max-width:1280px)': {
      width: '840px',
      '& .heroFirstGroup': {
        marginRight: '34px',
        width: '425px',
        height: '414px',
      },
      '& .heroSecondGroup': {
        width: '402px',
        paddingLeft: '0',
      },
    },
    '@media (max-width:900px)': {
      width: '100%',
      flexDirection: 'column',
      '& .heroFirstGroup': {
        width: '375px',
        height: '375px',
        marginRight: 0,
        marginBottom: '40px',
      },
      '& .heroSecondGroup': {
        width: 'calc(100% - 60px)',
        '& > div': {
          margin: '0 auto',
        },
      },
    },
    '@media (max-width:500px)': {
      flexDirection: 'column',
      '& .heroFirstGroup': {
        width: '314px',
        height: '314px',
      },
      '& .heroSecondGroup': {
        paddingLeft: '34px',
        '& > div': {
          margin: '0',
        },
      },
    },
  },
  cmapLogoContainer: {
    width: '435px',
    height: '182px',
    backgroundImage: "url('/images/home/simons-cmap-logo-full.svg')",
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    '@media (max-width: 1280px)': {
      width: '345px',
      height: '143px',
    },
    '@media (max-width: 900px)': {
      width: '306px',
      height: '128px',
    },
    '@media (max-width: 500px)': {
      width: '276px',
      height: '115px',
    },
  },
  heroBlurb: {
    lineHeight: '1.3',
  },
});

export default heroStyles;
