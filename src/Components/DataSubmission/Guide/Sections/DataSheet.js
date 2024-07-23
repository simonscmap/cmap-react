import React, {useState, } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { AgGridReact } from 'ag-grid-react';

import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();


  const [rowData, setRowData] = useState([
    {
      time: '2016-5-01T15:02:00',
      lat: 25,
      lon: -158,
      depth: 5,
      var1: 'value',
      '...': '...',
      varN: 'value',
    }
  ]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    { field: "time" },
    { field: "lat" },
    { field: "lon" },
    { field: "depth" },
    { field: "var1" },
    { field: "..." },
    { field: "varN" },

  ]);

  return (
    <div className={cl.container}>
      <Typography>
        All data points are stored in the “Data” sheet. Each data point
        must have time and location information. The exact name and order
        of the time and location columns are shown in the table above. If
        a dataset does not have depth values (e.g., sea surface
        measurements), you may remove the depth column. If your dataset
        represents results of a Laboratory study (see dataset_make) fill
        these fields with the time of study and the location of your
        laboratory. The columns var<sub>1</sub>...var<sub>n</sub>{' '}
        represent the dataset variables (measurements). Please rename var
        <sub>1</sub>...var<sub>n</sub> to names appropriate to your data.
        The format of “time”, “lat”, “lon”, and “depth” columns are
        described in the following sections. Please review the example
        datasets listed under&nbsp;
        <Link href="#resources">resources</Link> for more detailed
        information.
      </Typography>


      <div className={cl.standoutBadgeContainer} style={{ width: 'calc(100% - 100px)'}}>
        <div className={cl.standoutBadge}>Example Data Sheet Row</div>
        <div
          className="ag-theme-material" // applying the Data Grid theme
          style={{ height: '120px' }} // the Data Grid will fill the size of the parent container
        >
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
        />
        </div>
      </div>
    </div>
  );
};

export default Content;
