import React, {useState, } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { AgGridReact } from 'ag-grid-react';
import { GuideLink } from '../Links';
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
        of the time and location columns are shown in the table below. If
        a dataset does not have depth values (e.g., sea surface
        measurements), you may remove the depth column. If your dataset
        represents results of a Laboratory study (see <GuideLink href="dataset_make-column">dataset_make</GuideLink>) fill
        these fields with the time of study and the location of your
        laboratory. The columns <code>var<sub>1</sub>...var<sub>n</sub></code>{' '}
        represent the dataset variables (measurements). Please rename <code>var
        <sub>1</sub>...var<sub>n</sub></code> to names appropriate to your data.
        The format of <code>time</code>, <code>lat</code>, <code>lon</code>, and <code>depth</code> columns are
        described in the following sections. Please review the example
        datasets listed under&nbsp;
        <GuideLink href="#resources">Resources</GuideLink> for more detailed
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
