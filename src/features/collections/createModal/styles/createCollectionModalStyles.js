import { makeStyles } from '@material-ui/core/styles';

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
  },
  formField: {
    marginBottom: theme.spacing(3),
  },
  fieldLabel: {
    fontSize: '1.1rem',
    fontWeight: 500,
  },
  helperTextContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    marginLeft: 'auto',
  },
  characterCountOverLimit: {
    marginLeft: 'auto',
    color: '#F44336',
  },
  visibilitySection: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  visibilityLabel: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  radioLabel: {
    marginBottom: theme.spacing(1),
    marginLeft: 0,
    marginRight: 0,
    padding: theme.spacing(2),
    border: '1px solid rgba(255, 255, 255, 0.23)',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    alignItems: 'flex-start',
    '&:hover': {
      borderColor: 'rgba(105, 190, 40, 0.5)',
    },
  },
  radioLabelSelected: {
    borderColor: 'rgb(105, 190, 40)',
    backgroundColor: 'rgba(105, 190, 40, 0.05)',
  },
  radioDescription: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  descriptionField: {
    '& .MuiOutlinedInput-root': {
      resize: 'both',
      overflow: 'auto',
    },
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
  helperTextChecking: {
    color: '#FFD700',
  },
  helperTextWarning: {
    color: '#FFD700',
  },
  helperTextAvailable: {
    color: 'rgb(157, 209, 98)',
  },
  helperTextUnavailable: {
    color: '#F44336',
  },
}));
