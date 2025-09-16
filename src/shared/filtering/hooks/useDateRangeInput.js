import { useState } from 'react';

/**
 * Date-based validation and clamping functions
 */
const validateAndClampDateRange = (start, end, min, max, setStart, setEnd) => {
  const errors = [];
  let clampedStart = start;
  let clampedEnd = end;

  if (start !== null && min !== undefined && start < min) {
    errors.push(`Start date cannot be before minimum date`);
    clampedStart = min;
    setStart(min);
  }

  if (end !== null && max !== undefined && end > max) {
    errors.push(`End date cannot be after maximum date`);
    clampedEnd = max;
    setEnd(max);
  }

  if (
    clampedStart !== null &&
    clampedEnd !== null &&
    clampedStart > clampedEnd
  ) {
    errors.push('Start date must be before or equal to end date');
  }

  return errors;
};

/**
 * Date range input hook for handling date validation
 * Works with day numbers, not timestamps
 */
const useDateRangeInput = ({
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  timeMin,
  step = 1,
}) => {
  // Date-specific validation messages
  const [startDateMessage, setStartDateMessage] = useState('');
  const [endDateMessage, setEndDateMessage] = useState('');

  // Helper function to show date validation message with auto-hide
  const showDateMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => setMessage(''), 3000);
  };

  // Date input blur handlers with validation and clamping
  const handleDateStartBlur = () => {
    const errors = validateAndClampDateRange(
      start,
      end,
      min,
      max,
      setStart,
      setEnd,
    );
    if (errors.length > 0) {
      showDateMessage(setStartDateMessage, errors[0]);
    }
  };

  const handleDateEndBlur = () => {
    const errors = validateAndClampDateRange(
      start,
      end,
      min,
      max,
      setStart,
      setEnd,
    );
    if (errors.length > 0) {
      showDateMessage(setEndDateMessage, errors[0]);
    }
  };

  return {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
  };
};

export default useDateRangeInput;
