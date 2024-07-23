import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        In the User Dashboard  you can track the ingestion process for any dataset that you have submitted, send messages to the data curation team, and download the most recently submitted version of the workbook. If the curation team requests additional changes to your submission you can use the User Dashboard to access, edit, and resubmit the dataset directly in the validation tool.
      </Typography>
    </div>
  );
};

export default Content;
