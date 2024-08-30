import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import userMenuStyles from './userMenuStyles';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import ExpandableItem from './ExpandableItem';
import {
  showLoginDialog,
} from '../../Redux/actions/ui';
import { logOut } from '../../Redux/actions/user';

const LoggedInMenu = ({ user }) => {
  let dispatch = useDispatch();
  let logOutUser = () => dispatch(logOut());

  if (!user) {
    console.log('attempted to render user menu when no user provided');
    return '';
  }

  let { email, isDataSubmissionAdmin } = user;

  return (
    <div>
      <ExpandableItem linkText={email} isRightEdge={true}>
        <Link to="/profile">Profile</Link>
        <Link to="/subscriptions" >Dataset Subscriptions</Link>
        {isDataSubmissionAdmin && (
          <Link to="/datasubmission/admindashboard">Submissions Dashboard</Link>
        )}
        {isDataSubmissionAdmin && <Link to="/admin/news">News Dashboard</Link>}
        <Link to="/" onClick={logOutUser}>
          Logout
        </Link>
      </ExpandableItem>
    </div>
  );
};

const LoggedOutMenu = () => {
  let dispatch = useDispatch();
  let openLoginDialog = () => dispatch(showLoginDialog());
  return (
    <div>
      <Link to="/register">Register</Link>
      <Link to="#" onClick={openLoginDialog}>
        Login
      </Link>
    </div>
  );
};

const UserMenu = (props) => {
  let { classes } = props;
  let loggedInUser = useSelector(({ user }) => user);

  return (
    <div className={classes.userMenuContainer}>
      {loggedInUser ? <LoggedInMenu user={loggedInUser} /> : <LoggedOutMenu />}
    </div>
  );
};

export default withStyles(userMenuStyles)(UserMenu);
