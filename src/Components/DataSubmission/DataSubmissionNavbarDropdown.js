import React from 'react';
import { Link } from "react-router-dom";

import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { withStyles } from '@material-ui/core/styles';

import { logOut } from '../../Redux/actions/user';

import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { Typography, MenuItem, ClickAwayListener, Grow, Paper, Popper, MenuList } from '@material-ui/core';

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

const DataSubmissionNavbarDropdown = (props) => {
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
            <Typography variant='caption' className={`${classes.navLink}`} onClick={handleClick}>
                Data Submission{anchorEl ? <ExpandLess className={classes.icon} color='primary' fontSize='small'/> : <ExpandMore className={classes.icon} color='primary' fontSize='small'/>}
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
                                    <MenuItem onClick={handleClose} component={Link} to='/datasubmission/guide'>About</MenuItem>
                                    <MenuItem onClick={handleClose} component={Link} to='/datasubmission/validationtool'>Validation Tool</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(DataSubmissionNavbarDropdown)));