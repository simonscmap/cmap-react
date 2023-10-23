import {
  Paper,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import palette from 'google-palette';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
  legend: {
    position: 'absolute',
    top: '268px',
    left: '14px',
    color: 'white',
    '& h6': {

    }
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
  },
  paper: {
    border: '1px solid black',
    backdropFilter: 'blur(5px)',
    width: '172px',
    padding: '1em'
  },
  legendEntry: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '1em',
  },
  swatch: {
    height: '1em',
    width: '1em',
    textAlign: 'center',
    borderRadius: '.5em',
  }
}));

const Legend = () => {
  const classes = useStyles();

  const renderedCruiseIds = useSelector ((state) =>
    Object.entries((state.cruiseTrajectories || {}))
      .map(([key]) => parseInt(key, 10)));

  const cruises = useSelector ((state) =>
    state.cruiseList.filter(c => renderedCruiseIds.includes(c.ID)));

  if (!renderedCruiseIds || renderedCruiseIds.length === 0) {
    return '';
  }

  const colors = palette('rainbow', renderedCruiseIds.length).map((hex) => `#${hex}`)


  return (
    <div className={classes.legend}>
      <Paper className={classes.paper}>
        <Typography variant="h6">Legend</Typography>
        <div className={classes.wrapper}>
          {cruises.map((cruise, i) => (
            <div className={classes.legendEntry} key={`chip-wrapper${i}`}>
              <div
                className={classes.swatch}
                style={{ backgroundColor: colors[i] }}
              >
              </div>
              <div>
                <Typography variant="body1">{cruise.Name}</Typography>
              </div>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
}

export default Legend;
