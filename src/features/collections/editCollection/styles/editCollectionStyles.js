import { makeStyles } from '@material-ui/core/styles';

/**
 * Shared styles for Edit Collection feature components
 * Provides consistent theming, layout, and visual states across all edit collection UI
 */
export const useEditCollectionStyles = makeStyles((theme) => ({
  // Page-level layout
  pageContainer: {
    padding: theme.spacing(3),
    maxWidth: '1600px',
    margin: '0 auto',
  },
  splitPanelContainer: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
  leftPanel: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    height: 'fit-content',
  },
  rightPanel: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
  },

  // Visual states for dataset rows
  markedForRemovalRow: {
    opacity: 0.5,
    backgroundColor: theme.palette.action.disabledBackground,
    '& .MuiTableCell-root': {
      textDecoration: 'line-through',
      color: theme.palette.text.disabled,
    },
  },
  unavailableRow: {
    opacity: 0.7,
    backgroundColor: theme.palette.action.hover,
  },
  unavailableBadge: {
    marginLeft: theme.spacing(1),
    height: '20px',
    fontSize: '0.7rem',
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },

  // Form field styles
  formField: {
    marginBottom: theme.spacing(2),
  },
  fieldLabel: {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
  helperTextContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  helperTextChecking: {
    color: theme.palette.info.main,
  },
  helperTextAvailable: {
    color: theme.palette.success.main,
  },
  helperTextWarning: {
    color: theme.palette.warning.main,
  },
  helperTextUnavailable: {
    color: theme.palette.error.main,
  },
  characterCount: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  characterCountOverLimit: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    fontWeight: 500,
  },

  // Loading and error states
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8),
    gap: theme.spacing(2),
  },
  errorContainer: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  errorText: {
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },

  // Responsive design breakpoints
  [theme.breakpoints.down('sm')]: {
    pageContainer: {
      padding: theme.spacing(2),
    },
    splitPanelContainer: {
      gridTemplateColumns: '1fr',
      gap: theme.spacing(2),
    },
  },
}));

export default useEditCollectionStyles;
