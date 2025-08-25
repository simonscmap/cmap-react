import React from 'react';
import DefaultSubsetControlsLayout from './DefaultSubsetControlsLayout';

import logInit from '../../Services/log-service';
const log = logInit('dialog subset controls').addContext({
  src: 'shared/filtering/SubsetControls',
});

// This component provides filtering state to either:
// 1. Default layout (backward compatible)
// 2. Custom layout passed as children (composition pattern)

let SubsetControls = ({ children, ...filteringProps }) => {
  // If children provided, use composition pattern
  if (children) {
    return React.cloneElement(children, filteringProps);
  }

  // Otherwise, use default layout (zero breaking changes)
  return <DefaultSubsetControlsLayout {...filteringProps} />;
};

export default SubsetControls;
