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
        Once your submission has been approved the data curation team will
        request a DOI for the data. Information on DOIs can be found in the{' '}
        <Link href="#faq-doi">DOI Help Section</Link>. The DOI can be submitted
        using the messaging feature of the{' '}
        <Link href="#dashboard">user dashboard</Link>.
      </Typography>
    </div>
  );
};

export default Content;
