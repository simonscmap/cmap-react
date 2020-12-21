import React from 'react';
import { Link } from "react-router-dom";

import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { withStyles } from '@material-ui/core/styles';

import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { Typography, MenuItem, ClickAwayListener, Grow, Paper, Popper, MenuList } from '@material-ui/core';

import JSS from '../../Stylesheets/JSS';
import colors from '../../Enums/colors';

const styles = (theme) => ({
    navLink: JSS.navLink(theme),

    icon: {
        display: 'inline-flex',
        verticalAlign: 'middle'
    },

    icon: {
        display: 'inline-flex',
        verticalAlign: 'middle',
        color: colors.primary
    },

    dropdown: {
        zIndex: 1300,
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
    user: state.user
})

const VizNavbarDropdown = (props) => {
    const { classes, user, pathname, logOut } = props;

    const [anchorEl, setAnchorEl] = React.useState(null);

    const paperClass = window.location.pathname.includes('/visualization') ? classes.popperPaperBlack : classes.popperPaperBlue;

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };
    
    return (
        <React.Fragment>
            <Typography variant='caption' className={`${classes.navLink}`} onClick={handleClick}>
                Visualization{anchorEl ? <ExpandLess className={classes.icon} color='primary' fontSize='small'/> : <ExpandMore className={classes.icon} color='primary' fontSize='small'/>}
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
                                    <MenuItem onClick={handleClose} component={Link} to='/visualization/charts'>Charts and Plots</MenuItem>
                                    <MenuItem onClick={handleClose} component={Link} to='/visualization/cruises'>Explore Cruises</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    )
}

export default connect(mapStateToProps, null)(withRouter(withStyles(styles)(VizNavbarDropdown)));