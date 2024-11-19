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
  },
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  closeLink: {
    color: theme.palette.primary,
    fontFamily: 'Montserrat',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '22px',
    textTransform: 'uppercase',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
