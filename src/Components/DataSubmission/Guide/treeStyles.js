import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTreeItem-label': {
      fontSize: '1.2em',
      backgroundColor: 'unset',
      borderRadius: '6px',
    },
    '& .MuiTreeItem-root .MuiTreeItem-label': {
      backgroundColor: 'unset',
    },
    '& .MuiTreeItem-root.Mui-selected .MuiTreeItem-label': {
      backgroundColor: 'unset',
      // color: theme.palette.secondary.main,
      // fontWeight: 'bold',
    },
    '& .MuiTreeItem-root.Mui-selected .MuiTreeItem-label:hover': {
      backgroundColor: 'unset',
    },
    '& .MuiTreeItem-root.Mui-selected:focus .MuiTreeItem-label': {
      backgroundColor: 'unset',
    },
  },
  item: {
    background: 'none',
    backgroundColor: 'unset',
    '& div': {
      background: 'none',
      backgroundColor: 'unset',
    },
  },
  itemLabel: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'none',
    alignItems: 'center',
    gap: '1em',
  },
  labelText: {
    fontSize: '20px',
  },
  labelIcon: {
    paddingTop: '1px',
  },
  highlight: {
    '&.MuiTreeItem-root > .MuiTreeItem-content .MuiTreeItem-label': {
      color: '#07274d',
      background: 'white',
      backgroundColor: 'white',
    },
    '&.MuiTreeItem-root > .MuiTreeItem-content .MuiTreeItem-label:hover': {
      color: theme.palette.secondary.main,
      background: 'white',
      backgroundColor: 'white',
    },
    '&.MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label:hover':
      {
        background: 'white',
        backgroundColor: 'white',
      },
    '&.MuiTreeItem-root.Mui-selected:focus > .MuiTreeItem-content > .MuiTreeItem-label':
      {
        backgroundColor: 'white',
      },
  },
}));

export default useStyles;
