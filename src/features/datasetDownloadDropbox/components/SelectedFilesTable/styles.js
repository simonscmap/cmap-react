export const selectedFilesTableStyles = (theme) => ({
  tableTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  container: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    maxHeight: '300px',
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
  },
  table: {
    '& th': {
      fontWeight: 'bold',
      backgroundColor: 'rgba(30, 67, 113, 1)',
      color: theme.palette.common.white,
    },
    '& td': {
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(30, 67, 113, 0.2)',
    },
    '&:hover': {
      backgroundColor: 'rgba(30, 67, 113, 0.3)',
    },
  },
  filenameCell: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  removeButton: {
    color: '#ff6b6b',
    '&:hover': {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      color: '#ff5252',
    },
  },
  emptyStateCell: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  emptyStateText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
});