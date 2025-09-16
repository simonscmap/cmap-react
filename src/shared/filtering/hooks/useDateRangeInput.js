import { useState, useMemo } from 'react';
import useRangeInput from './useRangeInput';

/**
 * Timestamp formatting utilities for slider display
 */
const formatTimestampForSlider = (timestamp) => {
  if (timestamp === null || timestamp === undefined) return '';
  try {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch (error) {
    return '';
  }
};

/**
 * Timestamp-based validation functions
 */
const validateDateRange = (startTimestamp, endTimestamp, min, max) => {
  const errors = [];

  if (startTimestamp !== null && min !== undefined && startTimestamp < min) {
    const minDate = new Date(min);
    errors.push(
      `Start date cannot be before ${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`,
    );
  }

  if (endTimestamp !== null && max !== undefined && endTimestamp > max) {
    const maxDate = new Date(max);
    errors.push(
      `End date cannot be after ${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`,
    );
  }

  if (
    startTimestamp !== null &&
    endTimestamp !== null &&
    startTimestamp > endTimestamp
  ) {
    errors.push('Start date must be before or equal to end date');
  }

  return errors;
};

/**
 * Enhanced hook that wraps useRangeInput with timestamp-specific functionality
 *
 * Provides:
 * - Timestamp validation
 * - Formatted date strings for slider display
 * - Direct timestamp handling
 */
const useDateRangeInput = ({
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  step = 86400000, // Milliseconds per day
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

  // Date-specific validation messages
  const [startDateMessage, setStartDateMessage] = useState('');
  const [endDateMessage, setEndDateMessage] = useState('');

  // Computed formatted date values for display
  const formattedDates = useMemo(
    () => ({
      startDate: start !== null ? formatTimestampForSlider(start) : '',
      endDate: end !== null ? formatTimestampForSlider(end) : '',
      sliderStartDate:
        rangeInput.sliderStart !== null
          ? formatTimestampForSlider(rangeInput.sliderStart)
          : '',
      sliderEndDate:
        rangeInput.sliderEnd !== null
          ? formatTimestampForSlider(rangeInput.sliderEnd)
          : '',
    }),
    [start, end, rangeInput.sliderStart, rangeInput.sliderEnd],
  );

  // Helper function to show date validation message with auto-hide
  const showDateMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => setMessage(''), 3000);
  };

  // Date input blur handlers with validation
  const handleDateStartBlur = () => {
    // Apply validation for start date
    const errors = validateDateRange(start, end, min, max);
    if (errors.length > 0) {
      showDateMessage(setStartDateMessage, errors[0]);
    }
  };

  const handleDateEndBlur = () => {
    // Apply validation for end date
    const errors = validateDateRange(start, end, min, max);
    if (errors.length > 0) {
      showDateMessage(setEndDateMessage, errors[0]);
    }
  };

  // Timestamp formatter functions for slider
  const formatSliderLabel = (timestamp) => {
    return formatTimestampForSlider(timestamp);
  };

  const formatSliderValueLabel = (timestamp) => {
    return formatTimestampForSlider(timestamp);
  };

  return {
    // Inherit all base range input functionality
    ...rangeInput,

    // Date-specific blur handlers
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
  };
};

export default useDateRangeInput;
