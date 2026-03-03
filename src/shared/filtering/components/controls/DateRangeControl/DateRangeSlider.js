import React from 'react';
import RangeSlider from '../components/RangeSlider';
import { dateToUTCSlashString } from '../../../utils/dateHelpers';

const MILLISECONDS_PER_DAY = 86400000;

// Floor timestamp to start of UTC day to align with calendar day display.
const floorToDay = (timestamp) => {
  return Math.floor(timestamp / MILLISECONDS_PER_DAY) * MILLISECONDS_PER_DAY;
};

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
  onCommit, // () => void - called on slider commit (mouseup/touchend)
  disabled = false,
  showMarks = true,
}) => {
  // Convert Date objects to timestamps for internal slider processing
  const startTimestamp = startDate ? floorToDay(startDate.getTime()) : null;
  const endTimestamp = endDate ? floorToDay(endDate.getTime()) : null;
  const minTimestamp = minDate ? floorToDay(minDate.getTime()) : null;
  const maxTimestamp = maxDate ? floorToDay(maxDate.getTime()) : null;

  const formatTimestampForSlider = (timestamp) => {
    if (timestamp === null || timestamp === undefined) return '';
    return dateToUTCSlashString(timestamp);
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

  const handleSliderCommit = () => {
    if (onCommit) {
      onCommit();
    }
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
      showMarks={showMarks}
    />
  );
};

export default DateRangeSlider;
