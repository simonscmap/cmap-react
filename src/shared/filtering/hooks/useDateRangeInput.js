import { useState } from 'react';
import { formatDateToYearMonthDay, dateToUTCDateString } from '../utils/dateHelpers';

/**
 * Date-based validation and clamping functions
 */
const validateAndClampDateRange = (
  start,
  end,
  min,
  max,
  isStartInput = false,
) => {
  const errors = [];
  let clampedStart = start;
  let clampedEnd = end;

  if (start !== null && min !== undefined && dateToUTCDateString(start) < dateToUTCDateString(min)) {
    errors.push(
      `Start date cannot be before minimum date of ${formatDateToYearMonthDay(min)}`,
    );
    clampedStart = min;
  }

  if (end !== null && max !== undefined && dateToUTCDateString(end) > dateToUTCDateString(max)) {
    errors.push(
      `End date cannot be after maximum date of ${formatDateToYearMonthDay(max)}`,
    );
    clampedEnd = max;
  }

  // Implement clamping logic based on which input is being modified
  if (
    clampedStart !== null &&
    clampedEnd !== null &&
    dateToUTCDateString(clampedStart) > dateToUTCDateString(clampedEnd)
  ) {
    if (isStartInput) {
      // User is modifying start date and it exceeds end date - clamp start to end
      errors.push(
        `Start date must be before or equal to end date: ${formatDateToYearMonthDay(clampedEnd)}`,
      );
      clampedStart = clampedEnd;
    } else {
      // User is modifying end date and it's less than start date - clamp end to start
      errors.push(
        `End date must be after or equal to start date: ${formatDateToYearMonthDay(clampedStart)}`,
      );
      clampedEnd = clampedStart;
    }
  }

  return { errors, clampedStart, clampedEnd };
};

/**
 * Date range input hook for handling date validation
 * Works with day numbers, not timestamps
 */
const useDateRangeInput = ({
  localStart,
  localEnd,
  committedStart,
  committedEnd,
  setStart,
  setEnd,
  min,
  max,
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
    const { errors, clampedStart } = validateAndClampDateRange(
      localStart,
      localEnd,
      min,
      max,
      true, // isStartInput = true
    );
    if (dateToUTCDateString(clampedStart) !== dateToUTCDateString(committedStart)) {
      setStart(clampedStart);
    }
    if (errors.length > 0) {
      showDateMessage(setStartDateMessage, errors[0]);
    }
  };

  const handleDateEndBlur = () => {
    const { errors, clampedEnd } = validateAndClampDateRange(
      localStart,
      localEnd,
      min,
      max,
      false, // isStartInput = false
    );
    if (dateToUTCDateString(clampedEnd) !== dateToUTCDateString(committedEnd)) {
      setEnd(clampedEnd);
    }
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
