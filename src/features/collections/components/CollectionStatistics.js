import React from 'react';
import { Grid, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  statisticsContainer: {
    marginBottom: theme.spacing(3),
  },
  statisticsCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${theme.palette.divider}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

/**
 * CollectionStatistics - A reusable statistics display component
 *
 * Displays statistics in a grid layout. Supports showing changed values
 * by displaying the original value with strikethrough next to the current value.
 *
 * @param {Object} props
 * @param {Array<StatObject>} props.stats - Array of stat objects to display
 * @param {number} [props.itemsPerRow=4] - Number of stat items per row on md+ screens
 * @param {boolean} [props.compact=false] - When true, displays stats in a compact mode with:
 *   - Half the height of standard mode
 *   - Label and value in a row instead of stacked vertically
 *   - Reduced font sizes
 *
 * @typedef {Object} StatObject
 * @property {string|number} [value] - The value to display (standard usage)
 * @property {string|number} [currentValue] - The current/new value (only for change indicator pattern)
 * @property {string|number} [originalValue] - The original value before changes (only for change indicator pattern)
 *   When both currentValue and originalValue are provided and differ, displays as: ~~originalValue~~ currentValue
 * @property {string} label - The label text for this statistic
 *
 * IMPORTANT: Use EITHER the standard pattern OR the change indicator pattern, not both:
 * - Standard pattern: Use `value` prop only
 * - Change indicator pattern: Use `currentValue` + `originalValue` props (do NOT use `value`)
 *
 * @example
 * // Standard usage (backward compatible)
 * <CollectionStatistics
 *   stats={[
 *     { value: 7, label: 'Datasets' },
 *     { value: 'Oct 17', label: 'Last Modified' }
 *   ]}
 * />
 *
 * @example
 * // Compact mode
 * <CollectionStatistics
 *   compact
 *   stats={[
 *     { value: 7, label: 'Datasets' },
 *     { value: 'Oct 17', label: 'Last Modified' }
 *   ]}
 * />
 *
 * @example
 * // Change indicator pattern (special case for showing edits)
 * <CollectionStatistics
 *   stats={[
 *     { currentValue: 10, originalValue: 7, label: 'Datasets' }, // Shows: ~~7~~ 10
 *     { value: 'Oct 17', label: 'Last Modified' } // Standard display
 *   ]}
 * />
 */
const CollectionStatistics = ({ stats, itemsPerRow = 4, compact = false }) => {
  const classes = useStyles();
  const gridSize = Math.floor(12 / itemsPerRow);

  return (
    <Grid
      container
      spacing={compact ? 1 : 2}
      className={classes.statisticsContainer}
    >
      {stats.map((stat, index) => {
        // Check if using change indicator pattern (currentValue + originalValue)
        const isChangeIndicatorPattern =
          stat.currentValue !== undefined && stat.originalValue !== undefined;
        const hasChange =
          isChangeIndicatorPattern && stat.originalValue !== stat.currentValue;

        // Determine display value: prefer change indicator pattern, fall back to standard value
        const displayValue = isChangeIndicatorPattern
          ? stat.currentValue
          : stat.value;

        return (
          <Grid item xs={6} md={gridSize} key={index}>
            <Card className={classes.statisticsCard} elevation={0}>
              <CardContent
                className={
                  compact ? classes.cardContentCompact : classes.cardContent
                }
              >
                {compact ? (
                  // Compact mode: label and value in a row
                  <>
                    <Typography
                      variant="body2"
                      className={classes.statisticLabelCompact}
                    >
                      {stat.label}
                    </Typography>
                    {hasChange ? (
                      <div className={classes.statisticValueContainerCompact}>
                        <Typography
                          variant="h6"
                          className={`${classes.statisticValueCompact} ${classes.strikethroughCompact}`}
                        >
                          {stat.originalValue}
                        </Typography>
                        <Typography
                          variant="h6"
                          className={classes.statisticValueCompact}
                        >
                          {stat.currentValue}
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
                          {stat.originalValue}
                        </Typography>
                        <Typography
                          variant="h4"
                          className={classes.statisticValue}
                          style={{ marginBottom: 0 }}
                        >
                          {stat.currentValue}
                        </Typography>
                      </div>
                    ) : (
                      <Typography
                        variant="h4"
                        className={classes.statisticValue}
                      >
                        {displayValue}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      className={classes.statisticLabel}
                    >
                      {stat.label}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CollectionStatistics;
