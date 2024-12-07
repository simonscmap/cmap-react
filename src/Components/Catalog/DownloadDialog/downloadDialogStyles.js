import colors from '../../../enums/colors';
import zIndex from '../../../enums/zIndex';

const styles = (theme) => ({
  relative: {
    position: 'relative',
  },
  accordionDetails: {
    display: 'table-row',
  },
  muiDialog: {
    zIndex: `${zIndex.MUI_DIALOG} !important`,
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
  dialogMainTitle: {
    fontSize: '2em',
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
  bottomPlate: {
    padding: '0.5em 1em',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  },
  dropboxOptionWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '1em',
    '& a': {
      cursor: 'pointer',
      color: theme.palette.primary.main,
      '&:visited': {
        color: theme.palette.primary.main
      },
      '&:hover': {
        color: theme.palette.secondary.main
      }
    }
  },
  colorCorrectionPrimary: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
  },
  dropboxButton: {
    cursor: 'pointer',
    color: '#fff',
    '& > span': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '10px',
    },
    '& svg': {
      color: theme.palette.primary.main,
      fontSize: '2em',
    },
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '6px',
    marginLeft: '5px',
    padding: '5px 14px',
  }
});

export default styles;
