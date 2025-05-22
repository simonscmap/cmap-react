const styles = (theme) => ({
  nameAndCopy: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  linkContainer: {
    display: 'flex',
    alignItems: 'center',
    width: 'auto',
    minWidth: 0,
  },
  titleLink: {
    minWidth: 0,
    flex: '1 1 0%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
});

export default styles;
