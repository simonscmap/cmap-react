import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../../enums/colors';

const useStyles = makeStyles((theme) => ({
  legend: {
    position: 'absolute',
    width: '300px',
    top: '20px',
    left: '20px',
    color: 'white',
    '& h6': {},
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    '& .MuiPaper-root': {
      backgroundColor: 'transparent',
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
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1em',
    width: '245px',
    margin: '.3em 0',
  },
  swatch: {
    height: '1em',
    width: '1em',
    textAlign: 'center',
    borderRadius: '.5em',
  },
  cruiseTextSummary: {
    height: '1em',
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    flexWrap: 'nowrap',
    width: '100%',
    gap: '.5em',
    '& p': {
      margin: 0,
    },
    '& > div': {
      margin: 0,
    },
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
      },
    },
    '& p': {
      margin: 0,
    },
    '& > div': {
      margin: 0,
    },
  },
  zoomIcon: {
    width: '100%',
    color: colors.primary,
    '& svg': {
      fontSize: '1.1em',
      // marginBottom: '-3px'
      margin: '0 5px',
    },
  },
  openPageIcon: {
    // color: colors.primary,
    '& span': {
      fontSize: '0.9em',
    },
    '& svg': {
      marginBottom: '-4px',
      marginLeft: '5px',
      fontSize: '1.1em',
      cursor: 'pointer',
    },
  },
  summaryFirstGroup: {
    width: '120px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  nick: {
    width: '93px',
    fontSize: '.9em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontStyle: 'italic',
  },
  crossProgramChip: {
    margin: '-4px 0 0 0',
    '& > svg': {
      fontSize: '.9em',
      color: '#9dd162',
    },
  },
}));

export default useStyles;
