import React from 'react';
import PropTypes from 'prop-types';

const AlignedNumber = ({ children, width = 60 }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width: typeof width === 'number' ? `${width}px` : width,
        textAlign: 'right',
      }}
    >
      {children}
    </span>
  );
};

AlignedNumber.propTypes = {
  children: PropTypes.node.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default AlignedNumber;
