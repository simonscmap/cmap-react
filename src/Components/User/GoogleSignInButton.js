import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { WhiteButtonSM } from '../Common/Buttons';
import { useDispatch } from 'react-redux';
import {
  promptGSILogin,
  createRegisterWithGoogleContext,
} from '../../Redux/actions/user';

const styles = (theme) => ({
  wrapper: {
    height: '36px',
    padding: '0 5px 0 0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '9px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': {},
  },
  iconContainer: {
    width: '36px',
    height: '36px',
    backgroundImage: 'url(/images/google-g.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  textSpan: {
    // fontFamily: "'Roboto', sans-serif",
  },
});

const GoogleSignInButton = (props) => {
  const { classes, disabled, register } = props;
  const dispatch = useDispatch();

  const handleClick = () => {
    if (register) {
      // because the google login prompt callback cannot be dynamically parameterized
      // we create a context in redux which is checked before a request is sent to the api
      dispatch(createRegisterWithGoogleContext());
    }
    dispatch(promptGSILogin());
  };

  return (
    <WhiteButtonSM
      onClick={handleClick}
      style={{ padding: '21px 5px', letterSpacing: 0 }}
      disabled={disabled}
    >
      <div className={classes.wrapper}>
        <div className={classes.iconContainer}></div>
        <span className={classes.textSpan}>{props.text}</span>
      </div>
    </WhiteButtonSM>
  );
};

export default withStyles(styles)(GoogleSignInButton);
