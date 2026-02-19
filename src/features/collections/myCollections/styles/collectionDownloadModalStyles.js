import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../../enums/zIndex';
import colors from '../../../../enums/colors';

export const useCollectionDownloadModalStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: '800px',
    maxWidth: '1500px',
    width: '95vw',
    maxHeight: '90vh',
    backgroundColor: colors.solidPaper,
  },
  dialogRoot: {
    zIndex: `${zIndex.MUI_DIALOG} !important`,
  },
  dialogTitle: {
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(6),
  },
  modalTitle: {
    margin: 0,
    fontWeight: 500,
    fontSize: '1.25rem',
    color: colors.lightGreen,
    minWidth: 0,
    overflowWrap: 'break-word',
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
