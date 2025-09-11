import React, { useState } from 'react';
import { Checkbox, Menu, MenuItem, IconButton, Box } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    marginLeft: '-9px', // Offset to align with row checkboxes
  },
  checkbox: {
    padding: '9px', // Match default Material-UI checkbox padding
  },
  dropdownButton: {
    padding: '2px',
    minWidth: 'auto',
    marginLeft: '-4px', // Reduce gap between checkbox and dropdown arrow
    '& .MuiSvgIcon-root': {
      fontSize: '16px',
    },
  },
  menuItem: {
    fontSize: '14px',
    padding: '8px 16px',
    minHeight: 'auto',
  },
}));

const SelectAllDropdown = ({
  areAllSelected,
  areIndeterminate,
  onSelectAll,
  onClearAll,
  disabled = false,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    action();
    handleClose();
  };

  return (
    <Box className={classes.container}>
      <Checkbox
        indeterminate={areIndeterminate}
        checked={areAllSelected}
        color="primary"
        className={classes.checkbox}
        disabled={disabled}
        // Remove onChange since dropdown handles the actions
      />
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
        style={{ zIndex: 9999 }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={() => handleMenuItemClick(onSelectAll)}
          className={classes.menuItem}
        >
          Select All
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuItemClick(onClearAll)}
          className={classes.menuItem}
        >
          Clear All
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SelectAllDropdown;
