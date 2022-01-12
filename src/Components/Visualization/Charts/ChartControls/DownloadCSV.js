// Chart Control Button for handling download
// Accepts chart data, handles dispatch

import { CloudDownload } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import ControlButtonTemplate from './ControlButtonTemplate';
import { csvFromVizRequestSend } from '../../../../Redux/actions/visualization';

const mapDispatchToProps = {
  csvFromVizRequestSend,
};

const DownloadCSV = (props) => {
  let { csvData, csvFromVizRequestSend } = props;
  let downloadCSV = () => {
    console.log('dowload clicked');
    csvFromVizRequestSend(...csvData);
  }

  return (
    <ControlButtonTemplate
      tooltipContent={'Download CSV'}
      onClick={downloadCSV}
      icon={CloudDownload}
    />
  );
};

export default connect(null, mapDispatchToProps)(DownloadCSV);
