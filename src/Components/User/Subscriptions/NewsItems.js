import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useNewsStyles = makeStyles({
  item: {
    margin: '1em 0',
  },
  headline: {
    fontWeight: 'bold',
    fontSize: '1.2em',
  },
});

const NewsItems = (props) => {
  const { selected, subscriptions = [] } = props;
  const cl = useNewsStyles();

  const sub = subscriptions.find((s) => s.Dataset_Name === selected);
  if (!sub) {
    return <div>Alert: no subscription found for {selected}</div>;
  }

  return (
    <div>
      <Typography variant="h6">Subscription</Typography>
      <div>
        <div className={cl.item}>
          <Typography className={cl.headline}>{sub.Dataset_Name}</Typography>
          <Typography>Date Subscribed: {sub.Subscription_Date_Time}</Typography>
          <Button variant="outlined">Unsubscribe</Button>
        </div>
      </div>
    </div>
  );
};

export default NewsItems;
