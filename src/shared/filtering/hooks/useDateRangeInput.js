import { useState, useEffect, useMemo } from 'react';
import useRangeInput from './useRangeInput';
import {
  dayToDateString,
  dateToDay,
  extractDateFromString,
} from '../utils/dateHelpers';

/**
 * Date conversion utilities using timeMin-based day numbers
 */
const toDate = (dayNumber, timeMin) => {
  if (dayNumber === null || dayNumber === undefined || !timeMin) return null;
  try {
    const dateString = dayToDateString(timeMin, dayNumber);
    return extractDateFromString(dateString);
  } catch (error) {
    return null;
  }
};

const toDayNumber = (date, timeMin) => {
  if (!date || !timeMin) return null;
  try {
    return dateToDay(timeMin, date);
  } catch (error) {
    return null;
  }
};

const formatDateString = (dayNumber, timeMin) => {
  if (dayNumber === null || dayNumber === undefined || !timeMin) return '';
  try {
    return dayToDateString(timeMin, dayNumber);
  } catch (error) {
    return '';
  }
};

const parseDateString = (dateString, timeMin) => {
  if (!dateString || typeof dateString !== 'string' || !timeMin) return null;

  // Try to parse the date string
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return toDayNumber(date, timeMin);
};

/**
 * Date-specific validation functions
 */
const validateDateRange = (startDayNumber, endDayNumber, min, max, timeMin) => {
  const errors = [];

  if (startDayNumber !== null && min !== undefined && startDayNumber < min) {
    errors.push(
      `Start date cannot be before ${formatDateString(min, timeMin)}`,
    );
  }

  if (endDayNumber !== null && max !== undefined && endDayNumber > max) {
    errors.push(`End date cannot be after ${formatDateString(max, timeMin)}`);
  }

  if (
    startDayNumber !== null &&
    endDayNumber !== null &&
    startDayNumber > endDayNumber
  ) {
    errors.push('Start date must be before or equal to end date');
  }

  return errors;
};

/**
 * Enhanced hook that wraps useRangeInput with date-specific functionality
 *
 * Provides:
 * - Date conversion layer (day numbers ↔ date strings)
 * - Date-specific validation
 * - Formatted date strings for display
 * - Date parsing with error handling
 */
const useDateRangeInput = ({
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  timeMin, // Base date for day number calculations
  step = 1, // Days are discrete units
}) => {
  // Use the base range input hook for core functionality
  const rangeInput = useRangeInput({
    start,
    end,
    setStart,
    setEnd,
    min,
    max,
    step,
  });

  // Local state for date input values (formatted strings)
  const [localStartDateValue, setLocalStartDateValue] = useState('');
  const [localEndDateValue, setLocalEndDateValue] = useState('');

  // Date-specific validation messages
  const [startDateMessage, setStartDateMessage] = useState('');
  const [endDateMessage, setEndDateMessage] = useState('');

  // Update local date values when committed values change
  useEffect(() => {
    setLocalStartDateValue(
      start === null ? '' : formatDateString(start, timeMin),
    );
  }, [start, timeMin]);

  useEffect(() => {
    setLocalEndDateValue(end === null ? '' : formatDateString(end, timeMin));
  }, [end, timeMin]);

  // Computed formatted date values for display
  const formattedDates = useMemo(
    () => ({
      startDate: start !== null ? formatDateString(start, timeMin) : '',
      endDate: end !== null ? formatDateString(end, timeMin) : '',
      sliderStartDate:
        rangeInput.sliderStart !== null
          ? formatDateString(rangeInput.sliderStart, timeMin)
          : '',
      sliderEndDate:
        rangeInput.sliderEnd !== null
          ? formatDateString(rangeInput.sliderEnd, timeMin)
          : '',
    }),
    [start, end, rangeInput.sliderStart, rangeInput.sliderEnd, timeMin],
  );

  // Helper function to show date validation message with auto-hide
  const showDateMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => setMessage(''), 3000);
  };

  // Date input change handlers
  const handleDateStartChange = (dateValue) => {
    setLocalStartDateValue(dateValue);
  };

  const handleDateEndChange = (dateValue) => {
    setLocalEndDateValue(dateValue);
  };

  // Date input blur handlers with validation
  const handleDateStartBlur = () => {
    const dayNumber = parseDateString(localStartDateValue, timeMin);

    if (localStartDateValue.trim() === '') {
      // Handle empty field - restore to min or default
      const defaultValue = min !== undefined ? min : 0;
      setStart(defaultValue);
      setLocalStartDateValue(formatDateString(defaultValue, timeMin));
      showDateMessage(setStartDateMessage, 'Restored to minimum date');
      return;
    }

    if (dayNumber === null) {
      showDateMessage(setStartDateMessage, 'Invalid date format');
      setLocalStartDateValue(formatDateString(start, timeMin)); // Restore previous valid value
      return;
    }

    // Apply validation
    const errors = validateDateRange(dayNumber, end, min, max, timeMin);
    if (errors.length > 0) {
      showDateMessage(setStartDateMessage, errors[0]);
      // Apply clamping
      let clampedValue = dayNumber;
      if (min !== undefined && dayNumber < min) clampedValue = min;
      if (end !== null && dayNumber > end) clampedValue = end;
      setStart(clampedValue);
      setLocalStartDateValue(formatDateString(clampedValue, timeMin));
    } else {
      setStart(dayNumber);
    }
  };

  const handleDateEndBlur = () => {
    const dayNumber = parseDateString(localEndDateValue, timeMin);

    if (localEndDateValue.trim() === '') {
      // Handle empty field - restore to max or default
      const defaultValue =
        max !== undefined ? max : toDayNumber(new Date(), timeMin);
      setEnd(defaultValue);
      setLocalEndDateValue(formatDateString(defaultValue, timeMin));
      showDateMessage(setEndDateMessage, 'Restored to maximum date');
      return;
    }

    if (dayNumber === null) {
      showDateMessage(setEndDateMessage, 'Invalid date format');
      setLocalEndDateValue(formatDateString(end, timeMin)); // Restore previous valid value
      return;
    }

    // Apply validation
    const errors = validateDateRange(start, dayNumber, min, max, timeMin);
    if (errors.length > 0) {
      showDateMessage(setEndDateMessage, errors[0]);
      // Apply clamping
      let clampedValue = dayNumber;
      if (max !== undefined && dayNumber > max) clampedValue = max;
      if (start !== null && dayNumber < start) clampedValue = start;
      setEnd(clampedValue);
      setLocalEndDateValue(formatDateString(clampedValue, timeMin));
    } else {
      setEnd(dayNumber);
    }
  };

  // Date formatter functions for slider
  const formatSliderLabel = (dayNumber) => {
    return formatDateString(dayNumber, timeMin);
  };

  const formatSliderValueLabel = (dayNumber) => {
    return formatDateString(dayNumber, timeMin);
  };

  return {
    // Inherit all base range input functionality
    ...rangeInput,

    // Date-specific input values and handlers
    localStartDateValue,
    localEndDateValue,
    handleDateStartChange,
    handleDateEndChange,
    handleDateStartBlur,
    handleDateEndBlur,

    // Date-specific validation messages
    startDateMessage,
    endDateMessage,

    // Formatted date strings for display
    ...formattedDates,

    // Slider date formatters
    formatSliderLabel,
    formatSliderValueLabel,

    // Date utility functions (exposed for component use)
    dateUtils: {
      toDate: (dayNumber) => toDate(dayNumber, timeMin),
      toDayNumber: (date) => toDayNumber(date, timeMin),
      formatDateString: (dayNumber) => formatDateString(dayNumber, timeMin),
      parseDateString: (dateString) => parseDateString(dateString, timeMin),
      validateDateRange: (startDayNumber, endDayNumber, min, max) =>
        validateDateRange(startDayNumber, endDayNumber, min, max, timeMin),
    },
  };
};

export default useDateRangeInput;
