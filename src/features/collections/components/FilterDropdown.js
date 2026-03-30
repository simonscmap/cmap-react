import React from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../enums/colors';

let useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 140,
    maxWidth: 200,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(157, 209, 98, 0.4)',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
  },
  select: {
    color: '#ffffff',
    '& .MuiSelect-icon': {
      color: '#ffffff',
    },
  },
  label: {
    color: colors.primary,
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
}));

const FilterDropdown = ({
  options,
  selectedValues,
  onChange,
  allLabel = 'All',
  label = 'Filter By',
  disabled = false,
  className,
}) => {
  let classes = useStyles();

  let handleChange = (event) => {
    let value = event.target.value;
    onChange(new Set(value));
  };

  let getDisplayLabel = () => {
    if (selectedValues.size === 0 || selectedValues.size === options.length) {
      return allLabel;
    }
    return options
      .filter((opt) => selectedValues.has(opt.value))
      .map((opt) => opt.label)
      .join(', ');
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      disabled={disabled}
      className={`${classes.formControl} ${className || ''}`}
    >
      <InputLabel className={classes.label}>{label}</InputLabel>
      <Select
        multiple
        value={Array.from(selectedValues)}
        onChange={handleChange}
        label={label}
        renderValue={getDisplayLabel}
        className={classes.select}
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
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox
              checked={selectedValues.has(option.value)}
              color="primary"
              size="small"
            />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

FilterDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedValues: PropTypes.instanceOf(Set).isRequired,
  onChange: PropTypes.func.isRequired,
  allLabel: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default FilterDropdown;
