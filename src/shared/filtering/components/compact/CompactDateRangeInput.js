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
import { dateToUTCDateString } from '../../utils/dateHelpers';

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

/**
 * CompactDateRangeInput component
 *
 * Renders a compact horizontal layout with label, slider, and two date inputs
 * for date range selection. Uses the shared DateInput component for consistent
 * date input behavior across the application.
 *
 * @param {Object} props
 * @param {string} props.title - Display label (e.g., "Date")
 * @param {Date} props.startDate - Start date
 * @param {Date} props.endDate - End date
 * @param {Function} props.setStartDate - Callback to update start date
 * @param {Function} props.setEndDate - Callback to update end date
 * @param {Date} props.minDate - Minimum allowed date
 * @param {Date} props.maxDate - Maximum allowed date
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

  const handleStartInputChange = (date) => {
    setLocalStartDate(date);
  };

  const handleEndInputChange = (date) => {
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

  // Use validation hook for error handling
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

  // Set invalid flag when there are validation errors
  useEffect(() => {
    const hasErrors = !!startDateMessage || !!endDateMessage;
    if (setInvalidFlag) {
      setInvalidFlag(hasErrors);
    }
  }, [startDateMessage, endDateMessage, setInvalidFlag]);

  const formatDate = (date) => dateToUTCDateString(date);

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
            minDate={minDate}
            maxDate={maxDate}
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
            minDate={minDate}
            maxDate={maxDate}
            label="End Date"
            validationMessage={endDateMessage}
            width="100%"
          />
        </Box>
      </Box>

      {/* Slider */}
      <Box className={classes.sliderBox}>
        <DateRangeSlider
          startDate={localSliderStart}
          endDate={localSliderEnd}
          minDate={minDate}
          maxDate={maxDate}
          onStartChange={handleSliderStartChange}
          onEndChange={handleSliderEndChange}
          onCommit={handleSliderCommit}
          showMarks={false}
        />
      </Box>

      {/* Bounds Row */}
      <Box className={classes.boundsRow}>
        <Typography variant="caption" className={classes.boundLabel}>
          {formatDate(minDate)}
        </Typography>
        <Typography variant="caption" className={classes.boundLabel}>
          {formatDate(maxDate)}
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
