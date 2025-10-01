import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

/**
 * FilterDropdown Component
 *
 * Generic dropdown selector for filtering data by a specific criterion.
 * Reusable across different features and filter types.
 *
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of filter option objects with value and label properties
 * @param {string} props.selectedValue - Currently selected filter value
 * @param {function} props.onChange - Callback when user selects a different option
 * @param {string} [props.label='Filter'] - Label text displayed above/before dropdown
 * @param {boolean} [props.disabled=false] - Disable dropdown interaction
 * @param {string} [props.className] - Additional CSS class for styling container
 * @param {string} [props.size='medium'] - Size variant: 'small' | 'medium'
 *
 * @example
 * <FilterDropdown
 *   options={[
 *     { value: 'all', label: 'All Items' },
 *     { value: 'active', label: 'Active Only' },
 *     { value: 'inactive', label: 'Inactive Only' }
 *   ]}
 *   selectedValue={filterValue}
 *   onChange={setFilterValue}
 *   label="Status Filter"
 * />
 */
const FilterDropdown = ({
  options,
  selectedValue,
  onChange,
  disabled = false,
  className,
  size = 'medium',
  label,
}) => {
  // Handle change event from Material-UI Select
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
    <FormControl disabled={isDisabled} className={className} size={size}>
      {label && <InputLabel id="filter-dropdown-label">{label}</InputLabel>}
      <Select
        labelId="filter-dropdown-label"
        value={selectedValue || ''}
        onChange={handleChange}
        displayEmpty={isEmpty}
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
