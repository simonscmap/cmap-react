import React from 'react';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { withStyles } from '@material-ui/core/styles';

import { logOut } from '../../Redux/actions/user';

import { ExpandLess, ExpandMore } from '@material-ui/icons';

import {
  Typography,
  MenuItem,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuList,
} from '@material-ui/core';

import JSS from '../../Stylesheets/JSS';
import colors from '../../enums/colors';
import z from '../../enums/zIndex';

const styles = (theme) => ({
  navLink: JSS.navLink(theme),

  icon: {
    display: 'inline-flex',
    verticalAlign: 'middle',
  },

  icon: {
    display: 'inline-flex',
    verticalAlign: 'middle',
    color: colors.primary,
  },

  dropdown: {
    zIndex: z.NAVBAR_DROPDOWN,
    // zIndex: 30000,
    marginTop: '21px',
    width: '200px',
  },

  popperPaperBlue: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: '#1D4962',
  },

  popperPaperBlack: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'black',
  },
});

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
});

const mapDispatchToProps = {
  logOut,
};

const DataSubmissionNavbarDropdown = (props) => {
  const { classes, user, pathname, logOut } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const paperClass = window.location.pathname.includes('/visualization')
    ? classes.popperPaperBlack
    : classes.popperPaperBlue;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Typography
        variant="caption"
        className={`${classes.navLink}`}
        onClick={handleClick}
      >
        Data Submission
        {anchorEl ? (
          <ExpandLess
            className={classes.icon}
            color="primary"
            fontSize="small"
          />
        ) : (
          <ExpandMore
            className={classes.icon}
            color="primary"
            fontSize="small"
          />
        )}
      </Typography>
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        role={undefined}
        transition
        className={classes.dropdown}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper className={paperClass}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="menu-list-grow">
                  <MenuItem
                    onClick={handleClose}
                    component={Link}
                    to="/datasubmission/guide"
                  >
                    Submission Guide
                  </MenuItem>
                  <MenuItem
                    onClick={handleClose}
                    component={Link}
                    to="/datasubmission/validationtool"
                  >
                    Submit Data
                  </MenuItem>
                  <MenuItem
                    onClick={handleClose}
                    component={Link}
                    to="/datasubmission/userdashboard"
                  >
                    User Dashboard
                  </MenuItem>
                  {user && user.isDataSubmissionAdmin && (
                    <MenuItem
                      onClick={handleClose}
                      component={Link}
                      to="/datasubmission/admindashboard"
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(withStyles(styles)(DataSubmissionNavbarDropdown)));
