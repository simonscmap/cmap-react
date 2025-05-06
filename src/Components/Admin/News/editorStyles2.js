import { makeStyles } from '@material-ui/core/styles';
import { colors, pxToRem } from '../../Home/theme';

const useEditorStyles = makeStyles((theme) => ({
  container: {
    margin: '2em 0',
  },
  panelContainer: {
    display: 'grid',
    gridGap: '1em',
    'grid-template-columns': 'repeat(3, [col] calc(33% - 1em))',
    'grid-template-rows': 'repeat(4, [row] auto)',
    margin: '1em 0',
  },

  // ------------ 1
  cardContainer: {
    gridColumn: 'col / span 1',
    gridRow: 'row / span 1',

    display: 'flex',
    flexDirection: 'column',
    alignContent: 'start',
  },
  cardBackdrop: {
    margin: '1em 0',
    position: 'relative',
  },
  // ------------ 2
  editorContainer: {
    gridColumn: 'col 2 / span 2',
    gridRow: 'row / span 3',

    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  editor: {
    marginTop: '1em',
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
  readyToSave: {
    boxShadow:
      '0 0 20px rgba(105, 255, 242, 0.6), inset 0 0 10px rgba(105, 255, 242, 0.4), 0 2px 0 #000',
  },
  // --------------- 3
  // tagManagerContainer: {
  //   gridColumn: 'col / span 1',
  //   gridRow: 'row 2 / span 3',
  // },
  taggerContainer: {
    gridColumn: '1 / span 1',
    gridRow: '2 / span 3',
  },
  // --------------- 4
  emailContainer: {
    gridColumn: 'col 2 / span 2',
    gridRow: 'row 4',
  },

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
      fontSize: `${pxToRem[18]}`,
      padding: '18px 14px 4px 14px',
      border: 0,
      outline: 0,
      '&:hover': {
        border: 0,
        outline: 0,
      },
    },
    '& fieldset': {
      border: 0,
      outline: 0,
    },
    '& p': {
      color: 'grey',
      marginTop: 0,
    },
  },
}));

export default useEditorStyles;
