import React from 'react';

// 'children' for the Beacon is the HintTooltip
export const Beacon = ({ enabled, onClick, styles, children }) => {
  if (enabled) {
    return (
      <button className={styles} onClick={onClick}>
        <div>
          <span>?</span>
        </div>
        {children}
      </button>
    );
  } else {
    return <React.Fragment />;
  }
};
