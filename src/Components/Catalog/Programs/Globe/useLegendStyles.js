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
    minHeight: '100px',
    maxHeight: '455px',
    overflowY: 'scroll',
    overflowX: 'hidden',
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
    overflow: 'hidden',
    gap: '.5em',
    '& p': {
      margin: 0,
    },
    '& > div': {
      margin: 0,
    }
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'flex-start',
    gap: '.5em',
    '& a': {
      color: theme.palette.primary.main,
      '&:visited': {
        color: theme.palette.primary.main,
      },
      '&:hover': {
        color: 'white',
      }
    },
    '& p': {
      margin: 0,
    },
    '& > div': {
      margin: 0,
    }
  },
  zoomIcon: {
    width: '100%',
    color: colors.primary,
    '& svg': {
      fontSize: '1.1em',
      // marginBottom: '-3px'
      margin: '0 5px',
    }
  },
  openPageIcon: {
    // color: colors.primary,
    '& svg': {
      marginBottom: '-4px',
      marginLeft: '5px',
      fontSize: '1.1em',
      cursor: 'pointer',
    }
  },
  nick: {
    fontSize: '.9em',
    display: '-webkit-box',
    '-webkitLineClamp': 1,
    '-webkitBoxOrient': 'vertical',
  },

}));

export default useStyles;
