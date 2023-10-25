import {
  Paper,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { MdMyLocation } from 'react-icons/md';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import palette from 'google-palette';
import { cruiseTrajectoryZoomTo } from '../../Redux/actions/visualization';
import colors from '../../enums/colors';

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
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1em',
    width: '100%',
    margin: '.3em 0'
  },
  swatch: {
    height: '1em',
    width: '1em',
    textAlign: 'center',
    borderRadius: '.5em',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '.5em',
    '& a': {
      color: 'white',
    },
    '& p': {
      margin: 0,
      paddingRight: '2px',
      '& span': {
        color: 'white',
        '&:hover': {
          textDecoration: 'underline',
        }
      }
    }
  },
  zoomIcon: {
    color: colors.primary,
    '& svg': {
      fontSize: '1.1em',
      marginBottom: '-3px'
    }
  },
  openPageIcon: {
    color: colors.primary,
    '& svg': {
      marginBottom: '-4px',
      marginLeft: '5px',
      fontSize: '1.1em',
    }
  }
}));

const Legend = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const renderedCruiseIds = useSelector ((state) =>
    Object.entries((state.cruiseTrajectories || {}))
      .map(([key]) => parseInt(key, 10)));

  const cruises = useSelector ((state) =>
    state.cruiseList.filter(c => renderedCruiseIds.includes(c.ID)));

  if (!renderedCruiseIds || renderedCruiseIds.length === 0) {
    return '';
  }

  const colors = palette('rainbow', renderedCruiseIds.length).map((hex) => `#${hex}`);

  const handleFocus = (cruiseId) => {
    dispatch (cruiseTrajectoryZoomTo (cruiseId));
  }

  return (
    <div className={classes.legend}>
      <Paper className={classes.paper}>
        <div className={classes.wrapper}>
          {cruises.map((cruise, i) => (
            <div className={classes.legendEntry} key={`chip-wrapper${i}`}>
              <div className={classes.container}>
                <div
                  className={classes.swatch}
                  style={{ backgroundColor: colors[i] }}
                >
                </div>
                <div className={classes.container}>
                  <a href={`/catalog/cruises/${cruise.Name}`} target="_blank" rel="noreferrer">
                    <p className={classes.openPageIcon}>
                      <span>{cruise.Name}</span>
                      <OpenInNewIcon color="primary" />
                    </p>
                  </a>
                </div>
              </div>
              <div className={classes.container}>
                <p className={classes.zoomIcon}>
                  <MdMyLocation color="primary" onClick={() => handleFocus(cruise.ID)} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
}

export default Legend;
