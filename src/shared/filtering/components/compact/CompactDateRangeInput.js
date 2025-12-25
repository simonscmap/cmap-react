/**
 * CompactDateRangeInput - Compact horizontal control for date range input
 *
 * Provides:
 * - Label + Slider + Two date inputs (start/end) in single horizontal line
 * - Integration with useDateRangeInput hook for validation
 * - Date picker inputs for precise date selection
 *
 * @module CompactDateRangeInput
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useDateRangeInput from '../../hooks/useDateRangeInput';
import DateRangeSlider from '../controls/DateRangeControl/DateRangeSlider';
import DateInput from '../../../components/DateInput';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    width: '100%',
  },
  sectionTitle: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: theme.palette.common.white,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(0.5),
  },
  label: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputRow: {
    display: 'flex',
    gap: theme.spacing(1.5),
  },
  inputWrapper: {
    flex: 1,
  },
  sliderBox: {
    // Add horizontal padding to pull slider circles to input edges
    paddingLeft: 4,
    paddingRight: 4,
    '& .MuiSlider-root': {
      margin: '-8px 0 8px 0',
    },
  },
  boundsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -theme.spacing(1.5),
  },
  boundLabel: {
    fontSize: '0.75rem',
    color: theme.palette.primary.main,
  },
}));

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

const utcInstantToLocalMidnight = (d) => {
  if (!isValidDate(d)) return d;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const localMidnightToUtcInstant = (d) => {
  if (!isValidDate(d)) return d;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

const formatUTCDateString = (d) => {
  if (!isValidDate(d)) return '';
  return d.toISOString().slice(0, 10);
};

const toUIDate = (d) => {
  if (!isValidDate(d)) return d;

  const isUtcMidnight =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0;

  return isUtcMidnight
    ? new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) // local midnight of UTC day
    : new Date(d.getFullYear(), d.getMonth(), d.getDate());        // local midnight of local day
};


/**
 * CompactDateRangeInput component
 *
 * Renders a compact horizontal layout with label, slider, and two date inputs
 * for date range selection. Uses the shared DateInput component for consistent
 * date input behavior across the application.
 *
 * @param {Object} props
 * @param {string} props.title - Display label (e.g., "Date")
 * @param {Date} props.startDate - Start date (UTC instant)
 * @param {Date} props.endDate - End date (UTC instant)
 * @param {Function} props.setStartDate - Callback to update start date (expects UTC instant)
 * @param {Function} props.setEndDate - Callback to update end date (expects UTC instant)
 * @param {Date} props.minDate - Minimum allowed date (UTC instant)
 * @param {Date} props.maxDate - Maximum allowed date (UTC instant)
 * @param {Function} props.setInvalidFlag - Callback to set invalid flag for parent validation
 * @returns {JSX.Element}
 */
const CompactDateRangeInput = ({
  title,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  minDate,
  maxDate,
  setInvalidFlag,
}) => {
  const classes = useStyles();

  const uiMinDate = utcInstantToLocalMidnight(minDate);
  const uiMaxDate = utcInstantToLocalMidnight(maxDate);
  const uiStartFromProps = utcInstantToLocalMidnight(startDate);
  const uiEndFromProps = utcInstantToLocalMidnight(endDate);

  const [localStartDate, setLocalStartDate] = useState(uiStartFromProps);
  const [localEndDate, setLocalEndDate] = useState(uiEndFromProps);

  useEffect(() => {
    setLocalStartDate(utcInstantToLocalMidnight(startDate));
  }, [startDate]);

  useEffect(() => {
    setLocalEndDate(utcInstantToLocalMidnight(endDate));
  }, [endDate]);

  const handleStartInputChange = (date) => {
    const ui = toUIDate(date);
    setLocalStartDate(ui);
    setStartDate(localMidnightToUtcInstant(ui));
  };

  const handleEndInputChange = (date) => {
    const ui = toUIDate(date);
    setLocalEndDate(ui);
    setEndDate(localMidnightToUtcInstant(ui));
  };

  const handleSliderStartChange = (date) => {
    setLocalStartDate(toUIDate(date));
  };

  const handleSliderEndChange = (date) => {
    setLocalEndDate(toUIDate(date));
  };

  const handleSliderCommit = () => {
    const startUtc = localMidnightToUtcInstant(localStartDate);
    const endUtc = localMidnightToUtcInstant(localEndDate);

    if (isValidDate(startUtc) && startUtc.getTime() !== startDate.getTime()) {
      setStartDate(startUtc);
    }
    if (isValidDate(endUtc) && endUtc.getTime() !== endDate.getTime()) {
      setEndDate(endUtc);
    }
  };


  const {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
  } = useDateRangeInput({
    start: localStartDate,
    end: localEndDate,
    setStart: handleStartInputChange,
    setEnd: handleEndInputChange,
    min: uiMinDate,
    max: uiMaxDate,
  });

  useEffect(() => {
    const hasErrors = !!startDateMessage || !!endDateMessage;
    if (setInvalidFlag) {
      setInvalidFlag(hasErrors);
    }
  }, [startDateMessage, endDateMessage, setInvalidFlag]);

  return (
    <Box className={classes.container}>
      {/* Section Title */}
      <Typography variant="body2" className={classes.sectionTitle}>
        TEMPORAL BOUNDS
      </Typography>

      {/* Input Row */}
      <Box className={classes.inputRow}>
        <Box className={classes.inputWrapper}>
          <DateInput
            value={localStartDate}
            onChange={handleStartInputChange}
            onBlur={handleDateStartBlur}
            minDate={uiMinDate}
            maxDate={uiMaxDate}
            label="Start Date"
            validationMessage={startDateMessage}
            width="100%"
          />
        </Box>
        <Box className={classes.inputWrapper}>
          <DateInput
            value={localEndDate}
            onChange={handleEndInputChange}
            onBlur={handleDateEndBlur}
            minDate={uiMinDate}
            maxDate={uiMaxDate}
            label="End Date"
            validationMessage={endDateMessage}
            width="100%"
          />
        </Box>
      </Box>

      {/* Slider */}
      <Box className={classes.sliderBox}>
        <DateRangeSlider
          startDate={localStartDate}
          endDate={localEndDate}
          minDate={uiMinDate}
          maxDate={uiMaxDate}
          onStartChange={handleSliderStartChange}
          onEndChange={handleSliderEndChange}
          onCommit={handleSliderCommit}
          showMarks={false}
        />
      </Box>

      {/* Bounds Row */}
      <Box className={classes.boundsRow}>
        <Typography variant="caption" className={classes.boundLabel}>
          {formatUTCDateString(minDate)}
        </Typography>
        <Typography variant="caption" className={classes.boundLabel}>
          {formatUTCDateString(maxDate)}
        </Typography>
      </Box>
    </Box>
  );
};

CompactDateRangeInput.propTypes = {
  title: PropTypes.string.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  setStartDate: PropTypes.func.isRequired,
  setEndDate: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date).isRequired,
  maxDate: PropTypes.instanceOf(Date).isRequired,
  setInvalidFlag: PropTypes.func,
};

export default CompactDateRangeInput;