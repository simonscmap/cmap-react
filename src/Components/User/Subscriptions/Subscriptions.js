import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Page2 from '../../Common/Page2';
import Typography from '@material-ui/core/Typography';
// import { } from './programSelectors';
// import { } from '../../../Redux/actions/catalog';

import useStyles from './subscriptionManagerStyles';
import Selection from './Selection';
import NewsItems from './NewsItems';
import { fetchSubscriptions } from '../../../Redux/actions/user';
import { news } from './data';

import { CustomAlert } from '../../DataSubmission/Guide/Alert';

/* main render */
const SubscriptionManager = (props) => {
  const cl = useStyles ();
  const { subscriptions = [], selected, setSelected, newsList } = props;
  const [open, setOpen] = useState(false);

  const configureOpenClose = () => {
    setOpen (!open);
  }

  return (
    <Page2 bgVariant={'slate2'}>
      <div className={cl.container}>
        <div className={cl.title}>
          <Typography variant="h4">
            Dataset Subscriptions
          </Typography>
        </div>

        <div className={cl.splitView}>
          <div className={cl.subList}>
            <Selection
              subs={subscriptions}
              selected={selected}
              setSelected={setSelected} />
          </div>
          <div className={cl.subNews}>
            <NewsItems selected={selected} subscriptions={subscriptions} />
          </div>
        </div>
      </div>
    </Page2>
  )
}

const NoSubs = (props) => {
  const cl = useStyles ();

  return (
    <Page2 bgVariant={'slate2'}>
      <div className={cl.container}>
        <div className={cl.title}>
          <Typography variant="h4">
            Dataset Subscriptions
          </Typography>
        </div>
        <CustomAlert severity="info">You have no subscriptions.</CustomAlert>
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

  if (!subs) {
    return <NoSubs />;
  }

  return <SubscriptionManager
           subscriptions={subs}
           selected={selected}
           setSelected={handleSelect}
           newsList={news}
         />
}

export default SubscriptionStateWrapper;
