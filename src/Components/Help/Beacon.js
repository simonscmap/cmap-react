import React from 'react';

export const Beacon = ({ visible, onClick, styles }) => {
  if (visible) {
    return (
      <button className={styles} onClick={onClick}>
        ?
      </button>
    );
  } else {
    return '';
  }
};
