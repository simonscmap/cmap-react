import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../../enums/zIndex';

export const useAddDatasetsStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: '1400px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    backgroundColor: 'rgb(24, 69, 98)', // CMAP blue background
  },
  dialogRoot: {
    zIndex: `${zIndex.MUI_DIALOG + 1} !important`, // Above EditCollectionModal
  },
  tabsRoot: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    marginBottom: theme.spacing(3),
  },
  normalRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  invalidRow: {
    backgroundColor: 'rgba(255, 235, 59, 0.1)', // Yellow background
    borderLeft: '3px solid rgba(255, 235, 59, 0.6)',
    '&:hover': {
      backgroundColor: 'rgba(255, 235, 59, 0.15)',
    },
  },
  alreadyPresentRow: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    '& .MuiCheckbox-root': {
      visibility: 'hidden', // Hide checkbox
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
  },
  footerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
    marginTop: theme.spacing(2),
  },
  summaryBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  summaryBannerDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  summaryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  summaryTitle: {
    fontWeight: 600,
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  summaryStats: {
    display: 'flex',
    gap: theme.spacing(3),
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  summaryActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));
