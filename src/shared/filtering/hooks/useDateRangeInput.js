import { useState, useEffect, useMemo } from 'react';
import useRangeInput from './useRangeInput';

/**
 * Date conversion utilities
 */
const toDate = (dayNumber) => {
  if (dayNumber === null || dayNumber === undefined) return null;
  const date = new Date('1970-01-01');
  date.setUTCDate(date.getUTCDate() + dayNumber);
  return date;
};

const toDayNumber = (date) => {
  if (!date) return null;
  const epoch = new Date('1970-01-01');
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - epoch.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const formatDateString = (dayNumber) => {
  const date = toDate(dayNumber);
  if (!date) return '';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;

  // Try to parse the date string
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return toDayNumber(date);
};

/**
 * Date-specific validation functions
 */
const validateDateRange = (startDayNumber, endDayNumber, min, max) => {
  const errors = [];

  if (startDayNumber !== null && min !== undefined && startDayNumber < min) {
    errors.push(`Start date cannot be before ${formatDateString(min)}`);
  }

  if (endDayNumber !== null && max !== undefined && endDayNumber > max) {
    errors.push(`End date cannot be after ${formatDateString(max)}`);
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
    setLocalStartDateValue(start === null ? '' : formatDateString(start));
  }, [start]);

  useEffect(() => {
    setLocalEndDateValue(end === null ? '' : formatDateString(end));
  }, [end]);

  // Computed formatted date values for display
  const formattedDates = useMemo(
    () => ({
      startDate: start !== null ? formatDateString(start) : '',
      endDate: end !== null ? formatDateString(end) : '',
      sliderStartDate:
        rangeInput.sliderStart !== null
          ? formatDateString(rangeInput.sliderStart)
          : '',
      sliderEndDate:
        rangeInput.sliderEnd !== null
          ? formatDateString(rangeInput.sliderEnd)
          : '',
    }),
    [start, end, rangeInput.sliderStart, rangeInput.sliderEnd],
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
    const dayNumber = parseDateString(localStartDateValue);

    if (localStartDateValue.trim() === '') {
      // Handle empty field - restore to min or default
      const defaultValue = min !== undefined ? min : 0;
      setStart(defaultValue);
      setLocalStartDateValue(formatDateString(defaultValue));
      showDateMessage(setStartDateMessage, 'Restored to minimum date');
      return;
    }

    if (dayNumber === null) {
      showDateMessage(setStartDateMessage, 'Invalid date format');
      setLocalStartDateValue(formatDateString(start)); // Restore previous valid value
      return;
    }

    // Apply validation
    const errors = validateDateRange(dayNumber, end, min, max);
    if (errors.length > 0) {
      showDateMessage(setStartDateMessage, errors[0]);
      // Apply clamping
      let clampedValue = dayNumber;
      if (min !== undefined && dayNumber < min) clampedValue = min;
      if (end !== null && dayNumber > end) clampedValue = end;
      setStart(clampedValue);
      setLocalStartDateValue(formatDateString(clampedValue));
    } else {
      setStart(dayNumber);
    }
  };

  const handleDateEndBlur = () => {
    const dayNumber = parseDateString(localEndDateValue);

    if (localEndDateValue.trim() === '') {
      // Handle empty field - restore to max or default
      const defaultValue = max !== undefined ? max : toDayNumber(new Date());
      setEnd(defaultValue);
      setLocalEndDateValue(formatDateString(defaultValue));
      showDateMessage(setEndDateMessage, 'Restored to maximum date');
      return;
    }

    if (dayNumber === null) {
      showDateMessage(setEndDateMessage, 'Invalid date format');
      setLocalEndDateValue(formatDateString(end)); // Restore previous valid value
      return;
    }

    // Apply validation
    const errors = validateDateRange(start, dayNumber, min, max);
    if (errors.length > 0) {
      showDateMessage(setEndDateMessage, errors[0]);
      // Apply clamping
      let clampedValue = dayNumber;
      if (max !== undefined && dayNumber > max) clampedValue = max;
      if (start !== null && dayNumber < start) clampedValue = start;
      setEnd(clampedValue);
      setLocalEndDateValue(formatDateString(clampedValue));
    } else {
      setEnd(dayNumber);
    }
  };

  // Date formatter functions for slider
  const formatSliderLabel = (dayNumber) => {
    return formatDateString(dayNumber);
  };

  const formatSliderValueLabel = (dayNumber) => {
    return formatDateString(dayNumber);
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
      toDate,
      toDayNumber,
      formatDateString,
      parseDateString,
      validateDateRange,
    },
  };
};

export default useDateRangeInput;
