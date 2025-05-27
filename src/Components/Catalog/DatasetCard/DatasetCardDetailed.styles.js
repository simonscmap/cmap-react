const styles = () => ({
  resultPaper: {
    background: 'rgba(0,0,0,0.2)',
    boxShadow: 'none',
    border: '1px solid #69FFF2',
  },
  wrapper: {
    padding: '.9em',
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.5em',
  },
  textContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  rightContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  graphicContainer: {
    padding: '30px 0 0 0',
    width: '335px',
    height: '300px',
    '& > img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      objectPosition: 'top right',
    },
  },
  title: {
    width: '100%',
    textAlign: 'left',
    fontSize: '1.4em',
    paddingBottom: '0.5em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    gap: '5px',
  },
  actionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& > div': {
      verticalAlign: 'middle',
    },
  },
  metadataContainer: {
    '& table .MuiTypography-body1': {
      margin: 0,
    },
  },
  actionBox: {
    height: '24px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1em',
    paddingBottom: '.5em',
    '& > div': {
      display: 'flex',
      flexDirection: 'row',
      gap: '.5em',
      alignItems: 'center',
    },
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '20px',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    alignSelf: 'flex-start',
  },
  contentContainer: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    '@media (max-width: 1600px)': {
      flexDirection: 'column',
    },
  },
});

export default styles;
