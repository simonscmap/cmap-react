import React from 'react';
import { Typography } from '@material-ui/core';
import DatePicker from 'react-date-picker';
import {
  dayToDateString,
  extractDateFromString,
  dateToDay,
} from '../../../utils/dateHelpers';
import styles from '../../../styles/subsetControlStyles';
import '../../../styles/DatePickerStyles.css';

const RangeDateInput = ({
  min,
  max,
  displayValue, // This will be a day number
  handleChange,
  handleBlur,
  validationMessage,
  label,
  id,
  timeMin, // Base date for day number calculations
}) => {
  // Convert day number to Date object for DatePicker
  const dayNumberToDate = (dayNumber) => {
    if (dayNumber === '' || dayNumber === null || dayNumber === undefined) {
      return null;
    }
    try {
      const dateString = dayToDateString(timeMin, dayNumber);
      return extractDateFromString(dateString);
    } catch (error) {
      return null;
    }
  };

  // Convert Date object back to day number
  const dateToDayNumber = (date) => {
    if (!date || !timeMin) {
      return '';
    }
    try {
      return dateToDay(timeMin, date);
    } catch (error) {
      return '';
    }
  };

  // Handle DatePicker change
  const handleDatePickerChange = (date) => {
    const dayNumber = dateToDayNumber(date);
    // Create a synthetic event to match the expected interface
    const syntheticEvent = {
      target: {
        value: dayNumber,
        id: id,
      },
    };
    handleChange(syntheticEvent);
  };

  // Handle DatePicker blur
  const handleDatePickerBlur = () => {
    if (handleBlur) {
      const syntheticEvent = {
        target: {
          value: displayValue,
          id: id,
        },
      };
      handleBlur(syntheticEvent);
    }
  };

  // Convert min/max day numbers to Date objects for DatePicker constraints
  const minDate = min !== undefined ? dayNumberToDate(min) : null;
  const maxDate = max !== undefined ? dayNumberToDate(max) : null;
  const currentDate = dayNumberToDate(displayValue);

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
              value={currentDate}
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
