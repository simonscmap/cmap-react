import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { Meta } from './DataSheetSections';
import DemoSheet from '../DemoSheet';

const meta = {
  required: false,
  type: 'Text',
  constraints: ['One per row'],
  example: () => (
    <ul>
      <li
        key={1}
      >{`Shinichi Sunagawa et al., Structure and function of the global ocean microbiome. Science 348, 1261359 (2015). DOI:10.1126/science.1261359`}</li>
      <li key={2}>{`http://ocean-microbiome.embl.de/companion.html`}</li>
    </ul>
  ),
};

const columns = [
  'dataset_short_name',
  'dataset_long_name',
  'dataset_version',
  '...',
  'references',
].map((term) => ({ prop: term, name: term }));

const source = [
  {
    dataset_short_name: 'amt01_extracted_cholorphyll',
    dataset_long_name: 'AMT01 Extracted Chlorophyll and Phaeopigments',
    dataset_version: 'final',
    '...': '-',
    references: 'BODC reference number 1665128, EDMO code 43',
  },
  {
    dataset_short_name: '',
    dataset_long_name: '',
    dataset_version: '',
    '...': '',
    references: 'https://www.bodc.ac.uk/',
  },
];

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta meta={meta} />
      <Typography>
        List any publications or documentation that one may cite in reference to
        the dataset, as well as references for any citations included in the
        description. Enter each reference in a separate cell in this column.
        Leave this field empty if there are no references associated with this
        dataset.
      </Typography>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>
          Example dataset_meta_data Sheet Row
        </div>
        <DemoSheet columns={columns} source={source} />
      </div>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>
          Example References as Displayed on the CMAP Website
        </div>
        <div className={cl.standoutBox}>
          <img
            src={'/images/guide/references_web.png'}
            alt={'References as Displayed on the CMAP Website'}
            width={1077}
          />
        </div>
      </div>
    </div>
  );
};

export default Content;
