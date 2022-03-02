import React from 'react';
import DownloadTemplate from './DownloadTemplate';

const DownloadFull = (props) => {
  let { handleFullDatasetDownload } = props;

  let dlAction = {
    handler: handleFullDatasetDownload,
    disabled: false,
    buttonText: "Download Full Dataset"
  };

  let explainer = "Download the full dataset.";

  return <DownloadTemplate dlAction={dlAction} explanation={explainer} />;
};

export default DownloadFull;
