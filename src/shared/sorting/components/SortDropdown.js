import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
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
  menuItem: {
    paddingLeft: 16,
  },
  label: {
    color: colors.primary,
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
  renderValue: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  directionHitArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    margin: '-100px 0 -100px -8px',
    padding: '100px 4px 100px 8px',
    cursor: 'pointer',
    '&:hover $directionArrow': {
      color: colors.teal,
    },
  },
  directionArrow: {
    fontSize: '1rem',
    color: colors.primary,
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

  let handleArrowClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (onToggleDirection) {
      onToggleDirection();
    }
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

  let activeFieldConfig = activeField
    ? validFields.find((f) => f.key === activeField)
    : null;

  let getRenderValue = () => {
    let fieldLabel = activeFieldConfig
      ? (activeFieldConfig.label || activeFieldConfig.key)
      : '';

    if (!showDirection) {
      return fieldLabel;
    }

    let ArrowIcon = direction === 'asc' ? ArrowUpward : ArrowDownward;

    return (
      <span className={classes.renderValue}>
        <span
          className={classes.directionHitArea}
          onMouseDown={handleArrowClick}
        >
          <Tooltip title={directionLabel} placement="top">
            <ArrowIcon className={classes.directionArrow} />
          </Tooltip>
        </span>
        {fieldLabel}
      </span>
    );
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      disabled={isDisabled}
      className={`${classes.formControl} ${className || ''}`}
    >
      <InputLabel className={classes.label}>{label}</InputLabel>
      <Select
        value={activeField || ''}
        onChange={handleChange}
        label={label}
        className={classes.select}
        renderValue={getRenderValue}
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
            <MenuItem key={field.key} value={field.key} className={classes.menuItem}>
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
  direction: PropTypes.oneOf(['asc', 'desc']),
  onToggleDirection: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default SortDropdown;
