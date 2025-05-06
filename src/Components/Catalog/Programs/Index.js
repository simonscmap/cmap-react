import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Page2 from '../../Common/Page2';
import ProgramsList from './List2';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  container: {
    color: 'white',
    padding: '20px 25px',
  },
}));

const Programs = () => {
  const cl = useStyles();
  return (
    <Page2 bgVariant={'slate2'}>
      <Grid container className={cl.container}>
        <Grid item xs={12}>
          <ProgramsList />
        </Grid>
      </Grid>
    </Page2>
  );
};

export default Programs;

export const programsIndexConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
