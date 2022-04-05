// Template for rendering a toggle switch for a download option
// Uses Grid to lay out a control and an explanation, side by side
import React, { useState } from 'react';
import {
  FormControlLabel,
  Switch,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import HelpIcon from '@material-ui/icons/Help';
import colors from '../../../enums/colors';

import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  wrapper: {
    position: 'relative',
  },
  link: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  desc: {
    // maxWidth: 'calc(300px)',
    marginLeft: '35px',
    border: `1px solid ${colors.primary}`,
    borderRadius: '5px',
    padding: '.4em',
    backgroundColor: '#184562',
    fontSize: '0.8em',
  },
  arrow: {
    position: 'absolute',
    display: 'block',
    left: '24px',
    top: '5px',
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
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={showDescription ? 12 : 3} sm={3}>
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
        </Grid>
        <Grid item xs={showDescription ? 12 : 9} sm={9}>
          <div className={classes.wrapper}>
            {showDescription && <div className={classes.arrow}></div>}
            <Link href="" onClick={handleClick} className={classes.link}>
              {showDescription ? (
                <HelpIcon className={classes.icon} />
              ) : (
                <HelpOutlineIcon className={classes.icon} />
              )}
            </Link>
            <div hidden={!showDescription} className={classes.desc}>
              {description}
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(Template);
