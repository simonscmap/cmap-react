import { useState, useEffect, useMemo } from 'react';
import useRangeInput from './useRangeInput';
import {
  dayToDateString,
  dayToSliderDateString,
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

const formatSliderDateString = (dayNumber, timeMin) => {
  if (dayNumber === null || dayNumber === undefined || !timeMin) return '';
  try {
    return dayToSliderDateString(timeMin, dayNumber);
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

  // Date-specific validation messages
  const [startDateMessage, setStartDateMessage] = useState('');
  const [endDateMessage, setEndDateMessage] = useState('');

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

  // Date input blur handlers with validation
  const handleDateStartBlur = () => {
    // Apply validation for start date
    const errors = validateDateRange(start, end, min, max, timeMin);
    if (errors.length > 0) {
      showDateMessage(setStartDateMessage, errors[0]);
    }
  };

  const handleDateEndBlur = () => {
    // Apply validation for end date
    const errors = validateDateRange(start, end, min, max, timeMin);
    if (errors.length > 0) {
      showDateMessage(setEndDateMessage, errors[0]);
    }
  };

  // Date formatter functions for slider
  const formatSliderLabel = (dayNumber) => {
    return formatSliderDateString(dayNumber, timeMin);
  };

  const formatSliderValueLabel = (dayNumber) => {
    return formatSliderDateString(dayNumber, timeMin);
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
