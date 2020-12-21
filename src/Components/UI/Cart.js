import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { withStyles, Dialog, DialogTitle, DialogContent, Button, DialogActions } from '@material-ui/core';
import { ShowChart, Delete } from '@material-ui/icons';

import SearchResult from '../Catalog/SearchResult';

import { setShowCart } from '../../Redux/actions/ui';
import { cartClear } from '../../Redux/actions/catalog';
import { cartPersistClear } from '../../Redux/actions/user';

import colors from '../../Enums/colors';
import HelpButtonAndDialog from './HelpButtonAndDialog';
import CartHelpContents from './CartHelpContents';

const mapStateToProps = (state, ownProps) => ({
    cart: state.cart,
    showCart: state.showCart
})

const mapDispatchToProps = {
    setShowCart,
    cartClear,
    cartPersistClear
}

const styles = (theme) => ({
    dialogPaper: {
        backgroundColor: colors.solidPaper,
        '@media (max-width: 600px)': {
            width: '100vw',
            margin: '12px'
        },
        width: '60vw',
    },

    dialogPaperViz: {
        backgroundColor: colors.backgroundGray,
        '@media (max-width: 600px)': {
            width: '100vw',
            margin: '12px'
        },
        width: '60vw',
    },

    dialogTitle: {
        paddingBottom: '8px',
        color: colors.primary
    },

    dialogActions: {
        marginTop: '12px'
    },

    helpButton: {
        marginTop: '-4px'
    }
});

const Cart = (props) => {
    const { classes, cart } = props;
    let cartItems = Object.values(cart);

    const handleCartClear = () => {
        props.cartClear();
        props.cartPersistClear();
    }
    
    return (
        <React.Fragment>
            <Dialog
                PaperProps={{
                    className: window.location.pathname.includes('/visualization') ? classes.dialogPaperViz : classes.dialogPaper
                }}
                open={props.showCart} 
                onClose={() => props.setShowCart(false)} 
                maxWidth={false}
            >
                <DialogTitle>
                    Your Cart 
                    <HelpButtonAndDialog
                        title='Dataset Cart'
                        content={<CartHelpContents/>}
                        iconClass={classes.helpIcon}
                        buttonClass={classes.helpButton}
                    />
                </DialogTitle>

                <DialogContent>
                    {   cartItems && cartItems.length ?
                        <>  
                            {
                                cartItems.map((e, i) => (
                                <SearchResult key={i} dataset={e}/>
                                ))
                            }

                            <DialogActions className={classes.dialogActions}>
                                <Button
                                    variant="text"
                                    color="primary"
                                    className={props.cartButtonClass}
                                    startIcon={<ShowChart/>}
                                    component={RouterLink} 
                                    to={`/visualization`}
                                    onClick={() => props.setShowCart(false)}
                                >
                                    Visualization
                                </Button>

                                <Button
                                    variant="text"
                                    color="primary"
                                    className={props.cartButtonClass}
                                    startIcon={<Delete/>}
                                    onClick={handleCartClear}
                                >
                                    Clear Cart
                                </Button>
                            </DialogActions>                      

                        </>

                        : 'Nothing in your cart. Visit the catalog page to add datasets.'
                    }
                </DialogContent>
            </Dialog>

        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Cart));