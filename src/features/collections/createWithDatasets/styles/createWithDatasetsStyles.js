import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../../enums/zIndex';

export const useCreateWithDatasetsStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: '1400px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    backgroundColor: 'rgb(24, 69, 98)',
  },
  dialogRoot: {
    zIndex: `${zIndex.MUI_DIALOG} !important`,
  },
  dialogTitle: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(6),
  },
  modalTitle: {
    margin: 0,
    fontWeight: 500,
    fontSize: '1.5rem',
    color: '#8bc34a',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    gap: theme.spacing(1),
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
    },
  },
  inlineActions: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  splitPanelContainer: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: theme.spacing(3),
    alignItems: 'stretch',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing(2),
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  rightPanel: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
}));
