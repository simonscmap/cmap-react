import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { sectionStyles } from '../guideStyles';
import { AgGridReact } from 'ag-grid-react';
import { Meta } from './DataSheetSections';

const meta = {

  required: false,
  type: 'Text',
  constraints: [
    'One per row',
  ]
};

// grid
const rowData = [
  {
    dataset_short_name: 'amt01_extracted_cholorphyll',
    dataset_long_name: 'AMT01 Extracted Chlorophyll and Phaeopigments',
    dataset_version: 'final',
    '....': '-',
    'references': 'BODC reference number 1665128, EDMO code 43',
  },
  {
    dataset_short_name: '',
    dataset_long_name: '',
    dataset_version: '',
    '....': '-',
    'references': 'https://www.bodc.ac.uk/',
  },
];
const colDefs = [
  { field: 'dataset_short_name' },
  { field: 'dataset_long_name' },
  { field: 'dataset_version' },
  { field: '....' },
  { field: 'references' },
];

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta meta={meta} />
      <Typography>
List any publications or documentation that one may cite in reference to the dataset, as well as references for any citations included in the description. If there is more than one reference, please put them in separate cells under the <code>dataset_reference</code> column. Leave this field empty if there are no references associated with this dataset.

      </Typography>
      <div className={cl.standoutBadgeContainer} style={{ width: 'calc(100% - 100px)'}}>
        <div className={cl.standoutBadge}>Example dataset_meta_data Sheet Row</div>
        <div
          className="ag-theme-material" // applying the Data Grid theme
          style={{ height: '175px' }} // the Data Grid will fill the size of the parent container
        >
        <AgGridReact
          defaultColDef={{
            resizable: true,
          }}
          rowData={rowData}
          columnDefs={colDefs}
        />
        </div>
      </div>

    </div>
  );
};

export default Content;
