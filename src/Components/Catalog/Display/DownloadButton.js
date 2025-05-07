import React, { useState } from 'react';
import { withStyles, Button } from '@material-ui/core';

const GreenButton = withStyles((theme) => ({
  root: {
    color: 'black',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
    },
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '2px 16px',
    fontSize: '16px',
    fontWeight: 500,
    // fontFamily: ['Montserrat', 'sans-serif'].join(','),
    // letterSpacing: '0.03em',
    lineHeight: 'unset',
    textTransform: 'none',
    '& span': {
      whiteSpace: 'nowrap',
    },
    lineBreak: 'none',
  },
}))(Button);

export default GreenButton;
