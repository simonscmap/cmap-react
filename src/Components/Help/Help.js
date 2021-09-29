import { makeStyles } from '@material-ui/core/styles';
import { Slide, Tooltip } from '@material-ui/core';
import React from 'react';
import HelpIcon from '@material-ui/icons/Help';
import Fab from '@material-ui/core/Fab';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { toggleHints, helpActionTypes } from '../../Redux/actions/help';
import { persistenceService } from '../../Services/persist';
import { LOCAL_STORAGE_KEY_HINTS_STATE } from '../../constants.js';

// this could also be a good icon for the help button:
// import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';

// style the button and its icon
// the button stlye serves as a background to the icon
const useStyles = makeStyles((theme) => ({
  helpButton: {
    position: 'absolute',
    right: theme.spacing(2),
    bottom: theme.spacing(2),
  },
  helpButtonEnabled: {
    backgroundColor: '#1D4962',
  },
  helpButtonDisabled: {
    backgroundColor: '#9dd162',
  },
  helpIconEnabled: {
    fontSize: '5em',
    color: '#9dd162',
    '&:hover': {
      color: '#bcef81', // brighter green
    },
  },
  helpIconDisabled: {
    fontSize: '5em',
    color: '#1D4962',
    '&:hover': {
      color: '#9dd162',
    },
  },
}));

persistenceService.add({
  actionType: helpActionTypes.TOGGLE_HINTS,
  key: LOCAL_STORAGE_KEY_HINTS_STATE,
  payloadToValue: (currentState, payload) => {
    let oldState = currentState || {};
    let newState = Object.assign({}, {
      [payload]: !oldState[payload]
    });
    return newState;
  },
  // TODO
  localToDispatch: () => { },
});

function Help(props) {
  const { pageName } = props;
  const classes = useStyles();
  const hintsAreEnabled = useSelector(({ hints }) => hints[pageName]);
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(toggleHints(pageName));
  };

  // this can control when the help button slides into view
  let showHints = true;

  let iconClasses = hintsAreEnabled ? classes.helpIconEnabled : classes.helpIconDisabled;
  let buttonClasses = hintsAreEnabled
    ? classes.helpButtonEnabled
    : classes.helpButtonDisabled;
  let tooltipTitle = hintsAreEnabled ? 'Disable help' : 'Enable help';

  return (
    <Slide direction="up" in={showHints} mountOnEnter>
      <Tooltip title={tooltipTitle} aria-label="help" placement="left">
        <Fab
          className={clsx(classes.helpButton, buttonClasses)}
          color="inherit"
        >
          <HelpIcon className={iconClasses} onClick={handleClick} />
        </Fab>
      </Tooltip>
    </Slide>
  );
}

export default Help;
