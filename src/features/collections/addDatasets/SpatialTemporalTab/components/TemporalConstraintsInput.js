/**
 * TemporalConstraintsInput - Date range input for temporal filtering
 *
 * Provides checkbox to enable/disable temporal constraints and date pickers
 * for start and end dates. Connects to spatialTemporalSearchStore for state management.
 *
 * Features:
 * - Enable/disable temporal filtering with checkbox
 * - Segmented date input (YYYY/MM/DD format) using react-aria-components
 * - Conditional rendering: date inputs only shown when enabled
 * - Real-time validation with inline error display
 * - Integration with spatialTemporalSearchStore
 * - Uses Date objects throughout (converted to ISO strings only at API boundary)
 *
 * @module TemporalConstraintsInput
 */

import React from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import DateInput from '../../../../../shared/components/DateInput';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
  titleColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 90,
  },
  sectionTitle: {
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    lineHeight: 1.2,
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5), // Half the previous spacing
    marginLeft: -11, // Align checkbox to left edge (compensate for checkbox padding)
  },
  inputsRow: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  dateField: {
    width: 140, // Match coordinate input width
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
  },
}));

/**
 * TemporalConstraintsInput Component
 *
 * @returns {JSX.Element} Temporal constraints input with checkbox and date pickers
 */
const TemporalConstraintsInput = () => {
  const classes = useStyles();

  const { temporalEnabled, temporalRange, setTemporalConstraints } =
    useSpatialTemporalSearchStore();

  // Track local validation errors
  const [errors, setErrors] = React.useState({
    timeMin: '',
    timeMax: '',
  });

  /**
   * Validate temporal range
   * @param {Date|null} timeMin - Start date
   * @param {Date|null} timeMax - End date
   * @returns {Object} Validation errors object
   */
  const validateRange = (timeMin, timeMax) => {
    const newErrors = {
      timeMin: '',
      timeMax: '',
    };

    // Only validate if both dates are provided
    if (timeMin && timeMax) {
      // Check for invalid dates
      if (isNaN(timeMin.getTime())) {
        newErrors.timeMin = 'Invalid date';
      }
      if (isNaN(timeMax.getTime())) {
        newErrors.timeMax = 'Invalid date';
      }

      // Check date order
      if (!newErrors.timeMin && !newErrors.timeMax && timeMin > timeMax) {
        newErrors.timeMax = 'End date must be after start date';
      }
    }

    return newErrors;
  };

  /**
   * Handle checkbox toggle
   * @param {Object} event - Change event
   */
  const handleEnabledChange = (event) => {
    const enabled = event.target.checked;
    setTemporalConstraints(enabled);

    // Clear errors when disabling
    if (!enabled) {
      setErrors({ timeMin: '', timeMax: '' });
    }
  };

  /**
   * Handle date input changes
   * @param {string} field - Field name ('timeMin' or 'timeMax')
   * @param {Date|null} value - Date object value
   */
  const handleDateChange = (field, value) => {
    // Update store with new value
    const updatedRange = {
      ...temporalRange,
      [field]: value,
    };
    setTemporalConstraints(temporalEnabled, updatedRange);

    // Validate
    const newErrors = validateRange(
      field === 'timeMin' ? value : temporalRange.timeMin,
      field === 'timeMax' ? value : temporalRange.timeMax,
    );
    setErrors(newErrors);
  };

  return (
    <Box className={classes.container}>
      {/* Header Row: Title Column + Inputs */}
      <Box className={classes.headerRow}>
        {/* Title and Enable Checkbox Column */}
        <Box className={classes.titleColumn}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            Temporal
            <br />
            Bounds
          </Typography>
          <Box className={classes.checkboxContainer}>
            <Checkbox
              checked={temporalEnabled}
              onChange={handleEnabledChange}
              color="primary"
              size="small"
            />
            <Typography variant="body2">Enable</Typography>
          </Box>
        </Box>

        {/* Date Pickers - Only shown when enabled */}
        {temporalEnabled && (
          <Box className={classes.inputsRow}>
            <DateInput
              label="Start Date"
              value={temporalRange.timeMin}
              onChange={(date) => handleDateChange('timeMin', date)}
              validationMessage={errors.timeMin}
              width={140}
            />

            <DateInput
              label="End Date"
              value={temporalRange.timeMax}
              onChange={(date) => handleDateChange('timeMax', date)}
              validationMessage={errors.timeMax}
              width={140}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TemporalConstraintsInput;
