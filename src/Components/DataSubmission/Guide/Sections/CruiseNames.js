import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { AgGridReact } from 'ag-grid-react';
import { Meta } from './DataSheetSections';

const meta = {
  required: false,
  type: 'Text',
  constraints: ['No length limit', 'One per row']
};

// grid
const rowData = [
  {
    dataset_short_name: 'amt01_extracted_cholorphyll',
    dataset_long_name: 'AMT01 Extracted Chlorophyll and Phaeopigments',
    dataset_version: 'final',
    '....': '-',
    'cruise_names': 'JR19950921',
  },
  {
    dataset_short_name: '',
    dataset_long_name: '',
    dataset_version: '',
    '....': '-',
    'cruise_names': 'AMT01',
  },
];
const colDefs = [
  { field: 'dataset_short_name' },
  { field: 'dataset_long_name' },
  { field: 'dataset_version' },
  { field: '....' },
  { field: 'cruise_names' },
];

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta meta={meta} />
      <Typography>
        If your dataset represents measurements made during a cruise expedition (or expeditions), provide the cruise official names here (e.g. <code>KM1821</code>). If your dataset is associated with more than one cruise, please put them in separate cells under the <code>cruise_names</code> column. If the cruises have any nicknames, please list these in separate cells as well. Leave this field blank if your dataset is not associated with a cruise expedition.

      </Typography>
      <div className={cl.standoutBadgeContainer} style={{ width: 'calc(100% - 100px)'}}>
        <div className={cl.standoutBadge}>Example dataset_meta_data Sheet Row</div>
        <div
          className="ag-theme-material" // applying the Data Grid theme
          style={{ height: '175px' }} // the Data Grid will fill the size of the parent container
        >
        <AgGridReact
          defaultColDef={{ resizable: true, sortable: false , suppressMenu: true }}
          rowData={rowData}
          columnDefs={colDefs}
        />
        </div>
      </div>

    </div>
  );
};

export default Content;
