import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../../enums/zIndex';

export const useCreateCollectionModalStyles = makeStyles((theme) => ({
  triggerButton: {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    borderRadius: '20px',
    '&:hover': {
      borderColor: theme.palette.primary.dark,
      color: theme.palette.primary.dark,
      backgroundColor: 'transparent',
    },
  },
  dialogPaper: {
    minWidth: '500px',
    maxWidth: '600px',
    backgroundColor: 'rgb(24, 69, 98) !important',
  },
  dialogRoot: {
    zIndex: `${zIndex.MUI_DIALOG} !important`,
  },
}));
