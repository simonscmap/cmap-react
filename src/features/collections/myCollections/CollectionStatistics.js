import React from 'react';
import { Grid, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useCollectionsStore from '../state/collectionsStore';

const useStyles = makeStyles((theme) => ({
  statisticsContainer: {
    marginBottom: theme.spacing(3),
  },
  statisticsCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${theme.palette.divider}`,
  },
  cardContent: {
    padding: `${theme.spacing(2)}px !important`,
    textAlign: 'center',
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

const CollectionStatistics = () => {
  const classes = useStyles();
  const { statistics } = useCollectionsStore();

  const stats = [
    {
      value: statistics.totalCollections,
      label: 'Total Collections',
    },
    {
      value: statistics.publicCollections,
      label: 'Public Collections',
    },
    {
      value: statistics.privateCollections,
      label: 'Private Collections',
    },
    {
      value: statistics.totalDatasets,
      label: 'Total Datasets',
    },
  ];

  return (
    <Grid container spacing={2} className={classes.statisticsContainer}>
      {stats.map((stat, index) => (
        <Grid item xs={6} sm={3} key={index}>
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
