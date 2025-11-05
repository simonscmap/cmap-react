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
    color: (props) => (props.isActive ? '#69fff2' : 'inherit'),
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
    padding: 0,
    '&:hover': {
      opacity: 0.8,
    },
  },
  headerPatternBLabel: {
    fontWeight: (props) => (props.isActive ? 600 : 400),
    color: (props) => (props.isActive ? '#69fff2' : 'inherit'),
    fontSize: '14px',
    maxHeight: '2.8em', // ~2 lines at 1.4 line-height
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    lineHeight: 1.4,
    textAlign: 'center',
  },
  arrowsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: theme.spacing(0.25),
    gap: 0,
  },
  arrow: {
    fontSize: '0.65rem', // Smaller triangles
    height: '10px',
    width: '10px',
  },
  arrowActive: {
    opacity: 1,
    color: '#69fff2', // Match active header color
  },
  arrowInactive: {
    opacity: 0.3,
    color: '#69fff2',
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
          {isActive && validDirection === 'asc' ? (
            <ArrowUpward
              className={`${classes.arrow} ${classes.arrowActive}`}
            />
          ) : (
            <ArrowDownward
              className={`${classes.arrow} ${
                isActive ? classes.arrowActive : classes.arrowInactive
              }`}
            />
          )}
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
  label: PropTypes.node.isRequired, // Changed from string to node to support React elements
  isActive: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['asc', 'desc']),
  uiPattern: PropTypes.oneOf(['dropdown-headers', 'headers-only']).isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default SortableHeader;
