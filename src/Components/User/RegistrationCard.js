import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
// import IconButton from '@material-ui/core/IconButton';
// import InputAdornment from '@material-ui/core/InputAdornment';

import React from 'react';

const styles = (theme) => ({
  registrationCard: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    // height: '200px',
    padding: '2em',
  },

  textField: {
    margin: theme.spacing(1),
    width: '80%',
  },
});

const RegistrationCard = (props) => {
  const { classes } = props;
  const fields = Object.keys(props.inputFieldState);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      props.buttonRef.current.click();
    }
  };

  return (
    <Card className={classes.registrationCard}>
      <Grid container spacing={1}>
        {fields.map((field, index) => {
          return (
            <Grid key={index} item xs={fields.length > 2 ? 6 : 12}>
              <TextField
                key={index}
                autoFocus={Boolean(index === 0)}
                name={props.inputFieldInfo[field].name}
                label={props.inputFieldInfo[field].label}
                value={props.inputFieldState[field].value}
                className={classes.textField}
                onChange={props.onChange}
                type={props.inputFieldInfo[field].type}
                error={!props.inputFieldState[field].valid}
                helperText={
                  props.inputFieldState[field].valid
                    ? ' '
                    : props.inputFieldInfo[field].requirement
                }
                onKeyPress={handleKeyPress}
              />
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
};

export default withStyles(styles)(RegistrationCard);
