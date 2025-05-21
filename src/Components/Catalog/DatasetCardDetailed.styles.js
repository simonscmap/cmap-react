const datasetCardDetailedStyles = (theme) => ({
  resultPaper: {
    background: 'rgba(0,0,0,0.2)',
    boxShadow: 'none',
    border: '1px solid #69FFF2',
  },
  wrapper: {
    padding: '.9em',
    height: '370px',
  },
  contentBox: {
    width: '100%',
    display: 'flex',
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
    display: 'inline-block',
    whiteSpace: 'nowrap',
    marginTop: '-4px',
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
});

const otherComponentStyles = (theme) => ({
  nameAndCopy: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  linkContainer: {
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 'auto',
  },
  titleLink: {
    width: '100%',
    color: '#69FFF2',
    '&:visited': {
      color: '#69FFF2',
    },
  },
  downloadLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    textTransform: 'none',
    textIndent: '.5em',
    textSize: '1.5em',
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minWidth: 0,
  },
  buttonTextSpacer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '.75em',
    alignItems: 'center',
  },
  primaryColor: {
    color: theme.palette.secondary.main,
  },
});

const styles = (theme) => ({
  ...datasetCardDetailedStyles(theme),
  ...otherComponentStyles(theme),
});

export default styles;
