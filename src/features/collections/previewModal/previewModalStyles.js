import { makeStyles } from '@material-ui/core/styles';

export const usePreviewModalStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: '800px',
    maxWidth: '900px',
    backgroundColor: 'rgb(24, 69, 98)',
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
  },
  dialogActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    gap: theme.spacing(1),
  },
  headerSection: {
    marginBottom: theme.spacing(3),
  },
  collectionTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  creatorInfo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1),
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  statsSection: {
    marginBottom: theme.spacing(3),
  },
  datasetsSection: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 500,
  },
  tableContainer: {
    maxHeight: 400,
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'auto',
    position: 'relative',
    zIndex: 1,
    '& .MuiTableCell-head': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
      color: '#8bc34a',
      fontWeight: 500,
      fontSize: '0.875rem',
      position: 'sticky',
      top: 0,
      zIndex: 2,
      padding: '8px 5px',
      border: 0,
      '&:first-child': {
        padding: '8px 5px 8px 16px',
      },
    },
  },
  table: {
    minWidth: 650,
  },
  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  tableCell: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.85rem',
    padding: '8px 5px',
    border: 0,
    '&:first-child': {
      padding: '8px 5px 8px 16px',
    },
  },
}));
