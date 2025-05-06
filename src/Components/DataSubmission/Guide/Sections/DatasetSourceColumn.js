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
        information will be visible in the CMAP catalog and annotated to
        visualizations made using the dataset, as shown below.
      </Typography>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>Example Catalog Entry</div>
        <ArrowRightAltIcon
          style={{
            position: 'absolute',
            top: '228px',
            left: '-25px',
            color: 'orange',
            fontSize: '90px',
            zIndex: '100',
          }}
        />
        <div className={cl.standoutBox} style={{ marginBottom: '2em' }}>
          <ExampleCatalogEntry />
        </div>
      </div>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>
          Example Visualization Annotated with Source
        </div>
        <div className={cl.standoutBox}>
          <img
            src={'/images/guide/source_in_chart.png'}
            alt={'Sample Visualization with Source Annotation'}
            width={1077}
          />
        </div>
      </div>
    </div>
  );
};

export default Content;
