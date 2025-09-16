import { useState } from 'react';

/**
 * Date-based validation functions
 */
const validateDateRange = (start, end, min, max, timeMin) => {
  const errors = [];

  if (start !== null && min !== undefined && start < min) {
    errors.push(`Start date cannot be before minimum date`);
  }

  if (end !== null && max !== undefined && end > max) {
    errors.push(`End date cannot be after maximum date`);
  }

  if (start !== null && end !== null && start > end) {
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

  // Date input blur handlers with validation
  const handleDateStartBlur = () => {
    const errors = validateDateRange(start, end, min, max, timeMin);
    if (errors.length > 0) {
      showDateMessage(setStartDateMessage, errors[0]);
    }
  };

  const handleDateEndBlur = () => {
    const errors = validateDateRange(start, end, min, max, timeMin);
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
