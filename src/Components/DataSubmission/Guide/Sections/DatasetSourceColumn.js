import React from 'react';
import Typography from '@material-ui/core/Typography';

import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { sectionStyles } from '../guideStyles';
import ExampleCatalogEntry from '../ExampleCatalogEntry';
import { Meta } from './DataSheetSections';

const meta = {
  required: true,
  constraints: ['Less than 100 characters'],
  example: 'Armbrust Lab, University of Washington',
};

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta meta={meta} />
      <Typography>
        Specifies the group and/or the institute name of the data owner(s).
        Including the PI name is strongly recommended, and the field can also
        include any link (such as a website) to the data producers. This
        information will be visible in the CMAP catalog as shown below. Also, <code>dataset_source</code> will be
        annotated to any visualization made using the dataset.
      </Typography>

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
        <div className={cl.standoutBox} style={{ marginBottom: '2em'}}>
          <ExampleCatalogEntry />
        </div>

        <div className={cl.standoutBadgeContainer}>
          <div className={cl.standoutBadge}>Example Visualization Annotated with Source</div>
          <div className={cl.standoutBox}>
            <img
              src={'/images/cmap_data_source_in_viz.png'}
              alt={'Sample Visualization with Annotation'}
              width={1077}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
