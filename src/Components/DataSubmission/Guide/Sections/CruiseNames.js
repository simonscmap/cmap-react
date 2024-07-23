import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { AgGridReact } from 'ag-grid-react';
import { Meta } from './DataSheetSections';
import DemoSheet from '../DemoSheet';

const meta = {
  required: false,
  type: 'Text',
  constraints: ['No length limit', 'One per row'],
  example: () => (
    <ul>
      <li key={1}>{`TN397`}</li>
      <li key={2}>{`Gradients 4`}</li>
      <li key={3}>{`G4`}</li>
    </ul>
  )
};

// grid
// const rowData = [
//   {
//     dataset_short_name: 'amt01_extracted_cholorphyll',
//     dataset_long_name: 'AMT01 Extracted Chlorophyll and Phaeopigments',
//     dataset_version: 'final',
//     '....': '-',
//     'cruise_names': 'JR19950921',
//   },
//   {
//     dataset_short_name: '',
//     dataset_long_name: '',
//     dataset_version: '',
//     '....': '-',
//     'cruise_names': 'AMT01',
//   },
// ];
// const colDefs = [
//   { field: 'dataset_short_name' },
//   { field: 'dataset_long_name' },
//   { field: 'dataset_version' },
//   { field: '....' },
//   { field: 'cruise_names' },
// ];

const columns = ['dataset_short_name', 'dataset_long_name', 'dataset_version', '...', 'cruise_names' ]
      .map(term => ({ prop: term, name: term }));

const source = [
  {
    dataset_short_name: 'amt01_extracted_cholorphyll',
    dataset_long_name: 'AMT01 Extracted Chlorophyll and Phaeopigments',
    dataset_version: 'final',
    '...': '-' ,
   cruise_names: 'JR1995092',
  },
  {
    dataset_short_name: '',
    dataset_long_name: '',
    dataset_version: '',
    '...': '' ,
    references: 'AMT01',
  }
];

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta meta={meta} />
      <Typography>
        If your dataset represents measurements made during a cruise expedition (or expeditions), provide the cruise official names (e.g. <code>KM1821</code>) and any cruise nicknames in separate cells in this column.  Leave this field blank if your dataset is not associated with a cruise expedition.
      </Typography>
      <div className={cl.standoutBadgeContainer} style={{ width: 'calc(100% - 100px)'}}>
        <div className={cl.standoutBadge}>Example dataset_meta_data Sheet Row</div>
        <DemoSheet columns={columns} source={source} />
      </div>

      <div className={cl.standoutBadgeContainer}>
        <div className={cl.standoutBadge}>Cruise Names as Displayed on the CMAP Website</div>
        <div className={cl.standoutBox}>
          <img
            src={'/images/guide/cruise_names_web.png'}
            alt={'Cruise Names as Displayed on the CMAP Website'}
            width={1077}
          />
        </div>
      </div>
    </div>
  );
};

export default Content;
