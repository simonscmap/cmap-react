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
import { Box, Checkbox, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import DateInput from '../../../../../shared/components/DateInput';
import ValidationMessages from '../../../../../shared/components/ValidationMessages';

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
  inputsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

/**
 * TemporalConstraintsInput Component
 *
 * @returns {JSX.Element} Temporal constraints input with checkbox and date pickers
 */
const TemporalConstraintsInput = () => {
  const classes = useStyles();

  const {
    temporalEnabled,
    temporalRange,
    temporalValidationErrors,
    setTemporalConstraints,
  } = useSpatialTemporalSearchStore();

  const handleEnabledChange = (event) => {
    setTemporalConstraints(event.target.checked);
  };

  // Local state buffers input during typing (blur-deferred UX)
  const [localTemporalRange, setLocalTemporalRange] =
    React.useState(temporalRange);

  // Sync local state with store when store changes externally
  React.useEffect(() => {
    setLocalTemporalRange(temporalRange);
  }, [temporalRange]);

  const handleDateChange = (field, value) => {
    setLocalTemporalRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = () => {
    if (!temporalEnabled) {
      return;
    }
    setTemporalConstraints(temporalEnabled, localTemporalRange);
  };

  let messages = [];
  if (temporalEnabled) {
    if (!localTemporalRange.timeMin || !localTemporalRange.timeMax) {
      messages = [{ type: 'error', text: 'Both start and end dates are required' }];
    } else if (temporalValidationErrors.timeMax) {
      messages = [{ type: 'error', text: temporalValidationErrors.timeMax }];
    } else if (temporalValidationErrors.timeMin) {
      messages = [{ type: 'error', text: temporalValidationErrors.timeMin }];
    }
  }

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

        <Box className={classes.inputsColumn}>
          <Box
            className={classes.inputsRow}
            style={temporalEnabled ? undefined : { visibility: 'hidden' }}
          >
            <DateInput
              label="Start Date"
              value={localTemporalRange.timeMin}
              onChange={(date) => handleDateChange('timeMin', date)}
              onBlur={handleBlur}
              width={140}
            />

            <DateInput
              label="End Date"
              value={localTemporalRange.timeMax}
              onChange={(date) => handleDateChange('timeMax', date)}
              onBlur={handleBlur}
              width={140}
            />
          </Box>
          <ValidationMessages messages={messages} maxMessages={2} />
        </Box>
      </Box>
    </Box>
  );
};

export default TemporalConstraintsInput;
