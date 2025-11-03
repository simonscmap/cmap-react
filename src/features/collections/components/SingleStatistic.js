import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'inline-flex',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${theme.palette.divider}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardContent: {
    padding: `${theme.spacing(2)}px !important`,
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardContentCompact: {
    padding: `${theme.spacing(1)}px !important`,
    textAlign: 'left',
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  statisticValue: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: theme.spacing(0.5),
  },
  statisticValueCompact: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    fontSize: '0.875rem',
    marginBottom: 0,
  },
  statisticValueContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  statisticValueContainerCompact: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing(0.5),
    marginBottom: 0,
    flexShrink: 0,
  },
  strikethrough: {
    position: 'relative',
    opacity: 0.6,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '-5%',
      top: '50%',
      width: '110%',
      height: 0,
      borderTop: '2px solid currentColor',
      transform: 'rotate(-25deg) translateY(-50%)',
      transformOrigin: 'center',
      pointerEvents: 'none',
    },
  },
  strikethroughCompact: {
    position: 'relative',
    opacity: 0.6,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '-5%',
      top: '50%',
      width: '110%',
      height: 0,
      borderTop: '1px solid currentColor',
      transform: 'rotate(-25deg) translateY(-50%)',
      transformOrigin: 'center',
      pointerEvents: 'none',
    },
  },
  statisticLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statisticLabelCompact: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flex: 1,
    minWidth: 0,
  },
  // Ellipsis control for compact mode labels
  labelNoEllipsis: {
    whiteSpace: 'normal',
    overflow: 'visible',
    textOverflow: 'clip',
  },
  labelEllipsis: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

/**
 * SingleStatistic - A single inline statistic display component
 *
 * Displays a single statistic with intrinsic sizing (width based on content).
 * Designed for inline placement with other UI elements, unlike CollectionStatistics
 * which uses Grid and fills available space.
 *
 * Visual appearance matches CollectionStatistics exactly, but layout behavior
 * is optimized for single-item inline usage.
 *
 * @param {Object} props
 * @param {string|number} [props.value] - The value to display (standard usage)
 * @param {string|number} [props.currentValue] - The current/new value (only for change indicator pattern)
 * @param {string|number} [props.originalValue] - The original value before changes (only for change indicator pattern)
 *   When both currentValue and originalValue are provided and differ, displays as: ~~originalValue~~ currentValue
 * @param {string} props.label - The label text for this statistic
 * @param {string} [props.borderColor] - Optional left border color (e.g., 'rgba(128, 128, 128, 0.6)')
 * @param {boolean} [props.compact=false] - When true, displays in compact mode (half height, horizontal layout)
 * @param {string|number} [props.maxWidth] - Optional max width for the container (e.g., '280px', 280)
 * @param {boolean} [props.noEllipsis=false] - When true, allows label text to wrap (disables ellipsis truncation)
 *
 * IMPORTANT: Use EITHER the standard pattern OR the change indicator pattern, not both:
 * - Standard pattern: Use `value` prop only
 * - Change indicator pattern: Use `currentValue` + `originalValue` props (do NOT use `value`)
 *
 * @example
 * // Standard usage
 * <SingleStatistic
 *   value={7}
 *   label="Datasets"
 *   compact
 *   maxWidth="280px"
 * />
 *
 * @example
 * // With border accent
 * <SingleStatistic
 *   value={6}
 *   label="Already in Collection"
 *   borderColor="rgba(128, 128, 128, 0.6)"
 *   compact
 *   noEllipsis
 * />
 *
 * @example
 * // Change indicator pattern
 * <SingleStatistic
 *   currentValue={10}
 *   originalValue={7}
 *   label="Datasets"
 *   compact
 * />
 */
const SingleStatistic = ({
  value,
  currentValue,
  originalValue,
  label,
  borderColor,
  compact = false,
  maxWidth,
  noEllipsis = false,
}) => {
  const classes = useStyles();

  // Check if using change indicator pattern (currentValue + originalValue)
  const isChangeIndicatorPattern =
    currentValue !== undefined && originalValue !== undefined;
  const hasChange = isChangeIndicatorPattern && originalValue !== currentValue;

  // Determine display value: prefer change indicator pattern, fall back to standard value
  const displayValue = isChangeIndicatorPattern ? currentValue : value;

  // Build label className for compact mode
  const labelClassName = compact
    ? `${classes.statisticLabelCompact} ${noEllipsis ? classes.labelNoEllipsis : classes.labelEllipsis}`
    : classes.statisticLabel;

  return (
    <div
      className={classes.container}
      style={maxWidth ? { maxWidth } : undefined}
    >
      <Card
        className={classes.card}
        elevation={0}
        style={
          borderColor ? { borderLeft: `4px solid ${borderColor}` } : undefined
        }
      >
        <CardContent
          className={compact ? classes.cardContentCompact : classes.cardContent}
        >
          {compact ? (
            // Compact mode: label and value in a row
            <>
              <Typography variant="body2" className={labelClassName}>
                {label}
              </Typography>
              {hasChange ? (
                <div className={classes.statisticValueContainerCompact}>
                  <Typography
                    variant="h6"
                    className={`${classes.statisticValueCompact} ${classes.strikethroughCompact}`}
                  >
                    {originalValue}
                  </Typography>
                  <Typography
                    variant="h6"
                    className={classes.statisticValueCompact}
                  >
                    {currentValue}
                  </Typography>
                </div>
              ) : (
                <Typography
                  variant="h6"
                  className={classes.statisticValueCompact}
                >
                  {displayValue}
                </Typography>
              )}
            </>
          ) : (
            // Standard mode: value on top, label on bottom
            <>
              {hasChange ? (
                <div className={classes.statisticValueContainer}>
                  <Typography
                    variant="h4"
                    className={`${classes.statisticValue} ${classes.strikethrough}`}
                    style={{ marginBottom: 0 }}
                  >
                    {originalValue}
                  </Typography>
                  <Typography
                    variant="h4"
                    className={classes.statisticValue}
                    style={{ marginBottom: 0 }}
                  >
                    {currentValue}
                  </Typography>
                </div>
              ) : (
                <Typography variant="h4" className={classes.statisticValue}>
                  {displayValue}
                </Typography>
              )}
              <Typography variant="body2" className={classes.statisticLabel}>
                {label}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

SingleStatistic.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  originalValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string.isRequired,
  borderColor: PropTypes.string,
  compact: PropTypes.bool,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  noEllipsis: PropTypes.bool,
};

export default SingleStatistic;
