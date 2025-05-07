import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Switch from '@material-ui/core/Switch';

import LoginRequiredPrompt from '../LoginRequiredPrompt';
import ConfirmUnsubscribe from './ConfirmUnsubscribe';
import {
  fetchSubscriptions,
  changeNewsSubscription,
  deleteSubscription,
} from '../../../Redux/actions/user';

// Unsub list
export const CustomButton = withStyles((theme) => ({
  root: {
    color: 'white',
    backgroundColor: 'transparent',
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#000000',
    },
    margin: 0,
    borderRadius: '25px',
    boxSizing: 'border-box',
    padding: '0 10px',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
  },
}))(Button);

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

function Row(props) {
  const { row, handleUnsubscribe } = props;
  const cl = useRowStyles();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const handleClick = () => {
    setConfirmationOpen(true);
  };

  return (
    <React.Fragment>
      <ConfirmUnsubscribe
        open={confirmationOpen}
        handleClose={() => setConfirmationOpen(false)}
        shortName={row.Dataset_Name}
        handleUnsubscribe={() => handleUnsubscribe(row.Dataset_Name)}
      />
      <TableRow className={cl.root}>
        <TableCell>{row.Dataset_Name}</TableCell>
        <TableCell>{row.Dataset_Long_Name}</TableCell>
        <TableCell>
          <CustomButton onClick={handleClick}>Unsubscribe</CustomButton>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const useTableStyles = makeStyles({
  colHead: {
    fontWeight: 'bold',
  },
  subTitle: {
    margin: '1em 0',
    fontSize: '16px',
    textTransform: 'uppercase',
    color: '#69FFF2',
  },
  controlWrapper: {
    margin: '1em 0',
  },
});
const SubList = (props) => {
  const { subs = [], user, unsubscribe, changeNewsSubscription } = props;
  const cl = useTableStyles();

  const handleSwitch = (ev) => {
    changeNewsSubscription(!user.isNewsSubscribed);
  };

  return (
    <div>
      <Typography className={cl.subTitle}>News</Typography>
      <Typography>
        When you subscribe to Simons CMAP News you will receive an email
        notification whenever any news item is published. News items include new
        dataset announcements, changes to existing datasets, and site news.
      </Typography>
      <div className={cl.controlWrapper}>
        <Typography>Subscribe to news notifications:</Typography>
        <Switch
          checked={user && user.isNewsSubscribed}
          onChange={handleSwitch}
          name={'news-subscription'}
        />
      </div>

      <Typography className={cl.subTitle}>Datasets</Typography>
      <Typography>
        When you subscribe to a dataset, you will receive an email notification
        whenever there are changes to that dataset or news related to it. You
        can subscribe to a dataset from it's entry or its page in the Catalog.
      </Typography>
      <div className={cl.controlWrapper}>
        <TableContainer>
          <Table size="small" aria-label="subscriptions table">
            <TableHead>
              <TableRow>
                <TableCell>Dataset Name</TableCell>
                <TableCell>Dataset Long Name</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {subs.map((item, ix) => (
                <Row key={`${ix}`} row={item} handleUnsubscribe={unsubscribe} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

const SubListStateWrapper = () => {
  const subs = useSelector((state) => state.userSubscriptions);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  if (!user) {
    return <LoginRequiredPrompt />;
  }

  if (!subs) {
    dispatch(fetchSubscriptions());
  }

  const unsubscribe = (shortName) => {
    dispatch(deleteSubscription([shortName]));
  };

  const switchNewsSubscription = (value) => {
    dispatch(changeNewsSubscription(Boolean(value)));
  };

  return (
    <SubList
      subs={subs}
      user={user}
      unsubscribe={unsubscribe}
      changeNewsSubscription={switchNewsSubscription}
    />
  );
};

export default SubListStateWrapper;
