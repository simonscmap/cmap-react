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
        Once a DOI has been submitted your data will be ingested into the
        CMAP database. After ingestion, you will be able to view your
        dataset in the <Link href="/catalog" target="_blank">data catalog</Link>
        , create plots and figures through the <Link href="/visualization/charts" target="_blank"> CMAP web visualization tool        </Link>, and access it through the CMAP API using any of the CMAP <Link href="/documentation" target="_blank">software packages</Link>.
      </Typography>
    </div>
  );
};

export default Content;
