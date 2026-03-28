import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../enums/colors';

let useStyles = makeStyles(() => ({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
  },
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
  directionButton: {
    padding: 4,
    color: colors.teal,
    '&:hover': {
      backgroundColor: colors.blueHover,
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.1rem',
    },
  },
}));

const SortDropdown = ({
  fields,
  activeField,
  onFieldChange,
  direction,
  onToggleDirection,
  label = 'Sort By',
  disabled = false,
  className,
}) => {
  let classes = useStyles();

  let handleChange = (event) => {
    let selectedKey = event.target.value;
    onFieldChange(selectedKey);
  };

  let validFields = fields.filter((field) => {
    if (!field.key) {
      return false;
    }
    return true;
  });

  let isEmpty = validFields.length === 0;
  let isDisabled = disabled || isEmpty;
  let showDirection = onToggleDirection && activeField && direction;
  let directionLabel = direction === 'asc' ? 'Ascending' : 'Descending';

  return (
    <Box className={classes.container}>
      <FormControl disabled={isDisabled} className={`${classes.formControl} ${className || ''}`}>
        {label && <InputLabel id="sort-field-label" className={classes.label}>{label}</InputLabel>}
        <Select
          labelId="sort-field-label"
          value={activeField || ''}
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
      {showDirection && (
        <Tooltip title={directionLabel} placement="top">
          <IconButton
            onClick={onToggleDirection}
            className={classes.directionButton}
            disabled={isDisabled}
            size="small"
          >
            {direction === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
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
  direction: PropTypes.oneOf(['asc', 'desc']),
  onToggleDirection: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default SortDropdown;
