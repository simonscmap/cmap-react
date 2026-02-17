import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../enums/colors';

const useCompactRangeInputStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    width: '100%',
  },
  inputRow: {
    display: 'flex',
    gap: theme.spacing(1.5),
  },
  inputWrapper: {
    flex: 1,
  },
  textField: {
    width: '100%',
  },
  textFieldError: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: colors.blockingError,
      },
      '&:hover fieldset': {
        borderColor: colors.blockingError,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.blockingError,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.blockingError,
    },
  },
  sliderBox: {
    paddingLeft: 4,
    paddingRight: 4,
    '& .MuiSlider-root': {
      margin: '0 0 8px 0',
    },
    '& .MuiSlider-valueLabel': {
      fontSize: '0.4rem',
    },
  },
  boundsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -theme.spacing(1.5),
  },
  boundLabel: {
    fontSize: '0.75rem',
    color: theme.palette.primary.main,
  },
  trackInverted: {
    '& .MuiSlider-track': {
      backgroundColor: '#4d6d4d',
    },
    '& .MuiSlider-rail': {
      backgroundColor: '#9dd162',
      opacity: 1,
    },
  },
  sectionTitle: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: theme.palette.common.white,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: theme.spacing(2),
  },
}));

export default useCompactRangeInputStyles;
