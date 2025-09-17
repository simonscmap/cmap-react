// Template for rendering a toggle switch for a download option
// Uses Grid to lay out a control and an explanation, side by side
import React, { useState } from 'react';
import { FormControlLabel, Switch, Grid, Link } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import HelpIcon from '@material-ui/icons/Help';
import colors from '../../enums/colors';

import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  wrapper: {
    position: 'relative',
    marginTop: '10px',
  },
  desc: {
    marginLeft: '20px',
    border: `1px solid ${colors.primary}`,
    borderRadius: '5px',
    padding: '.4em',
    backgroundColor: '#184562',
    fontSize: '0.8em',
  },
  arrow: {
    position: 'absolute',
    display: 'block',
    left: '10px',
    top: '10px',
    width: 0,
    height: 0,
    borderLeft: '.4em solid transparent',
    borderRight: '.4em solid transparent',
    borderBottom: '.7em solid #9dd162',
    transform: 'rotate(-90deg)',
  },
  icon: {
    width: '.8em',
    height: '.8em',
  },
});

const Template = (props) => {
  let { downloadOption, description, classes } = props;
  let { handler, switchState, name, label, disabled } = downloadOption;

  const [showDescription, setShowDescription] = useState(false);

  const handleClick = (event) => {
    event.preventDefault();
    setShowDescription(!showDescription);
  };

  return (
    <div style={{ padding: '.7em 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <FormControlLabel
          control={
            <Switch
              checked={switchState}
              onChange={handler}
              name={name}
              color="primary"
              disabled={disabled}
            />
          }
          label={label}
        />
        <Link href="" onClick={handleClick}>
          {showDescription ? (
            <HelpIcon className={classes.icon} />
          ) : (
            <HelpOutlineIcon className={classes.icon} />
          )}
        </Link>
      </div>
      {showDescription && (
        <div className={classes.wrapper}>
          <div className={classes.arrow}></div>
          <div className={classes.desc}>{description}</div>
        </div>
      )}
    </div>
  );
};

export default withStyles(styles)(Template);
