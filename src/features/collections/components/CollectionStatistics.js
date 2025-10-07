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
  statisticValue: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: theme.spacing(0.5),
  },
  statisticLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

/**
 * CollectionStatistics - A reusable statistics display component
 *
 * @param {Object} props
 * @param {Array<{value: string|number, label: string}>} props.stats - Array of stat objects to display
 *   Each stat should have a value (string or number) and a label (string)
 * @param {number} [props.itemsPerRow=4] - Number of stat items per row on md+ screens
 */
const CollectionStatistics = ({ stats, itemsPerRow = 4 }) => {
  const classes = useStyles();
  const gridSize = Math.floor(12 / itemsPerRow);

  return (
    <Grid container spacing={2} className={classes.statisticsContainer}>
      {stats.map((stat, index) => (
        <Grid item xs={6} md={gridSize} key={index}>
          <Card className={classes.statisticsCard} elevation={0}>
            <CardContent className={classes.cardContent}>
              <Typography variant="h4" className={classes.statisticValue}>
                {stat.value}
              </Typography>
              <Typography variant="body2" className={classes.statisticLabel}>
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CollectionStatistics;
