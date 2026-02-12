import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../enums/colors';

/**
 * Shared styles for collection form fields
 * Used by CollectionFormFields and other collection form components
 */
export const useCollectionFormStyles = makeStyles((theme) => ({
  sectionTitle: {
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formField: {
    marginBottom: theme.spacing(3),
    '& .MuiFormHelperText-root': {
      width: '100%',
      marginLeft: 0,
      marginRight: 0,
    },
  },
  fieldLabel: {
    fontSize: '1.1rem',
    fontWeight: 500,
    '& .MuiFormLabel-asterisk': {
      color: colors.blockingError,
    },
  },
  helperTextContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  helperTextChecking: {
    color: '#FFD700',
  },
  helperTextAvailable: {
    color: 'rgb(157, 209, 98)',
  },
  helperTextUnchanged: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  helperTextWarning: {
    color: '#FFD700',
  },
  helperTextUnavailable: {
    color: colors.blockingError,
  },
  characterCount: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
  },
  characterCountOverLimit: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    color: colors.blockingError,
  },
  descriptionField: {
    '& .MuiOutlinedInput-root': {
      resize: 'both',
      overflow: 'auto',
    },
  },
  visibilitySection: {
    marginTop: theme.spacing(2),
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
  compactRadioGroup: {
    flexDirection: 'row',
  },
  compactRadioLabel: {
    marginBottom: 0,
    marginLeft: 0,
    marginRight: theme.spacing(3),
  },
}));
