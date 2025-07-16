export const paginationControlsStyles = (theme) => ({
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
  pageSizeSelect: {
    minWidth: '50px',
    whiteSpace: 'nowrap',
    '& .MuiSelect-root': {
      zIndex: '9900 !important',
    },
    '& .MuiPopover-root': {
      zIndex: '9900 !important',
    },
    '& .MuiPaper-root': {
      zIndex: '9900 !important',
    },
    '& .MuiInputLabel-root': {
      whiteSpace: 'nowrap',
    },
  },
});
