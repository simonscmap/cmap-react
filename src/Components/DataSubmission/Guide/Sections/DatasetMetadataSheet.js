import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
This sheet holds a list of top-level attributes about the dataset
              such as the dataset name and description. Below are the list of
              these attributes along with their descriptions. Please review the
              example datasets listed under{' '}
              <GuideLink href="#resources">Resources</GuideLink> for more detailed
              information.

      </Typography>
    </div>
  );
};

export default Content;
