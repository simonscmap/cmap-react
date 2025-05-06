import React, { useState } from 'react';
import { makeStyles, Tooltip } from '@material-ui/core';
import { BsFillBarChartLineFill } from 'react-icons/bs';
import styles from '../searchResultStyles';

const useStyles = makeStyles(styles);

const Visualizable = (props) => {
  const cl = useStyles();
  if (props.show) {
    return (
      <Tooltip title="This dataset supports visualization">
        <BsFillBarChartLineFill className={cl.primaryColor} />
      </Tooltip>
    );
  } else {
    return '';
  }
};

export default Visualizable;
