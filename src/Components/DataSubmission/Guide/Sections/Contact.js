import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        You can reach the CMAP data curation team at{' '}
        <Link
          href="mailto:cmap-data-submission@uw.edu"
        >
          cmap-data-submission@uw.edu
        </Link>
        .
      </Typography>

    </div>
  );
};

export default Content;
