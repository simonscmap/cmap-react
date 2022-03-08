import React from 'react';
import DownloadTemplate from './DownloadTemplate';

const DownloadSubset (props) => {
  let { handleSubsetDownload, isDefined } = props;

  let dlAction = {
    handler: handleSubsetDownload,
    disabled: !isDefined,
    buttonText: 'Download Subset',
  };

  let explanation = 'Download the subset as defined by the parameters below.';

  return <DownloadTemplate dlAction={dlAction} explanation={explanation} />;
};

export default DownloadSubset;
