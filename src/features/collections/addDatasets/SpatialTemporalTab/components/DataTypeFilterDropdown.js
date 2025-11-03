import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem, IconButton, Box, Checkbox } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../../../enums/zIndex';

const useStyles = makeStyles(() => ({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
  },
  dropdownButton: {
    padding: '2px',
    minWidth: 'auto',
    color: '#8bc34a',
    '& .MuiSvgIcon-root': {
      fontSize: '16px',
    },
  },
  menuItem: {
    fontSize: '14px',
    padding: '4px 8px',
    minHeight: 'auto',
  },
  checkbox: {
    padding: '4px',
  },
}));

/**
 * DataTypeFilterDropdown Component
 *
 * Multi-select dropdown for filtering dataset types in the Type column header.
 * Similar to SelectAllDropdown but with multi-select checkboxes for type filtering.
 *
 * @param {Object} props
 * @param {Set<string>} props.selectedTypes - Set of currently selected type values
 * @param {Function} props.onSelectionChange - Callback when selection changes: (newSet) => void
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 */
const DataTypeFilterDropdown = ({
  selectedTypes,
  onSelectionChange,
  disabled = false,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const dataTypes = ['Model', 'Satellite', 'In-Situ'];

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleType = (type) => {
    const newSelection = new Set(selectedTypes);
    if (newSelection.has(type)) {
      newSelection.delete(type);
    } else {
      newSelection.add(type);
    }
    onSelectionChange(newSelection);
  };

  return (
    <Box className={classes.container}>
      <IconButton
        onClick={handleDropdownClick}
        size="small"
        className={classes.dropdownButton}
        disabled={disabled}
      >
        <ArrowDropDown />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ zIndex: zIndex.MODAL_LAYER_2_POPPER }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {dataTypes.map((type) => (
          <MenuItem
            key={type}
            onClick={() => handleToggleType(type)}
            className={classes.menuItem}
          >
            <Checkbox
              checked={selectedTypes.has(type)}
              color="primary"
              size="small"
              className={classes.checkbox}
            />
            {type}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

DataTypeFilterDropdown.propTypes = {
  selectedTypes: PropTypes.instanceOf(Set).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default DataTypeFilterDropdown;
