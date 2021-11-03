import React from 'react';
import HintArrow from './HintArrow';

export const HintTooltip = ({ open, content, styles }) => {
  // to render content as a component, prop needs to be capitalized
  const TooltipContent = content;

  const onClick = (e) => {
    e.stopPropagation();
  };

  if (open) {
    return (
      <React.Fragment>
        <HintArrow styles={styles.arrow} />
        <div className={styles.hint} onClick={onClick}>
          <TooltipContent />
        </div>
      </React.Fragment>
    );
  } else {
    return <React.Fragment />;
  }
};
