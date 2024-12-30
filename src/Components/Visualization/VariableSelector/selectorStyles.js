import colors from '../../../enums/colors';
import z from '../../../enums/zIndex';

const styles = (theme) => ({
  inputRoot: {
    border: `1px solid ${colors.primary}`,
  },

  autocompletePopperPaper: {
    backgroundColor: 'black',
    zIndex: z.CONTROL_SECONDARY,
  },

  autocompleteOptions: {
    '&[data-focus="true"]': {
      backgroundColor: colors.greenHover,
    },
    textAlign: 'left',
  },

  resetButton: {
    textTransform: 'none',
    width: '160px',
    height: '37px',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    marginTop: '12px',
  },

  searchPanelRow: {
    marginTop: '10px',
  },

  formControl: {
    width: '90%',
    marginBottom: '6px',
  },

  autoComplete: {
    width: 'calc(100% - 48px)',
  },

  showAdvancedWrapper: {
    textAlign: 'left',
    marginTop: '16px',
    width: '100%',
  },

  regionSelectorInput: {
    fontSize: '13px',
  },

  addBorder: {
    border: `1px solid ${colors.primary}`,
  },

  shiftedAutocompletePopper: {
    height: '400px',
    width: '500px',
    position: 'absolute',
    bottom: '190px',
  },

  shiftedAutocompletePaper: {
    minHeight: '400px',
  },

  shiftedAutocompleteListbox: {
    maxHeight: 0,
    minHeight: '400px',
    overflowX: 'hidden',
  },

  closeIcon: {
    float: 'right',
    cursor: 'pointer',
    color: colors.primary,
    textTransform: 'none',
    fontSize: '15px',
  },
});

export default styles;
