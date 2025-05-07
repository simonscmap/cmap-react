import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Page2 from '../../Common/Page2';
import SubList from './SubList';

const useStyles = makeStyles(() => ({
  container: {
    margin: '0 auto',
    padding: '0 2em',
    maxWidth: '1860px',
    minHeight: '800px',
    '& h4': {
      margin: 0,
    },
  },
}));

const SubscriptionManager = (props) => {
  const cl = useStyles();

  return (
    <Page2 bgVariant={'slate2'}>
      <div className={cl.container}>
        <Typography variant="h4">Subscriptions</Typography>

        <SubList />
      </div>
    </Page2>
  );
};

export default SubscriptionManager;
