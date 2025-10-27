import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../../enums/zIndex';

export const useCollectionDownloadModalStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: '800px',
    maxWidth: '1200px',
    width: '90vw',
    maxHeight: '90vh',
    backgroundColor: 'rgb(24, 69, 98)',
  },
  dialogRoot: {
    zIndex: `${zIndex.MUI_DIALOG} !important`,
  },
  dialogTitle: {
    paddingBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    overflow: 'auto',
  },
}));
