import React from 'react';
import { Typography } from '@material-ui/core';
import {
  DateField,
  DateInput as AriaDateInput,
  DateSegment,
  Label,
  I18nProvider,
} from 'react-aria-components';
import { CalendarDate } from '@internationalized/date';
import {
  getUTCDateComponents,
  createUTCDate,
} from '../filtering/utils/dateHelpers';

// Inline styles to match Material-UI outlined TextField appearance
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Lato',
    position: 'relative',
  },
  dateFieldWrapper: {
    position: 'relative',
    borderRadius: '4px',
    border: '1px solid rgb(29, 54, 76)', // Exact MUI border color
    padding: '6.5px 14px', // Match Material-UI TextField size="small" padding
    transition: 'border-color 0.2s',
    color: 'white', // Input text always white
    minHeight: '40px', // Match TextField small height
    boxSizing: 'border-box',
  },
  datePickerLabel: {
    position: 'absolute',
    top: '-9px',
    left: '10px',
    fontSize: '0.75rem',
    color: '#9dd162', // Label always green
    backgroundColor: 'rgb(24, 69, 98)', // Exact modal background color
    padding: '0 4px',
    lineHeight: '1',
    zIndex: 1,
  },
  validationMessage: {
    fontSize: '0.75rem',
    color: '#f44336', // Material-UI error red
    marginTop: '4px',
    marginLeft: '14px',
  },
};

// Conversion helpers between Date and CalendarDate objects
const dateToCalendarDate = (date) => {
  const parts = getUTCDateComponents(date);
  return parts ? new CalendarDate(parts.year, parts.month, parts.day) : null;
};

const calendarDateToDate = (calendarDate) => {
  return calendarDate
    ? createUTCDate(calendarDate.year, calendarDate.month, calendarDate.day)
    : null;
};

/**
 * DateInput - A reusable date input component using react-aria-components
 *
 * Provides a segmented date input (YYYY/MM/DD format) with Material-UI styling.
 * Works with JavaScript Date objects for the application layer, converting
 * internally to/from CalendarDate for react-aria compatibility.
 *
 * @param {Object} props
 * @param {Date|null} props.minDate - Minimum selectable date (Date object)
 * @param {Date|null} props.maxDate - Maximum selectable date (Date object)
 * @param {Date|null} props.value - Current date value (Date object)
 * @param {function(Date|null):void} props.onChange - Callback when date changes
 * @param {function():void} [props.onBlur] - Optional callback when input loses focus
 * @param {string} [props.validationMessage] - Optional validation error message
 * @param {string} props.label - Label text for the input
 * @param {string} [props.id] - Optional HTML id attribute
 * @param {number} [props.width] - Optional width in pixels (default: auto)
 *
 * @example
 * import DateInput from 'shared/components/DateInput';
 *
 * function MyComponent() {
 *   const [date, setDate] = React.useState(new Date());
 *
 *   return (
 *     <DateInput
 *       value={date}
 *       onChange={setDate}
 *       label="Start Date"
 *       minDate={new Date(2020, 0, 1)}
 *       maxDate={new Date()}
 *       width={140}
 *     />
 *   );
 * }
 */
const DateInput = ({
  minDate,
  maxDate,
  value,
  onChange,
  onBlur,
  validationMessage,
  label,
  id,
  width,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  // Convert Date objects to CalendarDate for React ARIA
  const calendarValue = dateToCalendarDate(value);
  const calendarMinDate = dateToCalendarDate(minDate);
  const calendarMaxDate = dateToCalendarDate(maxDate);

  // Handle React ARIA DateField change - convert back to Date object
  const handleDateFieldChange = (calendarDate) => {
    const dateValue = calendarDateToDate(calendarDate);
    onChange(dateValue);
  };

  // Handle DateField focus
  const handleDateFieldFocus = () => {
    setIsFocused(true);
  };

  // Handle DateField blur
  const handleDateFieldBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  // Compute dynamic styles (only border changes on focus/error)
  const wrapperStyle = {
    ...styles.dateFieldWrapper,
    borderColor: validationMessage
      ? '#f44336'
      : isFocused
        ? '#9dd162'
        : 'rgb(29, 54, 76)', // Exact MUI border color
    borderWidth: isFocused ? '2px' : '1px',
    padding: isFocused ? '5.5px 13px' : '6.5px 14px', // Match TextField small padding (reduced by 1px when focused due to 2px border)
  };

  const labelStyle = {
    ...styles.datePickerLabel,
    color: validationMessage ? '#f44336' : '#9dd162', // Green normally, red on error
  };

  return (
    <I18nProvider locale="en-CA">
      <div
        style={{ ...styles.container, width: width ? `${width}px` : 'auto' }}
      >
        <div style={wrapperStyle}>
          <DateField
            className="custom-date-field"
            value={calendarValue}
            onChange={handleDateFieldChange}
            onFocus={handleDateFieldFocus}
            onBlur={handleDateFieldBlur}
            minValue={calendarMinDate}
            maxValue={calendarMaxDate}
            granularity="day"
            id={id}
            aria-label={label}
            isInvalid={!!validationMessage}
          >
            <Label style={labelStyle}>{label}</Label>
            <AriaDateInput>
              {(segment) => <DateSegment segment={segment} />}
            </AriaDateInput>
          </DateField>
        </div>
        {validationMessage && (
          <Typography variant="caption" style={styles.validationMessage}>
            {validationMessage}
          </Typography>
        )}
      </div>
    </I18nProvider>
  );
};

export default DateInput;
