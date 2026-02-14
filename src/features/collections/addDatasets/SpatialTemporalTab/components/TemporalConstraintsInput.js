import React, { useState, useEffect } from 'react';
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
    gap: theme.spacing(0.5),
    marginLeft: -11,
  },
  inputsRow: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  dateField: {
    width: 140,
  },
  inputsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

const TemporalConstraintsInput = () => {
  const classes = useStyles();

  const {
    temporalEnabled,
    temporalRange,
    temporalFieldErrors,
    temporalFieldInteraction,
    temporalErrorRevealed,
    setTemporalConstraints,
    validateTemporalInput,
    markFieldFocused,
    markFieldBlurred,
    revealError,
    clearErrorRevealed,
  } = useSpatialTemporalSearchStore();

  const [localTemporalRange, setLocalTemporalRange] = useState(temporalRange);

  useEffect(() => {
    setLocalTemporalRange(temporalRange);
    // Note: Don't reset interaction here - that's handled by setTemporalConstraints when enabling.
    // Internal changes (user blur commits) should preserve interaction state.
  }, [temporalRange]);

  useEffect(() => {
    validateTemporalInput(localTemporalRange);
  }, [localTemporalRange, temporalEnabled, validateTemporalInput]);

  const handleEnabledChange = (event) => {
    setTemporalConstraints(event.target.checked);
  };

  const handleDateChange = (field, value) => {
    setLocalTemporalRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateFocus = (field) => {
    markFieldFocused('temporal', field);
  };

  const handleDateBlur = (field) => {
    markFieldBlurred('temporal', field);

    if (!temporalEnabled) {
      return;
    }
    setTemporalConstraints(temporalEnabled, localTemporalRange);
  };

  useEffect(() => {
    ['timeMin', 'timeMax'].forEach((field) => {
      let err = temporalFieldErrors[field];
      let interaction = temporalFieldInteraction[field];
      let revealed = temporalErrorRevealed[field];

      if (err && err.message) {
        let shouldReveal = !err.blurOnly || interaction === null || interaction === true;
        if (shouldReveal && !revealed) {
          revealError('temporal', field);
        }
      } else if (revealed) {
        clearErrorRevealed('temporal', field);
      }
    });
  }, [temporalFieldErrors, temporalFieldInteraction, temporalErrorRevealed, revealError, clearErrorRevealed]);

  let fieldHasDisplayedError = (field) => {
    let err = temporalFieldErrors[field];
    let revealed = temporalErrorRevealed[field];
    return err && err.message && (!err.blurOnly || revealed);
  };

  let displayErrors = [];
  ['timeMin', 'timeMax'].forEach((field) => {
    if (fieldHasDisplayedError(field)) {
      displayErrors.push(temporalFieldErrors[field].message);
    }
  });

  let timeMin = localTemporalRange.timeMin;
  let timeMax = localTemporalRange.timeMax;
  let isTimeRangeInverted = timeMin && timeMax && timeMin > timeMax;
  let timeInversionDisplayed = fieldHasDisplayedError('timeMin') && isTimeRangeInverted;

  let timeMinHasError = fieldHasDisplayedError('timeMin') || timeInversionDisplayed;
  let timeMaxHasError = fieldHasDisplayedError('timeMax') || timeInversionDisplayed;

  return (
    <Box className={classes.container}>
      <Box className={classes.headerRow}>
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
              onFocus={() => handleDateFocus('timeMin')}
              onBlur={() => handleDateBlur('timeMin')}
              width={140}
              hasError={timeMinHasError}
            />

            <DateInput
              label="End Date"
              value={localTemporalRange.timeMax}
              onChange={(date) => handleDateChange('timeMax', date)}
              onFocus={() => handleDateFocus('timeMax')}
              onBlur={() => handleDateBlur('timeMax')}
              width={140}
              hasError={timeMaxHasError}
            />
          </Box>
          <ValidationMessages
            messages={displayErrors.map((text) => ({ type: 'error', text }))}
            maxMessages={2}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TemporalConstraintsInput;
