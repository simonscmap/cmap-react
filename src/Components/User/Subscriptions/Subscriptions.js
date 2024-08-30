import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Page2 from '../../Common/Page2';
import Typography from '@material-ui/core/Typography';
// import { } from './programSelectors';
// import { } from '../../../Redux/actions/catalog';
import SettingsIcon from '@material-ui/icons/Settings';

import ManageSubscriptions from './ManageSubscriptions';
import useStyles from './subscriptionManagerStyles';
import Selection from './Selection';
import NewsItems from './NewsItems';
import { fetchSubscriptions } from '../../../Redux/actions/user';
import { news } from './data';

/* main render */
const SubscriptionManager = (props) => {
  const cl = useStyles ();
  const { subscriptions, selected, setSelected, newsList } = props;
  const [open, setOpen] = useState(false);

  const configureOpenClose = () => {
    setOpen (!open);
  }

  return (
    <Page2 bgVariant={'slate2'}>
      <ManageSubscriptions open={open} setOpen={setOpen} subs={subscriptions} />
      <div className={cl.container}>
        <div className={cl.title}>
          <Typography variant="h4">
            Dataset Subscriptions
          </Typography>
          <button onClick={configureOpenClose}>
            <span>Configure Subscriptions</span>
            <SettingsIcon />
          </button>
        </div>
        <Typography>Notifications associated with datasets you have subscribed to.</Typography>

        <div className={cl.splitView}>
          <div className={cl.subList}>
            <Selection
              data={subscriptions}
              selected={selected}
              setSelected={setSelected} />
          </div>
          <div className={cl.subNews}>
            <NewsItems selected={selected} newsList={newsList} />
          </div>
        </div>
      </div>
    </Page2>
  )
}



const SubscriptionStateWrapper = (props) => {
  const [selected, setSelected] = useState()
  const subs = useSelector ((state) => state.userSubscriptions)
  const dispatch = useDispatch ();
  if (!subs) {
    dispatch (fetchSubscriptions ());
  }


  const handleSelect = (name, checked) => {
    console.log ('handle select', name)
    setSelected (name);
  }

  return <SubscriptionManager
           subscriptions={subs}
           selected={selected}
           setSelected={handleSelect}
           newsList={news}
         />
}

export default SubscriptionStateWrapper;
