import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import useDateRangeInput from '../../../hooks/useDateRangeInput';
import { RangeSlider } from '../components';
import RangeDateInput from './RangeDateInput';

const MILLISECONDS_PER_DAY = 86400000;

/**
 * Date range subset control component
 * Provides date picker inputs and a slider for selecting date ranges
 * Uses timestamps internally while maintaining a Date object API
 */
const DateRangeControl = ({
  title,
  startDate, // Date object
  endDate, // Date object
  minDate, // Date object
  maxDate, // Date object
  onStartChange, // (date) => void
  onEndChange, // (date) => void
  startLabel = 'Start Date',
  endLabel = 'End Date',
}) => {
  // Convert Date objects to timestamps for internal processing
  const startTimestamp = startDate ? startDate.getTime() : null;
  const endTimestamp = endDate ? endDate.getTime() : null;
  const minTimestamp = minDate ? minDate.getTime() : null;
  const maxTimestamp = maxDate ? maxDate.getTime() : null;

  // Wrapper functions to convert timestamps back to Date objects
  const handleStartChange = (timestamp) => {
    onStartChange(timestamp ? new Date(timestamp) : null);
  };

  const handleEndChange = (timestamp) => {
    onEndChange(timestamp ? new Date(timestamp) : null);
  };

  const {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
    handleSlider,
    handleSliderCommit,
    sliderStart,
    sliderEnd,
    formatSliderLabel,
    formatSliderValueLabel,
  } = useDateRangeInput({
    start: startTimestamp,
    end: endTimestamp,
    setStart: handleStartChange,
    setEnd: handleEndChange,
    min: minTimestamp,
    max: maxTimestamp,
    step: MILLISECONDS_PER_DAY,
  });

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <RangeDateInput
            minDate={minDate}
            maxDate={maxDate}
            value={startDate}
            onChange={onStartChange}
            onBlur={handleDateStartBlur}
            validationMessage={startDateMessage}
            label={startLabel}
            id={`dateInputStart${title.replace(/[^a-zA-Z0-9]/g, '')}`}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <RangeDateInput
            minDate={minDate}
            maxDate={maxDate}
            value={endDate}
            onChange={onEndChange}
            onBlur={handleDateEndBlur}
            validationMessage={endDateMessage}
            label={endLabel}
            id={`dateInputEnd${title.replace(/[^a-zA-Z0-9]/g, '')}`}
          />
        </Grid>
      </Grid>
      <RangeSlider
        min={minTimestamp}
        max={maxTimestamp}
        start={sliderStart}
        end={sliderEnd}
        handleSlider={handleSlider}
        handleSliderCommit={handleSliderCommit}
        step={MILLISECONDS_PER_DAY}
        disabled={minTimestamp === maxTimestamp}
        unit=""
        formatLabel={formatSliderLabel}
        formatValueLabel={formatSliderValueLabel}
      />
    </React.Fragment>
  );
};

export default DateRangeControl;
