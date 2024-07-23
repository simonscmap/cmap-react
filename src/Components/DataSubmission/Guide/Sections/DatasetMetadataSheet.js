import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
This sheet holds a list of top-level attributes about the dataset
              such as the dataset name and description. Below are the list of
              these attributes along with their descriptions. Please review the
              example datasets listed under{' '}
              <Link href="#resources">resources</Link> for more detailed
              information.

      </Typography>
    </div>
  );
};

export default Content;
