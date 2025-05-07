import { Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import ClearIcon from '@material-ui/icons/Clear';
import { AiOutlineNodeExpand } from 'react-icons/ai';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { snackbarOpen } from '../../Redux/actions/ui';
import { useDispatch } from 'react-redux';

const TRAJECTORY_POINTS_LIMIT = 70000;

const useStyles = makeStyles((theme) => ({
  selectedCruises: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '.5em',
    margin: '0',
    border: '1px solid #242424', // mimics "box-shadow" style of selctor input fields
    '& > div': {
      textAlign: 'left',
    },
    '& h6': {
      marginBottom: '1em',
    },
    '& a': {
      color: 'white',
    },
  },
  renderButton: {
    textTransform: 'none',
    height: '37px',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    marginTop: '12px',
    whiteSpace: 'nowrap',
    padding: '0, 1em',
    '&.Mui-disabled': {
      color: '#7e7e7e',
      borderColor: '#393939',
    },
  },
  summaryHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: '1em',
    marginTop: '1em',
    textIndent: '.5em',
  },
  clearAllControl: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: '.2em',
    cursor: 'pointer',
    '& p:hover': {
      color: theme.palette.primary.main,
    },
  },
  biggerIcon: {
    fontSize: '1.2em',
    cursor: 'pointer',
  },
  pointer: {
    cursor: 'pointer',
  },
  selectedListScrollable: {
    height: '150px',
    width: '100%',
    overflowY: 'scroll',
  },
  noneSelectedWrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    '& p': {
      fontStyle: 'italic',
    },
  },
  buttonWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));

const findNick = (cruises, selectedCruiseName) => {
  if (!Array.isArray(cruises)) {
    return '';
  }
  const cruise = cruises.find((c) => c.Name === selectedCruiseName);
  if (cruise) {
    return cruise.Nickname;
  } else {
    return '';
  }
};

const SelectorSummary = (props) => {
  const {
    selected,
    cruises,
    handleTrajectoryRender,
    pointCount,
    openContainingGroup,
    handleCruiseSelect,
    lastSelection,
    removeOne,
    removeAll,
  } = props;

  const dispatch = useDispatch();
  const classes = useStyles();

  const deselect = (cruiseName) => {
    const cruise = cruises && cruises.find((c) => c.Name === cruiseName);
    if (!cruise) {
      console.error('cannot match cruise with cruise name', cruiseName);
    } else {
      removeOne(cruise);
    }
  };

  const noneSelected = !selected || selected.length === 0;
  const someSelected = !noneSelected;
  const selectedOverLimit =
    selected.length > 1 && pointCount > TRAJECTORY_POINTS_LIMIT;
  const buttonDisabled = selectedOverLimit || noneSelected;

  useEffect(() => {
    if (selectedOverLimit) {
      dispatch(
        snackbarOpen(
          'The last cruise selected would have caused the total trajectory points to exceed the allowed amount for a single render and has been automatically deselected.',
        ),
      );
      // remove last selection
      handleCruiseSelect(lastSelection);
    }
  }, [selectedOverLimit]);

  let buttonText = '';
  if (noneSelected) {
    buttonText = 'Render Trajectories';
  } else if (selectedOverLimit) {
    buttonText = 'Limit Exceeded: Select Fewer Cruises';
  } else {
    buttonText = `Render ${selected.length} Cruise ${selected.length > 1 ? 'Trajectories' : 'Trajectory'}`;
  }

  return (
    <div>
      <div className={classes.summaryHeader}>
        <Typography variant="h6" component="p">
          Selected Cruises
        </Typography>
        {someSelected ? (
          <div onClick={removeAll} className={classes.clearAllControl}>
            <Typography variant="body2" component="p">
              Clear All
            </Typography>
            <ClearIcon color="primary" />
          </div>
        ) : (
          ''
        )}
      </div>
      <div className={classes.selectedCruises}>
        <div className={classes.selectedListScrollable}>
          {someSelected ? (
            <Grid container>
              <Grid item xs={3}>
                <Typography variant="body2" color="primary">
                  Name
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body2" color="primary">
                  Nickname
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2" color="primary">
                  Go To
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2" color="primary">
                  Deselect
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <div className={classes.noneSelectedWrapper}>
              <Typography variant="body2">None Selected</Typography>
            </div>
          )}

          {selected.map((selectedCruiseName, i) => (
            <Grid container key={`selected-row-item${i}`}>
              <Grid item xs={3}>
                <a
                  href={`/catalog/cruises/${selectedCruiseName}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Typography variant="body1">
                    {selectedCruiseName}{' '}
                    <OpenInNewIcon style={{ fontSize: '.9em' }} />
                  </Typography>
                </a>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">
                  {findNick(cruises, selectedCruiseName)}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography
                  variant="body2"
                  color={'primary'}
                  className={classes.biggerIcon}
                >
                  <AiOutlineNodeExpand
                    onClick={() => openContainingGroup(selectedCruiseName)}
                  />
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography
                  variant="body2"
                  color={'primary'}
                  className={classes.pointer}
                >
                  <ClearIcon onClick={() => deselect(selectedCruiseName)} />
                </Typography>
              </Grid>
            </Grid>
          ))}
        </div>
        <div className={classes.buttonWrapper}>
          <Button
            disabled={buttonDisabled}
            onClick={handleTrajectoryRender}
            variant="outlined"
            className={classes.renderButton}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectorSummary;
