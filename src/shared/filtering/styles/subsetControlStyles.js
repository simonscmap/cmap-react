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
  // DatePicker styling to match TextField
  datePickerWrapper: {
    position: 'relative',
    '& .custom-date-picker': {
      '& .react-date-picker__inputGroup': {
        fontSize: '13px',
        padding: '2px 0',
        border: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
        borderRadius: '0',
        background: 'transparent',
        minHeight: '19px',
      },
      '& .react-date-picker__inputGroup__input': {
        fontSize: '13px',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        padding: '0',
        margin: '0 1px',
        color: 'rgba(0, 0, 0, 0.87)',
      },
      '& .react-date-picker__inputGroup__divider': {
        color: 'rgba(0, 0, 0, 0.54)',
      },
      '& .react-date-picker__clear-button': {
        display: 'none',
      },
      '& .react-date-picker__calendar-button': {
        display: 'none',
      },
    },
    '& .custom-date-picker.error': {
      '& .react-date-picker__inputGroup': {
        borderBottom: '2px solid #f44336',
      },
      '& .react-date-picker__inputGroup__input': {
        color: '#f44336',
      },
    },
  },
  datePickerLabel: {
    position: 'absolute',
    top: '-16px',
    left: '0',
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.54)',
    transition: 'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: '0.00938em',
  },
};

export default styles;
