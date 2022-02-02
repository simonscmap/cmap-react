import colors from '../../../enums/colors';

const styles = (theme) => ({
  dialogPaper: {
    backgroundColor: colors.solidPaper,
    '@media (max-width: 600px)': {
      width: '100vw',
      margin: '12px',
    },
    width: '60vw',
  },
  dialogContent: {
    padding: '0px 40px'
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
  dialogRoot: {
    overflowY: 'visible',
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
  helpButton: {
    marginTop: '-2px',
  },
  closeDialogIcon: {
    float: 'right',
    marginTop: '-12px',
    marginRight: '-8px',
  },
});

export default styles;
