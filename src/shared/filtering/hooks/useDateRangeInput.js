import { useState } from 'react';
import { formatDateToYearMonthDay } from '../utils/dateHelpers';

/**
 * Date-based validation and clamping functions
 */
const validateAndClampDateRange = (
  start,
  end,
  min,
  max,
  setStart,
  setEnd,
  isStartInput = false,
) => {
  const errors = [];
  let clampedStart = start;
  let clampedEnd = end;

  if (start !== null && min !== undefined && start < min) {
    errors.push(
      `Start date cannot be before minimum date of ${formatDateToYearMonthDay(min)}`,
    );
    clampedStart = min;
    setStart(min);
  }

  if (end !== null && max !== undefined && end > max) {
    errors.push(
      `End date cannot be after maximum date of ${formatDateToYearMonthDay(max)}`,
    );
    clampedEnd = max;
    setEnd(max);
  }

  // Implement clamping logic based on which input is being modified
  if (
    clampedStart !== null &&
    clampedEnd !== null &&
    clampedStart > clampedEnd
  ) {
    if (isStartInput) {
      // User is modifying start date and it exceeds end date - clamp start to end
      errors.push(
        `Start date must be before or equal to end date: ${formatDateToYearMonthDay(clampedEnd)}`,
      );
      setStart(clampedEnd);
    } else {
      // User is modifying end date and it's less than start date - clamp end to start
      errors.push(
        `End date must be after or equal to start date: ${formatDateToYearMonthDay(clampedStart)}`,
      );
      setEnd(clampedStart);
    }
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
      true, // isStartInput = true
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
      false, // isStartInput = false
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
