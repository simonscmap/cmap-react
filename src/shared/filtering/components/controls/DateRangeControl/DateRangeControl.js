import React, { useState, useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import useDateRangeInput from '../../../hooks/useDateRangeInput';
import DateRangeSlider from './DateRangeSlider';
import DateRangeInput from './DateDateInput';

/**
 * Date range subset control component
 * Provides date picker inputs and a slider for selecting date ranges
 * Works directly with Date objects
 */
const DateRangeControl = ({
  title,
  startDate, // Date object
  endDate, // Date object
  setStartDate, // (date) => void
  setEndDate, // (date) => void
  minDate, // Date object
  maxDate, // Date object
  startLabel = 'Start Date',
  endLabel = 'End Date',
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  useEffect(() => {
    setLocalStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    setLocalEndDate(endDate);
  }, [endDate]);

  // Handle date changes
  const handleStartChange = (date) => {
    setLocalStartDate(date);
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setLocalEndDate(date);
    setEndDate(date);
  };

  const handleSliderStartChange = (date) => {
    setLocalStartDate(date);
  };

  const handleSliderEndChange = (date) => {
    setLocalEndDate(date);
  };

  const handleSliderCommit = () => {
    if (localStartDate !== startDate) {
      setStartDate(localStartDate);
    }
    if (localEndDate !== endDate) {
      setEndDate(localEndDate);
    }
  };

  const {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
  } = useDateRangeInput({
    start: startDate,
    end: endDate,
    setStart: setStartDate,
    setEnd: setEndDate,
    min: minDate,
    max: maxDate,
  });

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <DateRangeInput
            minDate={minDate}
            maxDate={maxDate}
            value={localStartDate}
            onChange={handleStartChange}
            onBlur={handleDateStartBlur}
            validationMessage={startDateMessage}
            label={startLabel}
            id={`dateInputStart${title.replace(/[^a-zA-Z0-9]/g, '')}`}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <DateRangeInput
            minDate={minDate}
            maxDate={maxDate}
            value={localEndDate}
            onChange={handleEndChange}
            onBlur={handleDateEndBlur}
            validationMessage={endDateMessage}
            label={endLabel}
            id={`dateInputEnd${title.replace(/[^a-zA-Z0-9]/g, '')}`}
          />
        </Grid>
      </Grid>
      <DateRangeSlider
        startDate={localStartDate}
        endDate={localEndDate}
        minDate={minDate}
        maxDate={maxDate}
        onStartChange={handleSliderStartChange}
        onEndChange={handleSliderEndChange}
        onCommit={handleSliderCommit}
        disabled={minDate === maxDate}
      />
    </React.Fragment>
  );
};

export default DateRangeControl;
