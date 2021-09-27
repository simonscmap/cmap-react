import { makeStyles } from '@material-ui/core/styles';
import { Slide, Tooltip } from '@material-ui/core';
import React, { useEffect } from 'react';
// import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
// import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import HelpIcon from '@material-ui/icons/Help';
import Fab from '@material-ui/core/Fab';
import clsx from 'clsx';

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
  const classes = useStyles();
  const [isOpen, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!isOpen);
  };

  let iconClasses = isOpen ? classes.helpIconEnabled : classes.helpIconDisabled;
  let buttonClasses = isOpen
    ? classes.helpButtonEnabled
    : classes.helpButtonDisabled;
  let tooltipTitle = isOpen ? 'Disable help' : 'Enable help';

  return (
    <Slide direction="up" in={props.showHelp} mountOnEnter>
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
