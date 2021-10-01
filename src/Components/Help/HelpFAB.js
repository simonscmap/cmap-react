import { makeStyles } from '@material-ui/core/styles';
import { Slide, Tooltip } from '@material-ui/core';
import React from 'react';
import HelpIcon from '@material-ui/icons/Help';
import Fab from '@material-ui/core/Fab';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { toggleHints } from '../../Redux/actions/help';

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
