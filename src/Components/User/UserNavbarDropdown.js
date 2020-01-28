import React, { Component } from 'react';
import { Link } from "react-router-dom";

import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { withStyles } from '@material-ui/core/styles';

import { logOut } from '../../Redux/actions/user';

import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { Typography, Menu, MenuItem, ClickAwayListener, Grow, Paper, Popper, MenuList } from '@material-ui/core';

const styles = (theme) => ({
    navLink: {
        textDecoration: 'none',
        color: 'white',
        '&:hover': {
            textDecoration: 'underline'
        },
        fontSize: '13px',
        fontWeight: 100,
        display: 'inline-block',
        cursor: 'pointer'
    },

    floatRight: {
        float: 'right',
        marginRight: 30,
    },

    icon: {
        display: 'inline-flex',
        verticalAlign: 'middle'
    },

    dropdown: {
        zIndex: 1300
    }
});

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {
    logOut
}

const UserNavbarDropdown = (props) => {
    const { classes, user, pathname, logOut } = props;

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const icon = anchorEl ? 
        <ExpandLess className={classes.icon} color='primary' fontSize='small'/> : 
        <ExpandMore className={classes.icon} color='primary' fontSize='small'/>;

    return (
        <React.Fragment>
            <Typography variant='caption' className={`${classes.navLink} ${pathname === '/visualization' ? '' : classes.floatRight}`} onClick={handleClick}>
                {/* <i key={icon} className={`fas ${icon} ${classes.icon}`}></i> {user.email} */}
                {user.email}{anchorEl ? <ExpandLess className={classes.icon} color='primary' fontSize='small'/> : <ExpandMore className={classes.icon} color='primary' fontSize='small'/>}
            </Typography>
            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} role={undefined} transition className={classes.dropdown}>
                {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="menu-list-grow">
                                    <MenuItem onClick={handleClose} component={Link} to='/profile'>Profile</MenuItem>
                                    <MenuItem onClick={handleClose} component={Link} to='/apikeymanagement'>API Access</MenuItem>
                                    <MenuItem onClick={logOut}>Logout</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(UserNavbarDropdown)));