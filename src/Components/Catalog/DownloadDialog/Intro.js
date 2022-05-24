import React from 'react';
import { Typography } from '@material-ui/core';

export const DownloadIntro = () => {
  let ExpandedContent = () => (
    <React.Fragment>
      <Typography style={{ margin: '10px 0' }}>
        Choose dowload options.
      </Typography>
    </React.Fragment>
  );

  return <ExpandedContent />;
};
