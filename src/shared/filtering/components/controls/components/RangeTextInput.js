import React from 'react';
import { TextField, Typography } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';

const RangeTextInput = ({
  min,
  max,
  displayValue,
  handleChange,
  handleBlur,
  validationMessage,
  label,
  id,
  step = 0.1,
}) => {
  return (
    <div style={styles.latInputContainer}>
      <TextField
        id={id}
        label={label}
        type="number"
        inputProps={{
          step: step,
          min: min,
          max: max,
          className: styles.input,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <Typography variant="caption" style={styles.validationMessage}>
        {validationMessage || ''}
      </Typography>
    </div>
  );
};

export default RangeTextInput;
