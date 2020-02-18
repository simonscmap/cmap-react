import React from 'react';
import { Link } from "react-router-dom";

import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { withStyles } from '@material-ui/core/styles';

import { logOut } from '../../Redux/actions/user';

import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { Typography, MenuItem, ClickAwayListener, Grow, Paper, Popper, MenuList } from '@material-ui/core';

import JSS from '../../Stylesheets/JSS';

const styles = (theme) => ({
    navLink: JSS.navLink(theme),

    floatRight: {
        // float: 'right',
        // marginRight: 30,
    },

    icon: {
        display: 'inline-flex',
        verticalAlign: 'middle'
    },

    dropdown: {
        zIndex: 1300,
        marginTop: '21px'
    },

    popperPaper: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        backgroundColor: '#133345'
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

    return (
        <React.Fragment>
            <Typography variant='caption' className={`${classes.navLink} ${pathname === '/visualization' ? '' : classes.floatRight}`} onClick={handleClick}>
                {user.email}{anchorEl ? <ExpandLess className={classes.icon} color='primary' fontSize='small'/> : <ExpandMore className={classes.icon} color='primary' fontSize='small'/>}
            </Typography>
            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} role={undefined} transition className={classes.dropdown}>
                {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper className={classes.popperPaper}>
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