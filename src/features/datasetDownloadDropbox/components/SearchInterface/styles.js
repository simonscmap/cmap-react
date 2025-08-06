import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  searchContainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  searchHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  searchTitle: {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  fileCountBadge: {
    fontSize: '0.8em',
    padding: theme.spacing(0.5, 1),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
  },
}));

export default useStyles;