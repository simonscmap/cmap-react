import React from 'react';
import { Tooltip } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';

const CustomValueLabel = ({ children, open, value }) => {
  return (
    <Tooltip
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={value}
      PopperProps={{
        style: {
          pointerEvents: 'none',
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default CustomValueLabel;
