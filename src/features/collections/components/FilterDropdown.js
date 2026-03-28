import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../enums/colors';

let useStyles = makeStyles(() => ({
  formControl: {
    '& .MuiInput-underline:before': {
      borderBottomColor: 'rgba(157, 209, 98, 0.4)',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: colors.primary,
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: colors.primary,
    },
  },
  select: {
    color: colors.primary,
    '& .MuiSelect-icon': {
      color: colors.primary,
    },
  },
  label: {
    color: colors.primary,
  },
}));

const FilterDropdown = ({
  options,
  selectedValue,
  onChange,
  disabled = false,
  className,
  size = 'medium',
  label,
}) => {
  let classes = useStyles();

  const handleChange = (event) => {
    const value = event.target.value;
    onChange(value);
  };

  // Validate options and warn about missing required properties
  const validOptions = options.filter((option) => {
    if (option.value === undefined || option.value === null) {
      console.warn(
        'FilterDropdown: Option missing "value" property, skipping:',
        option,
      );
      return false;
    }
    if (!option.label) {
      console.warn(
        `FilterDropdown: Option "${option.value}" missing "label" property, using value as fallback`,
      );
    }
    return true;
  });

  // Handle empty options array
  const isEmpty = validOptions.length === 0;
  const isDisabled = disabled || isEmpty;

  return (
    <FormControl disabled={isDisabled} className={`${classes.formControl} ${className || ''}`} size={size}>
      {label && <InputLabel id="filter-dropdown-label" className={classes.label}>{label}</InputLabel>}
      <Select
        labelId="filter-dropdown-label"
        value={selectedValue || ''}
        onChange={handleChange}
        displayEmpty={isEmpty}
        autoWidth={true}
        className={classes.select}
        style={{ textAlign: 'left' }}
        MenuProps={{
          disableScrollLock: true,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
          getContentAnchorEl: null,
        }}
      >
        {isEmpty ? (
          <MenuItem value="" disabled>
            No filter options
          </MenuItem>
        ) : (
          validOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label || option.value}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

FilterDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
};

export default FilterDropdown;
