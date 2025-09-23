import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Page2 from '../../Components/Common/Page2';
import { Grid, Typography } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  container: {
    color: 'white',
    padding: '20px 25px',
  },
}));

const CollectionsPage = () => {
  const cl = useStyles();
  return (
    <Page2 bgVariant={'slate2'}>
      <Grid container className={cl.container}>
        <Grid item xs={12}>
          <Typography variant="h1" gutterBottom>
            Collections
          </Typography>
          <Typography variant="body1">Heebie-jeebie</Typography>
        </Grid>
      </Grid>
    </Page2>
  );
};

export default CollectionsPage;

export const collectionsPageConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
