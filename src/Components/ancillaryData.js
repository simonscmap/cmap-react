import React, { useState } from 'react';
import { withStyles, Button, TextField } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { fetchColocalizedDatasetListSend } from '../Redux/actions/catalog';

let styles = (theme) => ({
  testWrapper: {
    color: 'white',
    textAlign: 'left',
    margin: '100px 1em 0 1em',
  },
});

const Test = (props) => {
  let { classes } = props;

  let dispatch = useDispatch();

  let [inputState, setInputState] = useState('');

  let onClick = () => {
    dispatch(fetchColocalizedDatasetListSend(inputState));
  };

  let onChange = (event) => {
    setInputState(event.target.value);
  };

  return (
    <div className={classes.testWrapper}>
      <h1>Test Ancillary Data</h1>
      <TextField onChange={onChange} />
      <Button onClick={onClick}>Fetch Ancillary Data</Button>
    </div>
  );
};

export default withStyles(styles)(Test);
