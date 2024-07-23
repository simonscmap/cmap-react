import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { sectionStyles } from '../guideStyles';
import ExampleCatalogEntry from '../ExampleCatalogEntry';
const bullets = [
  'Required: Yes',
  'Constraint: Less than 100 characters',
  'Example: Armbrust Lab, University of Washington',
];

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
Specifies the group and/or the institute name of the data owner(s).
        Including the PI name is strongly recommended, and the field can also
        include any link (such as a website) to the data producers. This
        information will be visible in the CMAP catalog as shown in{' '}
        <Link href="#fig-4">Fig 4</Link>. Also, dataset_source will be
        annotated to any visualization made using the dataset (
        <Link href="#fig-5">Fig. 5</Link>)
      </Typography>

      <ul>
        {bullets.map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
      </ul>

      <div className={cl.standoutBadgeContainer}>
        <div className={cl.standoutBadge}>Example Catalog Entry</div>
        <ArrowRightAltIcon style={{
                             position: 'absolute',
                             top: '196px',
                             left: '-65px',
                             color: 'orange',
                             fontSize: '90px',
                             zIndex: '100'
                           }}/>
        <div className={cl.standoutBox}>
          <ExampleCatalogEntry />
        </div>
      </div>
    </div>
  );
};

export default Content;



     //   src: '/images/cmap_data_source_in_viz.png',
     //   alt: 'Dataset Source in Visualizations"',
