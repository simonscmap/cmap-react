// Chart Control Button for handling download
// Accepts chart data, handles dispatch

import { CloudDownload } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import ControlButtonTemplate from './ControlButtonTemplate';
import { csvFromVizRequestSend } from '../../../../Redux/actions/visualization';

const mapDispatchToProps = {
  csvDownloadRequest: csvFromVizRequestSend,
};

const DownloadCSV = (props) => {
  let { csvData, csvDownloadRequest } = props;
  let downloadCSV = () => {
    csvDownloadRequest(...csvData);
  };

  return (
    <ControlButtonTemplate
      tooltipContent={'Download CSV'}
      onClick={downloadCSV}
      icon={CloudDownload}
    />
  );
};

export default connect(null, mapDispatchToProps)(DownloadCSV);
