// A button to either add to favorites, or if already a favorite, remove

import { Button, withStyles } from '@material-ui/core';
import { Star, StarBorder } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { cartAddItem, cartRemoveItem } from '../../Redux/actions/catalog';
import {
  cartPersistAddItem,
  cartPersistRemoveItem,
} from '../../Redux/actions/user';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart,
});

const mapDispatchToProps = {
  cartAddItem,
  cartRemoveItem,
  cartPersistAddItem,
  cartPersistRemoveItem,
};

const styles = (theme) => ({
  bottomAlignedText: {
    display: 'inline-block',
    marginBottom: '-5px',
    textTransform: 'none',
  },
  cartButton: {},
  ['@media (min-width: 1280px) and ( max-width: 1482px )']: {
    cartButton: {
      backgroundColor: 'rgb(33, 82, 108, 0.9)',
      boxShadow:
        '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '&:hover': {
        background: 'rgb(33, 82, 108, 0.4)',
      },
    },
  },
  ['@media (max-width: 690px)']: {
    cartButton: {
      margin: '0 0 0 6px',
    },
  },
});

const CartAddOrRemove = (props) => {
  const {
    customId,
    classes,
    cart,
    cartAddItem,
    cartRemoveItem,
    dataset,
    cartPersistAddItem,
    cartPersistRemoveItem,
  } = props;

  const handleClick = (e) => {
    if (cart[dataset.Long_Name]) {
      cartRemoveItem(dataset);
      cartPersistRemoveItem(dataset.Dataset_ID);
    } else {
      cartAddItem(dataset);
      cartPersistAddItem(dataset.Dataset_ID);
    }
  };

  let style = {};
  if (dataset && dataset.Visualize && !cart[dataset.Long_name]) {
    style = { color: '#e3e61a' };
  }

  let isSavedToCart = dataset && cart[dataset.Long_Name];

  return (
    <Button
      id={customId}
      style={style}
      variant="text"
      color="primary"
      className={classes.cartButton}
      startIcon={isSavedToCart ? <Star /> : <StarBorder />}
      onClick={handleClick}
    >
      <span className={classes.bottomAlignedText}>
        {isSavedToCart ? 'Remove Favorite' : 'Add To Favorites'}
      </span>
    </Button>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(withRouter(CartAddOrRemove)));
