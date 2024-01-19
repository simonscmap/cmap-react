import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Typography, Link } from '@material-ui/core';
import styles from './ValidationToolStyles';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (styles);

const Header = (props) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="h1" className={classes.title}>
        Data Submission Validation Tool
      </Typography>
      <Typography className={classes.needHelp}>
        Need help?
        <Link
          href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
          download="datasetTemplate.xlsx"
          className={classes.needHelpLink}
        >
          &nbsp;Download
        </Link>
        &nbsp;a blank template, or view the{' '}
        <Link
          className={classes.needHelpLink}
            component={RouterLink}
            to="/datasubmission/guide"
         >
           Data Submission Guide
         </Link>
         .
       </Typography>
     </React.Fragment>
  );
};

export default Header;
