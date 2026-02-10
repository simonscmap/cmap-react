/**
 * CompactLatitudeInput - Compact horizontal control for latitude range input
 *
 * Provides:
 * - Label + Slider + Two text inputs (start/end) in single horizontal line
 * - Integration with useRangeInput hook for validation and state management
 * - Two-phase updates: local preview during slider drag, commit on blur
 *
 * @module CompactLatitudeInput
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Typography, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useRangeInput from '../../hooks/useRangeInput';
import ValidationMessages from '../../../../shared/components/ValidationMessages';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    width: '100%',
  },
  label: {
    fontWeight: 500,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(0.5),
  },
  inputRow: {
    display: 'flex',
    gap: theme.spacing(1.5),
  },
  inputWrapper: {
    flex: 1,
  },
  textField: {
    width: '100%',
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
      {
        '-webkit-appearance': 'none',
        margin: 0,
      },
  },
  sliderBox: {
    // Add horizontal padding to pull slider circles to input edges
    paddingLeft: 4,
    paddingRight: 4,
    '& .MuiSlider-root': {
      margin: '0 0 8px 0',
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
 * CompactLatitudeInput component
 *
 * Renders a compact horizontal layout with label, slider, and two text inputs
 * for latitude range selection.
 *
 * @param {Object} props
 * @param {string} props.title - Display label (e.g., "Latitude [°]")
 * @param {number} props.start - Start value (latitude minimum)
 * @param {number} props.end - End value (latitude maximum)
 * @param {Function} props.setStart - Callback to update start value
 * @param {Function} props.setEnd - Callback to update end value
 * @param {number} props.min - Minimum allowed value (-90)
 * @param {number} props.max - Maximum allowed value (90)
 * @param {number} props.step - Step size for inputs (0.1)
 * @param {string} [props.unit] - Optional unit symbol ("°")
 * @returns {JSX.Element}
 */
const CompactLatitudeInput = ({
  title,
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  step,
  unit = '',
  onExpandEndpoint,
}) => {
  const classes = useStyles();

  // Use validation hook for two-phase updates and error handling
  const {
    localStartValue,
    localEndValue,
    handleSetStart,
    handleSetEnd,
    handleBlurStart,
    handleBlurEnd,
    startMessage,
    endMessage,
    handleSlider,
    handleSliderCommit,
    sliderStart,
    sliderEnd,
    bounds,
  } = useRangeInput({ start, end, setStart, setEnd, min, max, step, fieldType: 'lat', onExpandEndpoint });

  return (
    <Box className={classes.container}>
      {/* Input Row */}
      <Box className={classes.inputRow}>
        <Box className={classes.inputWrapper}>
          <TextField
            type="number"
            size="small"
            variant="outlined"
            label="S Latitude (°)"
            value={localStartValue}
            onChange={handleSetStart}
            onBlur={handleBlurStart}
            className={classes.textField}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step,
              min,
              max,
            }}
          />
        </Box>
        <Box className={classes.inputWrapper}>
          <TextField
            type="number"
            size="small"
            variant="outlined"
            label="N Latitude (°)"
            value={localEndValue}
            onChange={handleSetEnd}
            onBlur={handleBlurEnd}
            className={classes.textField}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step,
              min,
              max,
            }}
          />
        </Box>
      </Box>
      <ValidationMessages
        messages={
          (startMessage || endMessage)
            ? [{ type: 'error', text: startMessage || endMessage }]
            : []
        }
        maxMessages={1}
      />

      {/* Slider */}
      <Box className={classes.sliderBox}>
        <Slider
          value={[sliderStart, sliderEnd]}
          onChange={handleSlider}
          onChangeCommitted={handleSliderCommit}
          min={bounds.min}
          max={bounds.max}
          step={step}
          valueLabelDisplay="auto"
          marks={false}
        />
      </Box>

      {/* Bounds Row */}
      <Box className={classes.boundsRow}>
        <Typography variant="caption" className={classes.boundLabel}>
          {min}
        </Typography>
        <Typography variant="caption" className={classes.boundLabel}>
          {max}
        </Typography>
      </Box>
    </Box>
  );
};

CompactLatitudeInput.propTypes = {
  title: PropTypes.string.isRequired,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  setStart: PropTypes.func.isRequired,
  setEnd: PropTypes.func.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  unit: PropTypes.string,
  onExpandEndpoint: PropTypes.func,
};

export default CompactLatitudeInput;
