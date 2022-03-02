import colors from '../../../enums/colors';

const styles = (theme) => ({
  accordionDetails: {
   display: 'table-row',
  },
  muiDialog: {
    zIndex: '9999 !important',
  },
  dialogInnerWrapper: {
    // '@media (min-width: 1000px)': {
    //  width: '900px',
    // },
    // '@media (min-height: 1000px)': {
    //  height: '650px',
    // },
  },
  dialogTitle: {
    padding: '16px 40px',
  },
  dialogPaper: {
    backgroundColor: colors.solidPaper,
  },
  dialogContent: {
    padding: '0px 40px 0 40px',
  },
  subsetStep: {
    margin: '0 40px',
    '@media (max-width: 600px)': {
      margin: 0,
    },
    height: '420px',
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
  stepContent: {
    // borderRadius: '.5em',
    // border: '1px solid black',
    // padding: '1em',
  },
});

export default styles;
