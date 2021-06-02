import React from 'react';
import { Link } from "react-router-dom";

import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { Typography, MenuItem, ClickAwayListener, Grow, Paper, Popper, MenuList } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { logOut } from '../../Redux/actions/user';

import colors from '../../Enums/colors';
import z from '../../Enums/zIndex';

import JSS from '../../Stylesheets/JSS';

const styles = (theme) => ({
    navLink: JSS.navLink(theme),

    icon: {
        display: 'inline-flex',
        verticalAlign: 'middle',
        color: colors.primary
    },

    dropdown: {
        zIndex: z.NAVBAR_DROPDOWN,
        marginTop: '21px',
        width: '200px'
    },

    popperPaperBlue: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        backgroundColor: '#1D4962'
    },

    popperPaperBlack: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        backgroundColor: 'black'
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

    const paperClass = window.location.pathname.includes('/visualization') ? classes.popperPaperBlack : classes.popperPaperBlue;

    return (
        <React.Fragment>
            <Typography variant='caption' className={`${classes.navLink}`} onClick={handleClick}>
                {user.email}{anchorEl ? <ExpandLess className={classes.icon} color='primary' fontSize='small'/> : <ExpandMore className={classes.icon} color='primary' fontSize='small'/>}
            </Typography>
            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} role={undefined} transition className={classes.dropdown}>
                {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper className={paperClass}>
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