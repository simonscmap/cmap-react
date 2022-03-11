import React from 'react';
import { Typography } from '@material-ui/core';
import DownloadTemplate from './DownloadTemplate';

export const AncillaryDataExplainer = ({ hasAncillaryData }) => {
  let note = (
    <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
      <em>This dataset does not have any ancillary data. </em> Datasets which
      have ancillary data available are marked with a label in the catalog
      search results.
    </Typography>
  );
  return (
    <React.Fragment>
      {!hasAncillaryData && note}
      <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
        {hasAncillaryData ? 'This dataset is amoung a' : 'A' } growing number of Simons CMAP datasets are being colocalized with a
        large (100+) number of contemporaneous environmental variables derived
        from satellite and numerical model products that are hosted in the
        Simons CMAP database. These variables are referred to as "ancillary"
        variables and are added to the original dataset. To distinguish the
        ancillary variables from those of the original dataset, all ancillary
        variable names are prefixed with "CMAP".
      </Typography>
    </React.Fragment>
  );
};

export const DownloadAncillaryData = (props) => {
  let {
    datasetHasAncillaryData,
    handleSubsetWithAncillaryDataDownload,
  } = props;

  let dlAction = {
    handlel: handleSubsetWithAncillaryDataDownload,
    disabled: !datasetHasAncillaryData,
    buttonText: 'Download Subset With Ancillary Data',
  };

  return (
    <DownloadTemplate
      dlAction={dlAction}
      explanation={
        <AncillaryDataExplainer hasAncillaryData={datasetHasAncillaryData} />
      }
    />
  );
};

export default DownloadAncillaryData;
