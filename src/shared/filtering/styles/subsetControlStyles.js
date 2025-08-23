const styles = (theme) => ({
  relative: {
    position: 'relative',
  },
  sliderValueLabel: {
    top: -22,
    '& *': {
      background: 'transparent',
      color: theme.palette.primary.main,
    },
    left: -14,
  },
  slider: {
    margin: '4px 8px 8px 0px',
  },
  sliderThumb: {
    borderRadius: '0px',
    height: '16px',
    width: '3px',
    marginLeft: 0,
    marginTop: '-7px',
  },
  markLabel: {
    top: 30,
    fontSize: '.7rem',
  },
  input: {
    fontSize: '13px',
    padding: '2px 0',
  },
  formGrid: {
    marginTop: '16px',
  },
  formLabel: {
    marginTop: '13px',
    fontSize: '.92rem',
  },
});

export default styles;
