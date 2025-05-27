const styles = () => ({
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
    fontSize: '.85em',
  },
  inlineCopy: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
});

export default styles;
