// Consisntent Section Header for Dataset Detail Page
import React from 'react';
import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles ((theme) => ({
  sectionHeader: {
    color: 'white',
    margin: '16px 0 16px 0',
    fontWeight: 100,
    fontFamily: '"roboto", Serif',
  },
}));

const SectionHeader = (props) => {
  const cl = useStyles ()
  const { title } = props;
  return (
    <Typography variant="h5" className={cl.sectionHeader}>
      {title}
    </Typography>
  );
}

export default SectionHeader;
