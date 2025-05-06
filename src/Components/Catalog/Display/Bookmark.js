import React, { useState } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { Star, StarBorder } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { cartAddItem, cartRemoveItem } from '../../Redux/actions/catalog';
import {
  cartPersistAddItem,
  cartPersistRemoveItem,
} from '../../Redux/actions/user';

const useStyles = makeStyles((theme) => ({
  container: {},
}));

const Bookmark = (props) => {
  const { longName } = props;
  const cl = useStyles();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  let isSavedToCart = dataset && cart[longName];

  const onClick = () => {};

  return <div className={cl.container}></div>;
};

export default Bookmark;
