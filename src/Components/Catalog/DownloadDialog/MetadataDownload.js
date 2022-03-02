import React from 'react';
import { Typography, Link } from '@material-ui/core';
import DownloadTemplate from './DownloadTemplate';

export const MetadataExplainer = () => {
  return (
    <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
      Metada is a list of top-level attributes of the dataset as well as
      metadata describing dataset variables. Some metadata fields are optional.
      You can find a full list of the metadata fields in the data submission
      guide{' '}
      <Link href={'/datasubmission/guide#data-structure-dataset'}>here</Link>.
    </Typography>
  );
};

export const DownloadMetadata = (props) => {
  let { downloadMetadata } = props;

  let dlAction = {
    handler: downloadMetadata,
    disabled: false,
    buttonText: 'Download Metadata',
  };

  return (
    <DownloadTemplate dlAction={dlAction} explanation={<MetadataExplainer />} />
  );
};

export default DownloadMetadata;
