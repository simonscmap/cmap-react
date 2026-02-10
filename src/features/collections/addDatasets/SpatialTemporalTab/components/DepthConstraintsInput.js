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
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
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
  depthField: {
    width: 140, // Match coordinate input width
  },
  inputsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

/**
 * DepthConstraintsInput component
 *
 * @returns {React.ReactElement} The rendered component
 */
const DepthConstraintsInput = () => {
  const classes = useStyles();

  const depthEnabled = useSpatialTemporalSearchStore((state) => state.depthEnabled);
  const depthRange = useSpatialTemporalSearchStore((state) => state.depthRange);
  const depthValidationErrors = useSpatialTemporalSearchStore((state) => state.depthValidationErrors);
  const setDepthConstraints = useSpatialTemporalSearchStore((state) => state.setDepthConstraints);

  const [depthMin, setDepthMin] = useState(depthRange.depthMin !== null ? depthRange.depthMin : '');
  const [depthMax, setDepthMax] = useState(depthRange.depthMax !== null ? depthRange.depthMax : '');

  useEffect(() => {
    setDepthMin(depthRange.depthMin !== null ? depthRange.depthMin : '');
    setDepthMax(depthRange.depthMax !== null ? depthRange.depthMax : '');
  }, [depthRange.depthMin, depthRange.depthMax]);

  const handleEnabledChange = (event) => {
    const enabled = event.target.checked;
    setDepthConstraints(enabled, null);
  };

  const handleDepthMinChange = (event) => {
    setDepthMin(event.target.value);
  };

  const handleDepthMaxChange = (event) => {
    setDepthMax(event.target.value);
  };

  const handleBlur = () => {
    if (!depthEnabled) {
      return;
    }

    const minVal = depthMin === '' ? null : Number(depthMin);
    const maxVal = depthMax === '' ? null : Number(depthMax);

    setDepthConstraints(depthEnabled, {
      depthMin: minVal,
      depthMax: maxVal,
    });
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

        <Box className={classes.inputsColumn}>
          <Box
            className={classes.inputsRow}
            style={depthEnabled ? undefined : { visibility: 'hidden' }}
          >
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
          <ValidationMessages
            messages={depthValidationErrors.map((text) => ({ type: 'error', text }))}
            maxMessages={2}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DepthConstraintsInput;
