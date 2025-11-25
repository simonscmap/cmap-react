/**
 * DepthConstraintsInput - Component for enabling/disabling depth constraints and setting depth range
 *
 * This component provides:
 * - Checkbox to enable/disable depth filtering
 * - Number inputs for minimum and maximum depth (meters)
 * - Conditional rendering (inputs only visible when enabled)
 * - Inline validation error display
 * - Integration with spatialTemporalSearchStore
 *
 * @module DepthConstraintsInput
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import { validateDepthRange } from '../utils/validation';

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
  depthField: {
    width: 140, // Match coordinate input width
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
  },
}));

/**
 * DepthConstraintsInput component
 *
 * @returns {React.ReactElement} The rendered component
 */
const DepthConstraintsInput = () => {
  const classes = useStyles();

  // Get state and actions from store
  const depthEnabled = useSpatialTemporalSearchStore(
    (state) => state.depthEnabled,
  );
  const depthRange = useSpatialTemporalSearchStore((state) => state.depthRange);
  const setDepthConstraints = useSpatialTemporalSearchStore(
    (state) => state.setDepthConstraints,
  );

  // Local state for inputs
  const [depthMin, setDepthMin] = useState(depthRange.depthMin || '');
  const [depthMax, setDepthMax] = useState(depthRange.depthMax || '');
  const [validationErrors, setValidationErrors] = useState([]);

  // Sync local state with store when store changes
  useEffect(() => {
    setDepthMin(depthRange.depthMin !== null ? depthRange.depthMin : '');
    setDepthMax(depthRange.depthMax !== null ? depthRange.depthMax : '');
  }, [depthRange.depthMin, depthRange.depthMax]);

  // Validate inputs for immediate feedback (but don't update store)
  useEffect(() => {
    if (!depthEnabled) {
      setValidationErrors([]);
      return;
    }

    // Prepare constraints for validation
    const constraints = {
      enabled: depthEnabled,
      depthMin: depthMin,
      depthMax: depthMax,
    };

    // Validate (show errors immediately)
    const validation = validateDepthRange(constraints);
    setValidationErrors(validation.errors);
  }, [depthEnabled, depthMin, depthMax]);

  /**
   * Handle checkbox toggle for enabling/disabling depth constraints
   * @param {React.ChangeEvent<HTMLInputElement>} event - Checkbox change event
   */
  const handleEnabledChange = (event) => {
    const enabled = event.target.checked;
    setDepthConstraints(enabled, null);

    // Clear validation errors when disabling
    if (!enabled) {
      setValidationErrors([]);
    }
  };

  /**
   * Handle depth minimum input change
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  const handleDepthMinChange = (event) => {
    setDepthMin(event.target.value);
  };

  /**
   * Handle depth maximum input change
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  const handleDepthMaxChange = (event) => {
    setDepthMax(event.target.value);
  };

  /**
   * Handle blur events - update store only when user finishes editing
   * This prevents premature constraint snapshot comparisons during typing
   */
  const handleBlur = () => {
    if (!depthEnabled) {
      return;
    }

    // Prepare constraints for validation
    const constraints = {
      enabled: depthEnabled,
      depthMin: depthMin,
      depthMax: depthMax,
    };

    // Only update store if valid
    const validation = validateDepthRange(constraints);
    if (validation.valid) {
      setDepthConstraints(depthEnabled, {
        depthMin: Number(depthMin),
        depthMax: Number(depthMax),
      });
    }
  };

  return (
    <Box className={classes.container}>
      {/* Header Row: Title Column + Inputs */}
      <Box className={classes.headerRow}>
        {/* Title and Enable Checkbox Column */}
        <Box className={classes.titleColumn}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            Depth
            <br />
            Bounds
          </Typography>
          <Box className={classes.checkboxContainer}>
            <Checkbox
              checked={depthEnabled}
              onChange={handleEnabledChange}
              color="primary"
              size="small"
            />
            <Typography variant="body2">Enable</Typography>
          </Box>
        </Box>

        {/* Depth Inputs - Only shown when enabled */}
        {depthEnabled && (
          <Box className={classes.inputsRow}>
            <TextField
              className={classes.depthField}
              label="Min Depth (m)"
              type="number"
              value={depthMin}
              onChange={handleDepthMinChange}
              onBlur={handleBlur}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: '0.1',
                min: '0',
              }}
            />
            <TextField
              className={classes.depthField}
              label="Max Depth (m)"
              type="number"
              value={depthMax}
              onChange={handleDepthMaxChange}
              onBlur={handleBlur}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: '0.1',
                min: '0',
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DepthConstraintsInput;
