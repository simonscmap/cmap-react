import {
  Button,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from './cruiseSelectorStyles';
import { Link as RouterLink } from 'react-router-dom';

const TRAJECTORY_POINTS_LIMIT = 70000;

const useStyles = makeStyles(styles);

const SelectorSummary = (props) => {
  const { selected, cruises, handleTrajectoryRender, pointCount } = props;
  const classes = useStyles();

  if (!selected || selected.length === 0) {
    return '';
  }

  return (
    <div className={classes.selectedCruises}>
      <Typography variant="h6">Selected Cruises</Typography>
      <Grid container>
        <Grid item xs={1}></Grid>
        <Grid item xs={3}>
          <Typography variant="body2" color="primary">Name</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body2" color="primary">Nickname</Typography>
        </Grid>
      </Grid>
      {selected.map((selectedCruiseName, i) => (
        <Grid container key={`selected-row-item${i}`} >
          <Grid item xs={1}>
            <Typography variant="body2" color={'primary'}>{i + 1}.</Typography>
          </Grid>
          <Grid item xs={3}>
            <RouterLink to={`/catalog/cruises/${selectedCruiseName}`}>
              <Typography variant="body1">
                {selectedCruiseName}
              </Typography>
            </RouterLink>
          </Grid>
          <Grid item xs={8}>
            <RouterLink to={`/catalog/cruises/${selectedCruiseName}`}>
              <Typography variant="body1">
                {cruises
                  ? (cruises.find((c) => c.Name === selectedCruiseName)).Nickname
                  : ''
                }
              </Typography>
            </RouterLink>
          </Grid>
        </Grid>
      ))}
      <Button
        disabled={selected.length > 1 && pointCount > TRAJECTORY_POINTS_LIMIT}
        onClick={handleTrajectoryRender}
        variant="outlined"
        className={classes.renderButton}>
        {(selected.length > 1 && pointCount > TRAJECTORY_POINTS_LIMIT)
          ? `Limit Exceeded: Select Fewer Cruises`
          : `Render ${selected.length} Cruise ${selected.length > 1 ? 'Trajectories' : 'Trajectory'}`}
      </Button>
    </div>
  );
}

export default SelectorSummary;
