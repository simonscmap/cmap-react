import { colors, pxToRem } from '../../Home/theme';

const editorStyles = (theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    margin: '2em 0',
  },
  panelContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    gap: '2em',
    margin: '1em 0',
  },
  first: {
    width: '50%'
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'start',
  },
  cardBackdrop: {
    margin: '0 0 1em 0',
    // padding: '30px',
    overflow: 'hidden',
    position: 'relative',
    maxWidth: 'calc(100% - 30px)',
  },
  editor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 2,
    padding: '10px',
    overflow: 'hidden',
    position: 'relative',
    maxWidth: 'calc(100% - 30px)',
    background: '#07274D',
    borderRadius: '6px',
  },

  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5em',
  },

  textField: {
    border: `1px solid ${colors.blue.slate}`,
    borderRadius: '4px',
    background: colors.blue.dark,
    '& input': {
      fontSize: `${pxToRem[14]}`,
      border: 0,
      outline: 0,
      '&$hover': {
        border: 0,
        outline: 0,
      },
    },
    '& fieldset': {
      border: 0,
      outline: 0,
    },
  },
});

export default editorStyles;
