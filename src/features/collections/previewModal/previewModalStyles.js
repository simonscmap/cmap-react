import { makeStyles } from '@material-ui/core/styles';

export const usePreviewModalStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: '900px',
    maxWidth: '90vw',
    backgroundColor: 'rgb(24, 69, 98)',
  },
  dialogTitle: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(6),
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
  },
  headerSection: {
    marginBottom: theme.spacing(3),
  },
  collectionTitle: {
    margin: 0,
    fontWeight: 500,
    fontSize: '1.5rem',
    color: '#8bc34a',
    flex: 1,
  },
  creatorInfo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
    marginBottom: theme.spacing(2),
  },
  descriptionBox: {
    borderLeft: '4px solid rgba(139, 195, 74, 0.5)',
    paddingLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    fontStyle: 'italic',
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
    overflowY: 'scroll',
    overflowX: 'scroll',
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
    width: '100%',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  tableCell: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.85rem',
    padding: '12px 8px',
    border: 0,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    lineHeight: 1.4,
    '&:first-child': {
      paddingLeft: '16px',
    },
    '&:last-child': {
      paddingRight: '16px',
    },
  },
  datasetNameCell: {
    minWidth: '200px',
    maxWidth: '350px',
  },
  regionCell: {
    width: '180px',
  },
  dateRangeCell: {
    width: '140px',
    lineHeight: 1.3,
  },
  rowsCell: {
    width: '80px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
}));
