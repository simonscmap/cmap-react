// Wraps a loading skeleton around children

import React from 'react';

import { Skeleton } from '@material-ui/lab';

const SkeletonWrapper = (props) => {
  return props.loading ? (
    <React.Fragment>
      {props.children.map((child, i) => (
        <Skeleton key={i}>{child}</Skeleton>
      ))}
    </React.Fragment>
  ) : (
    <React.Fragment>
      {props.children.map((child, i) => (
        <React.Fragment key={i}>{child}</React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default SkeletonWrapper;
