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
  actionsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

export default styles;
