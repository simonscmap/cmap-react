import React from 'react';

import { Typography, Divider, Button } from '@material-ui/core';
import {
  ErrorOutline,
} from '@material-ui/icons';
import styles from './ValidationToolStyles';
import { auditKeyToLabel } from './ValidationToolConstants';
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
    return ''
  }

  return (
    <React.Fragment>
      <Divider className={classes.divider} />
      <Typography variant="h6">Issue Summary</Typography>
      <div>
        {Object.keys(errorCount).map((eKey, i) => {
          if (errorCount[eKey] === 0) {
            return '';
          }
          return (
            <div key={`_${eKey},${i}`} className={classes.errorOverview}>
              <span>
                {auditKeyToLabel[eKey]}:
              </span>
              <Typography variant="body2">
                <ErrorOutline style={errorOutlineStyle} />
                {errorCount[eKey]} errors
              </Typography>
            </div>
          );
        })}
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={findNext}
      >
        Go To Next Error
      </Button>
    </React.Fragment>
  );
};

export default Status;
