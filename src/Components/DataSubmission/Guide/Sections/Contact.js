import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        You can reach the Simons CMAP data curation team at{' '}
        <Link href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</Link>.
      </Typography>
    </div>
  );
};

export default Content;
