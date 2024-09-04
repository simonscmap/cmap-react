import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import { datasetNamesFullList } from './newsSelectors';


const useStyles = makeStyles ((theme) => ({
  container: {
    // fontSize: '0.9em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'start',
  },
}));

const EmailManagerPure = (props) => {
  const cl = useStyles ();
  return (
    <div className={cl.container}>
      <div>
        <Typography>History</Typography>
      </div>
      <div>
        <Typography>Controls</Typography>
      </div>
    </div>
  );
}

const EmailManager = (props) => {
  const { } = props;
  return <EmailManagerPure />
}

export default EmailManager;
