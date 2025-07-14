export const dropboxFileSelectionStyles = (theme) => ({
  container: {
    marginTop: theme.spacing(2),
    maxHeight: '400px',
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
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
  },
  paginationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  loadingOverlay: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },
});