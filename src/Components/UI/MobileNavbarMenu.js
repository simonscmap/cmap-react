import React from 'react';
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { withStyles } from '@material-ui/core/styles';

import { IconButton, Drawer, List, ListItem, Divider } from '@material-ui/core';
import { Menu } from '@material-ui/icons';

import JSS from '../../Stylesheets/JSS';

import colors from '../../Enums/colors';
import z from '../../Enums/zIndex';

const styles = theme => ({
    menuIcon: {
        color: 'white',
        cursor: 'pointer'
    },

    iconButton: {
        ...JSS.navLink(theme),
        padding: '8px'
    },

    drawerPaper: {
        backgroundColor: colors.solidPaper,
        paddingLeft: '8px',
        paddingTop: '60px',
        zIndex: z.NAVBAR_DROPDOWN,
        // zIndex: 30000
    },

    listItem: {
        '&:hover': {
            color: theme.palette.primary.main
        }
    }
})

const MobileNavbarMenu = (props) => {
    const { classes, user, handleLogOut, showLoginDialog, cartSize } = props;

    const [drawerState, setDrawerState] = React.useState(false);

    const handleLoginClick = () => {
        showLoginDialog();
        setDrawerState(false);
    }

    const handleLogoutClick = () => {
        handleLogOut();
        setDrawerState(false);
    }

    const handleShowCart = () => {
        props.handleShowCart();
        setDrawerState(false);
    }

    return (
        <React.Fragment>
            <IconButton onClick={() => setDrawerState(true)} className={classes.iconButton}>
                <Menu className={classes.menuIcon}/>
            </IconButton>

            <Drawer 
                anchor='top' 
                open={drawerState} 
                onClose={() => setDrawerState(false)}
                PaperProps={{
                    className: classes.drawerPaper,
                    style: window.location.pathname.includes('visualization') ? {backgroundColor: 'black'} : {}
                }}
            >
                <List>
                    <ListItem button component={Link} to='/catalog' onClick={() => setDrawerState(false)}>
                        Catalog
                    </ListItem>

                    <ListItem button component={Link} to='/visualization' onClick={() => setDrawerState(false)}>
                        Visualization
                    </ListItem>

                    <ListItem button component={Link} to='/community' onClick={() => setDrawerState(false)}>
                        Community
                    </ListItem>

                    <ListItem button component={Link} to='/datasubmission' onClick={() => setDrawerState(false)}>
                        Data Submission
                    </ListItem>

                    <ListItem button component='a' href='/about' onClick={() => setDrawerState(false)}>
                        About
                    </ListItem>

                    {
                        cartSize ? 
                        <ListItem button onClick={handleShowCart}>
                            Favorites
                        </ListItem>
                        : ''
                    }
                </List>
                <Divider/>
                {user &&
                    <List>
                        <ListItem button component={Link} to='/profile' onClick={() => setDrawerState(false)}>
                            Profile
                        </ListItem>

                        <ListItem button component={Link} to='/apikeymanagement' onClick={() => setDrawerState(false)}>
                            API Access
                        </ListItem>

                        <ListItem button onClick={handleLogoutClick}>
                                Log Out
                        </ListItem>
                    </List>                
                }

                {!user && 
                    <List>
                        <ListItem button onClick={handleLoginClick}>
                            Log In
                        </ListItem>

                        <ListItem button component={Link} to='/register' onClick={() => setDrawerState(false)}>
                            Register
                        </ListItem>
                    </List> 
                }
            </Drawer>
        </React.Fragment>
    )
}

export default withRouter(withStyles(styles)(MobileNavbarMenu));