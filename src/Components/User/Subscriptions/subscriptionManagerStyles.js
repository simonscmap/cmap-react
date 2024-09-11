import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (() => ({
  container: {
    margin: '0 auto',
    padding: 0,
    maxWidth: '1860px',
    minHeight: '800px',
    '& h4': {
      margin: 0
    }
  },

  title: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1em',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1em',
    '& h4': {
      display: 'inline-block',
    },
    '& button': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '1em',
      cursor: 'pointer',
      border: 0,
      padding: '8px 0 0 0',
      margin: 0,
      background: 'none',
      color: 'white',
      '&:hover': {
        color: '#69FFF2'
      },
      '& > span': {
        fontSize: '1.1rem',
      },
      '& > svg': {
        fontSize: '1.8rem'
      }
    }
  },

}));

export default useStyles;
