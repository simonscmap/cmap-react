import React from 'react';
import Typography from '@material-ui/core/Typography';
import { GuideLink } from '../Links';
import { sectionStyles } from '../guideStyles';
import ExampleCatalogEntry from '../ExampleCatalogEntry';
import { Meta } from './DataSheetSections';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta meta={{
              required: true,
              constraints: ['Less than 200 characters'],
              example: 'Gradients 3 KM1906 UCYN-A1 nifH Gene Abundances',
            }}/>
      <Typography key={'0'}>
        The <code>dataset_long_name</code> is a descriptive and human-readable name for the dataset. This name will identify your dataset in the Simons CMAP Catalog and in the Visualization search dialog.
        Any Unicode character may be used here, but please avoid names longer than 200 characters as they may get trimmed when displayed on graphical interfaces.
        A full textual description of your dataset, with no length limits, is entered in the <GuideLink href="#dataset_description-column">dataset_description</GuideLink> field.
        If your dataset is associated with a cruise, we recommend including the official cruise and the cruise nickname in the <code>dataset_long_name</code>. For example: "Underway CTD Gradients 3 KM1906". Capitalizing the <code>dataset_long_name</code> is also recommended.
      </Typography>

      <div className={cl.subHeader}>
        Examples
      </div>
      <Typography>
        Here are examples of how the <code>dataset_long_name</code> will appear within SimonsCMAP.
      </Typography>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>Example Catalog Entry</div>
        <div className={cl.standoutBox}>
          <ExampleCatalogEntry />
        </div>
      </div>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>Example Visualization Page Search Interface</div>
        <div className={cl.standoutBox} style={{ background: 'black' }}>
          <img
            src={'/images/guide/long_name_in_viz_search.png'}
            alt={'Dataset Long_name in Visualization Page'}
          />
        </div>
      </div>
    </div>
  );
};

export default Content;
