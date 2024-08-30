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
    margin: '1em 0',

  },

  // ------------
  editorAndPreview: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    '& > div': {
      minWidth: '400px'
    },
    margin: '1em 0',
    gap: '1em'
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'start',
  },
  cardBackdrop: {
    margin: '0 0 1em 0',
    position: 'relative',
    '& > div': {
      minWidth: '500px',
    }
  },
  editorContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  editor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 2,
    padding: '10px',
    overflow: 'hidden',
    position: 'relative',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
  },
  // ---
  tagsAndEmail: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    '& > div': {
      minWidth: '400px'
    },
    margin: '1em 0',
    gap: '1em'
  },
  tagManagerContainer: {

  },
  emailContainer: {

  },

  // =====
  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5em',
  },

  textField: {
    border: `1px solid ${colors.blue.slate}`,
    borderRadius: '4px',
    background: 'rgba(0,0,0,0.2)',
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
