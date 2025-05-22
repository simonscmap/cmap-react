const styles = (theme) => ({
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
  inlineCopy: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
});

export default styles;
