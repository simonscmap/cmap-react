import React from 'react';
import { Typography } from '@material-ui/core';
import DatePicker from 'react-date-picker';
import styles from '../../../styles/subsetControlStyles';
import '../../../styles/DatePickerStyles.css';

const RangeDateInput = ({
  minDate,
  maxDate,
  value, // Date object
  onChange, // (date) => void
  onBlur,
  validationMessage,
  label,
  id,
}) => {
  // Handle DatePicker change - directly pass Date object
  const handleDatePickerChange = (date) => {
    onChange(date);
  };

  // Handle DatePicker blur - call onBlur directly
  const handleDatePickerBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <div style={styles.latInputContainer}>
      <div style={styles.datePickerContainer}>
        <label style={styles.datePickerLabel}>{label}</label>
        <div style={styles.datePickerField}>
          <div
            className={`date-picker-container ${validationMessage ? 'error' : ''}`}
          >
            <DatePicker
              shouldOpenCalendar={() => false}
              calendarIcon={null}
              clearIcon={null}
              value={value}
              onChange={handleDatePickerChange}
              onBlur={handleDatePickerBlur}
              format="yyyy/MM/dd"
              className="custom-date-picker"
              minDate={minDate}
              maxDate={maxDate}
              id={id}
            />
            <div className="date-picker-underline" />
          </div>
        </div>
      </div>
      <Typography variant="caption" style={styles.validationMessage}>
        {validationMessage || ''}
      </Typography>
    </div>
  );
};

export default RangeDateInput;
