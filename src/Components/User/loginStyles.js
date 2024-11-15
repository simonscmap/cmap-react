import z from '../../enums/zIndex';

const styles = (theme) => ({
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start',
    paddingBottom: '1.5em',
  },
  textInput: {
    width: 'calc(50% - 10px)',
  },
  actionsContainerRight: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1em'
  },
  actionsContainerLeft: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  googleIconWrapper: {
    // marginRight: '100px',
    // marginLeft: '-8px',
  },
  dialogWrapper: {
    // backgroundColor: colors.solidPaper,
  },
  colorCorrectionPrimary: {
    color: theme.palette.primary,
  },
  colorCorrectionWhite: {
    color: 'white',
  },
  dialogRoot: {
    zIndex: `${z.LOGIN_DIALOG + 1} !important`,
  },
  warningWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '1em',
    background: 'rgba(0,0,0,0.2)',
    gap: '1em',
  },
  warningIcon: {
    color: 'rgb(209, 98, 101)',
    '& svg': {
      color: 'rgb(209, 98, 101)',
    }
  },
  registerWrapper: {
    padding: '0.5em 1em',
    background: 'rgba(0,0,0,0.2)',
  }
});

export default styles;
