import { colors } from '../Home/theme';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: '100vw',
    minHeight: '100vh',
    margin: '-21px 0 0 0',
    background: colors.gradient.slate2,
  },
  alignmentWrapper: {
    margin: '0 auto',
    maxWidth: '2500px',
    padding: '200px 2em 0 2em',
    color: 'white',
    textAlign: 'left',
    '& table': {
      textAlign: 'left',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    gap: '3em',
    justifyContent: 'flex-start'
  },
  item: {
    overflow: 'hidden',
    padding: '0',
  },
  resizeable: {
    display: 'flex',
    margin: 0,
    padding: 0,
    resize: 'both',
    overflow: 'hidden',
  },
  iframe: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    border: 0,
  },
  ruler: {
    textAlign: 'left',
    '& > div': {
      display: 'inline-block',
      textAlign: 'center',
    },
    paddingBottom: '20px',
  }
}));

export default useStyles;
