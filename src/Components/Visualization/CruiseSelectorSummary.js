import {
  Button,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect } from 'react';
import styles from './cruiseSelectorStyles';
import ClearIcon from '@material-ui/icons/Clear';
import {AiOutlineNodeExpand} from 'react-icons/ai';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const TRAJECTORY_POINTS_LIMIT = 70000;

const useStyles = makeStyles(styles);

const SelectorSummary = (props) => {
  const {
    selected,
    cruises,
    handleTrajectoryRender,
    pointCount,
    openContainingGroup,
    removeOne,
    removeAll,
  } = props;
  const classes = useStyles();

  if (!selected || selected.length === 0) {
    return '';
  }

  const deselect = (cruiseName) => {
    const cruise = cruises.find ((c) => c.Name === cruiseName);
    if (!cruise) {
      console.error ('cannot match cruise with cruise name', cruiseName);
    }
    removeOne (cruise);
  }



  return (
    <div className={classes.selectedCruises}>
      <div className={classes.summaryHeader}>
        <Typography variant="h6" component="p">Selected Cruises</Typography>
        <ClearIcon onClick={removeAll} color="primary"/>
      </div>
      <Grid container>
        <Grid item xs={3}>
          <Typography variant="body2" color="primary">Name</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography variant="body2" color="primary">Nickname</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body2" color="primary">Go To</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body2" color="primary">Deselect</Typography>
        </Grid>

      </Grid>
      {selected.map((selectedCruiseName, i) => (
        <Grid container key={`selected-row-item${i}`} >
          <Grid item xs={3}>
            <a href={`/catalog/cruises/${selectedCruiseName}`} target="_blank">
              <Typography variant="body1">
                {selectedCruiseName} <OpenInNewIcon style={{ fontSize: '.9em' }} />
              </Typography>
            </a>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">
              {cruises
                ? (cruises.find((c) => c.Name === selectedCruiseName)).Nickname
                : ''
              }
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color={'primary'} className={classes.biggerIcon}>
              <AiOutlineNodeExpand onClick={() => openContainingGroup(selectedCruiseName)} />
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color={'primary'}>
              <ClearIcon onClick={() => deselect(selectedCruiseName)} />
            </Typography>
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
