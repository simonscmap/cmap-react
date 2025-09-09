const styles = {
  relative: {
    position: 'relative',
  },
  sliderValueLabel: {
    top: -22,
    '& *': {
      background: 'transparent',
      color: '#9dd162',
    },
    left: -14,
  },
  slider: {
    margin: '4px 8px 8px 0px',
  },
  sliderThumb: {
    borderRadius: '0px',
    height: '16px',
    width: '3px',
    marginLeft: 0,
    marginTop: '-7px',
  },
  markLabel: {
    top: 30,
    fontSize: '.7rem',
  },
  input: {
    fontSize: '13px',
    padding: '2px 0',
  },
  formGrid: {
    marginTop: '16px',
  },
  formLabel: {
    marginTop: '13px',
    fontSize: '.92rem',
  },
  // Message styles from DateSubsetControl
  messageContainer: {
    position: 'absolute',
    bottom: '45px',
    padding: '5px 10px',
    borderRadius: '5px',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '.5em',
    fontSize: '.9em',
  },
  messageArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    bottom: '-10px',
    borderRight: '5px solid transparent',
    borderLeft: '5px solid transparent',
    borderTop: '10px solid rgba(0,0,0,0.2)',
  },
  prohibitedIcon: {
    color: '#d16265',
  },
  // Custom styles for react-date-picker to match Material-UI TextField appearance
  datePickerContainer: {
    position: 'relative',
    width: '100%',
    marginTop: '13px', // Match formLabel marginTop
  },
  datePickerLabel: {
    fontSize: '.72rem',
    color: '#9dd162', // Green color to match other labels
    marginBottom: '4px',
    display: 'block',
  },
  datePickerField: {
    position: 'relative',
    width: '100%',
  },
  // Latitude input container styles
  latInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  // Validation message styles
  validationMessage: {
    fontSize: '0.75rem',
    color: 'white',
    minWidth: '120px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
  },
};

export default styles;
