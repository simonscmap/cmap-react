import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@material-ui/core';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  // Pattern A: Dropdown-headers style
  headerPatternA: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  headerPatternALabel: {
    fontWeight: (props) => (props.isActive ? 600 : 400),
  },
  arrowButton: {
    padding: theme.spacing(0.5),
  },

  // Pattern B: Headers-only style
  headerPatternB: {
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  },
  headerPatternBLabel: {
    fontWeight: (props) => (props.isActive ? 600 : 400),
  },
  arrowsContainer: {
    display: 'flex',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  arrow: {
    fontSize: '1rem',
  },
  arrowActive: {
    opacity: 1,
    color: theme.palette.primary.main,
  },
  arrowInactive: {
    opacity: 0.3,
    color: theme.palette.text.secondary,
  },
}));

/**
 * SortableHeader Component
 *
 * Column header component with directional sort arrows.
 * Behavior differs based on UI pattern:
 * - Pattern A (dropdown-headers): Shows arrows only on active column, arrow click toggles direction
 * - Pattern B (headers-only): Shows arrows on all columns, header click activates/toggles
 *
 * @param {Object} props - Component props
 * @param {string} props.field - Field key this header represents (must match a key in sort configuration)
 * @param {string} props.label - Display text for the column header
 * @param {boolean} props.isActive - Whether this field is currently the active sort field
 * @param {string} props.direction - Current sort direction ('asc' or 'desc')
 * @param {string} props.uiPattern - UI pattern selection ('dropdown-headers' or 'headers-only')
 * @param {function} [props.onToggle] - Callback when user clicks direction arrow (Pattern A only, required if active)
 * @param {function} [props.onClick] - Callback when user clicks header (Pattern B only, required)
 * @param {string} [props.className] - Additional CSS class for styling
 *
 * @example
 * // Pattern A: Active header with toggle
 * <SortableHeader
 *   field="name"
 *   label="Dataset Name"
 *   isActive={true}
 *   direction="asc"
 *   uiPattern="dropdown-headers"
 *   onToggle={toggleDirection}
 * />
 *
 * @example
 * // Pattern B: Clickable header
 * <SortableHeader
 *   field="name"
 *   label="Dataset Name"
 *   isActive={false}
 *   direction="asc"
 *   uiPattern="headers-only"
 *   onClick={handleHeaderClick}
 * />
 */
const SortableHeader = ({
  field,
  label,
  isActive,
  direction = 'asc',
  uiPattern,
  onToggle,
  onClick,
  className,
}) => {
  const classes = useStyles({ isActive });

  // Validate direction prop
  const validDirection =
    direction === 'asc' || direction === 'desc' ? direction : 'asc';

  // Validate required callbacks based on pattern
  if (uiPattern === 'dropdown-headers' && isActive && !onToggle) {
    console.warn(
      `SortableHeader: Pattern A with active field "${field}" requires onToggle callback`,
    );
  }
  if (uiPattern === 'headers-only' && !onClick) {
    console.warn(
      `SortableHeader: Pattern B for field "${field}" requires onClick callback`,
    );
  }

  // Pattern A: Dropdown-headers (arrow only when active)
  if (uiPattern === 'dropdown-headers') {
    return (
      <Box className={`${classes.headerPatternA} ${className || ''}`}>
        <Typography className={classes.headerPatternALabel}>{label}</Typography>
        {isActive && onToggle && (
          <IconButton
            size="small"
            onClick={onToggle}
            aria-label="Toggle sort direction"
            className={classes.arrowButton}
          >
            {validDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
          </IconButton>
        )}
      </Box>
    );
  }

  // Pattern B: Headers-only (always show both arrows, header clickable)
  if (uiPattern === 'headers-only') {
    const handleClick = () => {
      if (onClick) {
        onClick(field);
      }
    };

    const handleKeyDown = (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && onClick) {
        event.preventDefault();
        onClick(field);
      }
    };

    return (
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Sort by ${label} ${isActive ? validDirection : 'ascending'}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`${classes.headerPatternB} ${className || ''}`}
      >
        <Typography className={classes.headerPatternBLabel}>{label}</Typography>
        <Box className={classes.arrowsContainer}>
          <ArrowUpward
            className={`${classes.arrow} ${
              isActive && validDirection === 'asc'
                ? classes.arrowActive
                : classes.arrowInactive
            }`}
          />
          <ArrowDownward
            className={`${classes.arrow} ${
              isActive && validDirection === 'desc'
                ? classes.arrowActive
                : classes.arrowInactive
            }`}
          />
        </Box>
      </Box>
    );
  }

  // Invalid pattern fallback
  console.error(
    `SortableHeader: Invalid uiPattern "${uiPattern}". Expected "dropdown-headers" or "headers-only"`,
  );
  return <Typography>{label}</Typography>;
};

SortableHeader.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['asc', 'desc']),
  uiPattern: PropTypes.oneOf(['dropdown-headers', 'headers-only']).isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default SortableHeader;
