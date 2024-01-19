import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Typography, Link, Divider } from '@material-ui/core';
import styles from './ValidationToolStyles';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (styles);

const errorOutlineStyle = {
  color: 'rgba(255, 0, 0, .7)',
  margin: '0 2px -5px 0',
  fontSize: '1.4em',
};

const Status = (props) => {
  const classes = useStyles();

  const { step, errorCount, findNext } = props;

  if (step <= 1) {
    return <React.Fragment />;
  }

  const noErrors = 0 === Object.keys(errorCount).reduce((acc, curr) => {
    return acc + errorCount[curr];
  }, 0);

  if (noErrors) {
    return 'No errors.'
  }

  return (
    <React.Fragment>
    <Divider className={classes.divider} />
    <div>
    {Object.keys(errorCount).map((eKey, i) => {
      if (errorCount[eKey] === 0) {
        return '';
      }
      return (
        <div key={`_${eKey},${i}`}>
          {eKey} errors: {errorCount[eKey]}
        </div>
      );
    })}
    </div>
    </React.Fragment>
  );
};

export default Status;
