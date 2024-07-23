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
        The data curation team may have suggestions for additional changes to the workbook.
      </Typography>
      <Typography>
        Any feedback will be sent through the <Link href="#dashboard">user dashboard</Link>, and you will be notified via email.
        </Typography>
    </div>
  );
};

export default Content;
