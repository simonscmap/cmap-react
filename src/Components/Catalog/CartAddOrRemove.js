// A button to either add to favorites, or if already a favorite, remove

import { Button, withStyles, Hidden } from '@material-ui/core';
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
    textTransform: 'none',
    whiteSpace: 'nowrap',
  },
  cartButton: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    style = { color: '#A1F640' };
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
      <Hidden lgDown>
        <span className={classes.bottomAlignedText}>
          {isSavedToCart ? 'Remove' : 'Add'}
        </span>
      </Hidden>
    </Button>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(withRouter(CartAddOrRemove)));
