import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { withStyles, Button, Tooltip, Menu, MenuItem } from '@material-ui/core';
import { Star, StarBorder } from '@material-ui/icons';

import { cartAddItem, cartRemoveItem } from '../../Redux/actions/catalog';
import { cartPersistAddItem, cartPersistRemoveItem } from '../../Redux/actions/user';

const mapStateToProps = (state, ownProps) => ({
    cart: state.cart
})

const mapDispatchToProps = {
 cartAddItem, 
 cartRemoveItem,
 cartPersistAddItem,
 cartPersistRemoveItem
}

const styles = (theme) => ({
    cartButton: {
        textTransform: 'none',
        color: theme.palette.primary.main,
        paddingLeft: '4px',
        marginLeft: '14px'
    }
});

const CartAddOrRemove = (props) => {
    const { classes, cart, cartAddItem, cartRemoveItem, dataset, cartPersistAddItem, cartPersistRemoveItem } = props;

    const [ anchorElement, setAnchorElement ] = useState(null);

    const addAndRemain = () => {
        cartAddItem(dataset);
        cartPersistAddItem(dataset.Dataset_ID);
        // setAnchorElement(null);
    }

    const handleClick = (e) => {
        if(cart[dataset.Long_Name]){
            cartRemoveItem(dataset);
            cartPersistRemoveItem(dataset.Dataset_ID);
        }

        else {
            cartAddItem(dataset);
            cartPersistAddItem(dataset.Dataset_ID);
        }
    }

    // const addAndVisualize = () => {
    //     cartAddItem(dataset);
    //     cartPersistAddItem(dataset.Dataset_ID);
    //     setAnchorElement(null);
    //     props.history.push('/visualization/charts');
    // }

    return (
        <React.Fragment>
            <Tooltip title={dataset.Visualize ? 'Favorites will appear first on the visualization page' : 'This dataset contains no visualizable variables, and will not appear on the visualization page.'} placement='right'>
                <Button
                    style={!dataset.Visualize && !cart[dataset.Long_Name] ? {color: '#e3e61a'} : {}}
                    variant="text"
                    color="primary"
                    className={props.cartButtonClass}
                    startIcon={cart[dataset.Long_Name] ? <Star/> : <StarBorder/>}
                    onClick={handleClick}
                >
                    {cart[dataset.Long_Name] ? 'Remove From Favorites' : 'Add To Favorites'}
                </Button>
            </Tooltip>

            {/* <Menu
                anchorEl={anchorElement}
                open={Boolean(anchorElement)}
                onClose={() => setAnchorElement(null)}
            >
                <MenuItem onClick={() => addAndRemain()}>Add to Cart</MenuItem>
                <MenuItem onClick={() => addAndVisualize()}>Add to Cart and Visualize</MenuItem>
            </Menu> */}
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(CartAddOrRemove)));