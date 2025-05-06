import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import userMenuStyles from './userMenuStyles';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import { googleLoginRequestSend } from '../../Redux/actions/user';
import ExpandableItem from './ExpandableItem';
import { showLoginDialog } from '../../Redux/actions/ui';
import { logOut } from '../../Redux/actions/user';

const LoggedInMenu = ({ user }) => {
  const dispatch = useDispatch();
  const logOutUser = () => dispatch(logOut());

  if (!user) {
    console.log('attempted to render user menu when no user provided');
    return '';
  }

  let { email, isDataSubmissionAdmin } = user;

  return (
    <div id="userMenu">
      <ExpandableItem linkText={email} isRightEdge={true}>
        <Link to="/profile">Profile</Link>
        <Link to="/subscriptions">Dataset Subscriptions</Link>
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

  const handleGoogleLogin = (response) => {
    dispatch(googleLoginRequestSend(response.credential, 'auto login', false));
  };

  useGoogleOneTapLogin({
    onSuccess: handleGoogleLogin,
    onError: () => console.log('one tap failed'),
    promptMomentNotification: (data) =>
      console.log('one tap notification', data),
  });

  return (
    <div id="userMenu">
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
