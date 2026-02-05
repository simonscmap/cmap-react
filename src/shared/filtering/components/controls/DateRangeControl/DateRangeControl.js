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

  const [localSliderStart, setLocalSliderStart] = useState(startDate);
  const [localSliderEnd, setLocalSliderEnd] = useState(endDate);

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalSliderStart(startDate);
  }, [startDate]);

  useEffect(() => {
    setLocalEndDate(endDate);
    setLocalSliderEnd(endDate);
  }, [endDate]);

  // Handle date changes
  const handleStartChange = (date) => {
    setLocalStartDate(date);
  };

  const handleEndChange = (date) => {
    setLocalEndDate(date);
  };

  const handleSliderStartChange = (date) => {
    setLocalSliderStart(date);
    setLocalStartDate(date);
  };

  const handleSliderEndChange = (date) => {
    setLocalSliderEnd(date);
    setLocalEndDate(date);
  };

  const handleSliderCommit = () => {
    if (localSliderStart !== startDate) {
      setStartDate(localSliderStart);
    }
    if (localSliderEnd !== endDate) {
      setEndDate(localSliderEnd);
    }
  };

  const {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
  } = useDateRangeInput({
    localStart: localStartDate,
    localEnd: localEndDate,
    committedStart: startDate,
    committedEnd: endDate,
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
        startDate={localSliderStart}
        endDate={localSliderEnd}
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
