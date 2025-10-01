import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

/**
 * SortDropdown Component
 *
 * Dropdown selector for choosing which field to sort by.
 * Used in Pattern A (dropdown-headers) where field selection is separate from direction toggling.
 *
 * @param {Object} props - Component props
 * @param {Array} props.fields - Array of field metadata objects with key, label, and type properties
 * @param {string|null} props.activeField - Currently selected field key (controls which option is selected)
 * @param {function} props.onFieldChange - Callback when user selects a different field
 * @param {string} [props.label='Sort By'] - Label text displayed above/before dropdown
 * @param {boolean} [props.disabled=false] - Disable dropdown interaction
 * @param {string} [props.className] - Additional CSS class for styling container
 *
 * @example
 * <SortDropdown
 *   fields={config.fields}
 *   activeField={activeSort.field}
 *   onFieldChange={setSort}
 *   label="Sort Datasets By"
 * />
 */
const SortDropdown = ({
  fields,
  activeField,
  onFieldChange,
  label = 'Sort By',
  disabled = false,
  className,
}) => {
  // Handle change event from Material-UI Select
  const handleChange = (event) => {
    const selectedKey = event.target.value;
    onFieldChange(selectedKey);
  };

  // Validate fields and warn about missing required properties
  const validFields = fields.filter((field) => {
    if (!field.key) {
      console.warn(
        'SortDropdown: Field missing "key" property, skipping:',
        field,
      );
      return false;
    }
    if (!field.label) {
      console.warn(
        `SortDropdown: Field "${field.key}" missing "label" property, using key as fallback`,
      );
    }
    return true;
  });

  // Handle empty fields array
  const isEmpty = validFields.length === 0;
  const isDisabled = disabled || isEmpty;

  return (
    <FormControl disabled={isDisabled} className={className}>
      {label && <InputLabel id="sort-field-label">{label}</InputLabel>}
      <Select
        labelId="sort-field-label"
        value={activeField || ''}
        onChange={handleChange}
        displayEmpty={isEmpty}
        autoWidth={true}
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
            No sortable fields
          </MenuItem>
        ) : (
          validFields.map((field) => (
            <MenuItem key={field.key} value={field.key}>
              {field.label || field.key}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

SortDropdown.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeField: PropTypes.string,
  onFieldChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default SortDropdown;
