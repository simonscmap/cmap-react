import React from 'react';
import RangeSlider from '../components/RangeSlider';

const MILLISECONDS_PER_DAY = 86400000;

/**
 * Date-specific range slider that handles timestamp conversion internally
 * Provides a clean Date object API while using timestamps internally for the slider
 */
const DateRangeSlider = ({
  startDate, // Date object
  endDate, // Date object
  minDate, // Date object
  maxDate, // Date object
  onStartChange, // (date) => void
  onEndChange, // (date) => void
  disabled = false,
}) => {
  // Convert Date objects to timestamps for internal slider processing
  const startTimestamp = startDate ? startDate.getTime() : null;
  const endTimestamp = endDate ? endDate.getTime() : null;
  const minTimestamp = minDate ? minDate.getTime() : null;
  const maxTimestamp = maxDate ? maxDate.getTime() : null;

  // Format timestamp as yyyy/mm/dd for slider display
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

  // Handle slider changes - convert timestamps back to Date objects
  const handleSlider = (event, newValue) => {
    const [newStartTimestamp, newEndTimestamp] = newValue;

    if (onStartChange && newStartTimestamp !== startTimestamp) {
      onStartChange(new Date(newStartTimestamp));
    }

    if (onEndChange && newEndTimestamp !== endTimestamp) {
      onEndChange(new Date(newEndTimestamp));
    }
  };

  const handleSliderCommit = (event, newValue) => {
    // Use the same handler for commit
    handleSlider(event, newValue);
  };

  return (
    <RangeSlider
      min={minTimestamp}
      max={maxTimestamp}
      start={startTimestamp}
      end={endTimestamp}
      handleSlider={handleSlider}
      handleSliderCommit={handleSliderCommit}
      step={MILLISECONDS_PER_DAY}
      disabled={disabled || minTimestamp === maxTimestamp}
      unit=""
      formatLabel={formatTimestampForSlider}
      formatValueLabel={formatTimestampForSlider}
    />
  );
};

export default DateRangeSlider;
