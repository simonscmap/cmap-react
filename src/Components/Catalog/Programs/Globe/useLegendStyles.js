import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../../enums/colors';

const useStyles = makeStyles((theme) => ({
  legend: {
    position: 'absolute',
    width: '300px',
    top: '20px',
    left: '20px',
    color: 'white',
    '& h6': { }
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    '& .MuiPaper-root': {
      backgroundColor: 'transparent'
    },
  },
  paper: {
    border: '1px solid black',
    backdropFilter: 'blur(5px)',
    width: '100%',
  },
  legendEntry: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1em',
    width: '100%',
    margin: '.3em 0'
  },
  swatch: {
    height: '1em',
    width: '1em',
    textAlign: 'center',
    borderRadius: '.5em',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'flex-start',
    gap: '.5em',
    '& a': {
      color: 'white',
    },
    '& p': {
      margin: 0,
    },
    '& > div': {
      margin: 0,
    }
  },
  zoomIcon: {
    color: colors.primary,
    '& svg': {
      fontSize: '1.1em',
      marginBottom: '-3px'
    }
  },
  openPageIcon: {
    color: colors.primary,
    '& svg': {
      marginBottom: '-4px',
      marginLeft: '5px',
      fontSize: '1.1em',
      cursor: 'pointer',
    }
  },
  nick: {
    fontSize: '.9em'
  }
}));

export default useStyles;
