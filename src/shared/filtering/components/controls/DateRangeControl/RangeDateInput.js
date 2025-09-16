import React from 'react';
import { Typography } from '@material-ui/core';
import {
  DateField,
  DateInput,
  DateSegment,
  Label,
  I18nProvider,
} from 'react-aria-components';
import { CalendarDate } from '@internationalized/date';
import styles from '../../../styles/subsetControlStyles';

// Conversion helpers between Date and CalendarDate objects
const dateToCalendarDate = (date) => {
  if (!date) return null;
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
};

const calendarDateToDate = (calendarDate) => {
  if (!calendarDate) return null;
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
};

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
  // Convert Date objects to CalendarDate for React ARIA
  const calendarValue = dateToCalendarDate(value);
  const calendarMinDate = dateToCalendarDate(minDate);
  const calendarMaxDate = dateToCalendarDate(maxDate);

  // Handle React ARIA DateField change - convert back to Date object
  const handleDateFieldChange = (calendarDate) => {
    const dateValue = calendarDateToDate(calendarDate);
    onChange(dateValue);
  };

  // Handle DateField blur
  const handleDateFieldBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <I18nProvider locale="en-US">
      <div style={styles.latInputContainer}>
        <div style={styles.datePickerContainer}>
          <div style={styles.datePickerField}>
            <div
              className={`date-picker-container ${validationMessage ? 'error' : ''}`}
            >
              <DateField
                value={calendarValue}
                onChange={handleDateFieldChange}
                onBlur={handleDateFieldBlur}
                minValue={calendarMinDate}
                maxValue={calendarMaxDate}
                granularity="day"
                id={id}
                aria-label={label}
                isInvalid={!!validationMessage}
              >
                <Label style={styles.datePickerLabel}>{label}</Label>
                <DateInput>
                  {(segment) => <DateSegment segment={segment} />}
                </DateInput>
              </DateField>
              <div className="date-picker-underline" />
            </div>
          </div>
        </div>
        <Typography variant="caption" style={styles.validationMessage}>
          {validationMessage || ''}
        </Typography>
      </div>
    </I18nProvider>
  );
};

export default RangeDateInput;
