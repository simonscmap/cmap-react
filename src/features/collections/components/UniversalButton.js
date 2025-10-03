import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import colors from '../../../enums/colors';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: '20px',
    textTransform: 'none',
    fontWeight: 500,
    lineHeight: 1,
    minWidth: 'auto',
    width: 'fit-content',
    boxSizing: 'border-box',
  },

  // Size variants
  sizeSmall: {
    height: '24px',
    padding: '4px 10px',
    fontSize: '11px',
  },
  sizeMedium: {
    height: '28px',
    padding: '4px 12px',
    fontSize: '12px',
  },
  sizeLarge: {
    height: '36px',
    padding: '6px 16px',
    fontSize: '14px',
  },

  // Variant styles
  primary: {
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    '&:hover': {
      border: `1px solid ${colors.primary}`,
      backgroundColor: colors.greenHover,
    },
  },
  secondary: {
    color: '#9e9e9e',
    border: '1px solid #9e9e9e',
    '&:hover': {
      border: '1px solid #9e9e9e',
      backgroundColor: 'rgba(158, 158, 158, 0.1)',
    },
  },
  danger: {
    color: '#fff',
    backgroundColor: '#d32f2f',
    '&:hover': {
      backgroundColor: '#b71c1c',
    },
  },
  // default variant uses Material-UI defaults
}));

const CollectionButton = ({
  variant = 'default',
  size = 'medium',
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  children,
  fullWidth = false,
  ...otherProps
}) => {
  const classes = useStyles();

  // Build className based on variant and size
  const variantClass = variant !== 'default' ? classes[variant] : '';
  const sizeClass =
    classes[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];

  return (
    <Button
      className={`${classes.root} ${variantClass} ${sizeClass}`}
      variant={
        variant === 'danger'
          ? 'contained'
          : variant === 'default'
            ? 'text'
            : 'outlined'
      }
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      {...otherProps}
    >
      {children}
    </Button>
  );
};

CollectionButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'default']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
};

export default CollectionButton;
