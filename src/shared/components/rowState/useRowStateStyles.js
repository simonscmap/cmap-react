import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

/**
 * Row state constants for dataset tables
 */
export const ROW_STATES = {
  NORMAL: 'normal',
  INVALID: 'invalid',
  MARKED_FOR_REMOVAL: 'markedForRemoval',
  NEWLY_ADDED: 'newlyAdded',
  ALREADY_PRESENT: 'alreadyPresent',
};

/**
 * Material-UI styles for row states
 */
const useStyles = makeStyles(() => ({
  // Base row styling
  tableRow: {
    boxShadow: 'inset 3px 0 0 transparent',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '& .MuiTableCell-root:first-child': {
      paddingLeft: '16px',
    },
    '& .MuiTableCell-root:last-child': {
      paddingRight: '16px',
    },
    '& ::selection': {
      backgroundColor: 'transparent',
    },
  },
  // Invalid dataset styling (yellow warning)
  invalidRow: {
    opacity: 0.8,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    boxShadow: 'inset 3px 0 0 rgba(255, 193, 7, 0.6)',
  },
  // Marked for removal styling (red, line-through)
  markedForRemovalRow: {
    opacity: 0.8,
    backgroundColor: 'rgba(211, 47, 47, 0.15)',
    boxShadow: 'inset 3px 0 0 rgba(211, 47, 47, 0.6)',
    '& .MuiTableCell-root:not(:first-child):not(:last-child)': {
      textDecoration: 'line-through',
    },
  },
  // Already present in collection (gray, dimmed)
  alreadyPresentRow: {
    opacity: 0.6,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    boxShadow: 'inset 3px 0 0 rgba(128, 128, 128, 0.6)',
    '&:hover': {
      backgroundColor: 'rgba(128, 128, 128, 0.15)',
    },
  },
  // Newly added to collection (purple)
  newlyAddedRow: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    boxShadow: 'inset 3px 0 0 rgba(156, 39, 176, 0.8)',
    '&:hover': {
      backgroundColor: 'rgba(156, 39, 176, 0.15)',
    },
  },
  // Status label base styling
  statusLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    lineHeight: '0.8rem',
    textDecoration: 'none !important', // Override line-through from markedForRemoval row
    display: 'inline-block',
  },
  // Normal/empty state label (em dash placeholder)
  normalLabel: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  // Invalid dataset label (yellow)
  invalidLabel: {
    color: '#ffc107',
  },
  // Newly added label (purple)
  addedLabel: {
    color: '#9c27b0',
  },
  // Marked for removal label (red)
  removedLabel: {
    color: '#d32f2f',
  },
  // Already present label (gray)
  alreadyPresentLabel: {
    color: '#808080',
    textAlign: 'center',
  },
}));

/**
 * Hook that provides row state styling and label rendering for dataset tables
 *
 * @returns {Object} Object containing:
 *   - getRowClassName: Function that returns CSS class string for a given row state
 *   - getStatusLabel: Function that returns JSX text label element for a given row state
 *   - ROW_STATES: Constant object with available row state values
 *   - classes: Material-UI classes object for advanced use cases
 *
 * @example
 * const { getRowClassName, getStatusLabel, ROW_STATES } = useRowStateStyles();
 *
 * // Get row class name
 * const rowClass = getRowClassName(ROW_STATES.INVALID);
 *
 * // Render status label
 * const label = getStatusLabel(ROW_STATES.NORMAL);
 */
export const useRowStateStyles = () => {
  const classes = useStyles();

  /**
   * Get combined CSS class names for a row based on its state
   *
   * @param {string} rowState - One of ROW_STATES values
   * @returns {string} Combined CSS class string
   */
  const getRowClassName = (rowState) => {
    const baseClass = classes.tableRow;

    switch (rowState) {
      case ROW_STATES.INVALID:
        return `${baseClass} ${classes.invalidRow}`;
      case ROW_STATES.MARKED_FOR_REMOVAL:
        return `${baseClass} ${classes.markedForRemovalRow}`;
      case ROW_STATES.ALREADY_PRESENT:
        return `${baseClass} ${classes.alreadyPresentRow}`;
      case ROW_STATES.NEWLY_ADDED:
        return `${baseClass} ${classes.newlyAddedRow}`;
      case ROW_STATES.NORMAL:
      default:
        return baseClass;
    }
  };

  /**
   * Get status label JSX element for a row based on its state
   *
   * Priority order: markedForRemoval > invalid > newlyAdded > alreadyPresent > normal
   *
   * @param {string} rowState - One of ROW_STATES values
   * @returns {JSX.Element} Text label component with appropriate styling, or em dash for normal state
   */
  const getStatusLabel = (rowState) => {
    switch (rowState) {
      case ROW_STATES.MARKED_FOR_REMOVAL:
        return (
          <span className={`${classes.statusLabel} ${classes.removedLabel}`}>
            To Be Removed
          </span>
        );
      case ROW_STATES.INVALID:
        return (
          <span className={`${classes.statusLabel} ${classes.invalidLabel}`}>
            Not Available
          </span>
        );
      case ROW_STATES.NEWLY_ADDED:
        return (
          <span className={`${classes.statusLabel} ${classes.addedLabel}`}>
            To Be Added
          </span>
        );
      case ROW_STATES.ALREADY_PRESENT:
        return (
          <span
            className={`${classes.statusLabel} ${classes.alreadyPresentLabel}`}
          >
            Already in Collection
          </span>
        );
      case ROW_STATES.NORMAL:
      default:
        return (
          <span className={`${classes.statusLabel} ${classes.normalLabel}`}>
            —
          </span>
        );
    }
  };

  return {
    getRowClassName,
    getStatusLabel,
    getStatusIcon: getStatusLabel, // Backward compatibility alias
    ROW_STATES,
    classes,
  };
};
