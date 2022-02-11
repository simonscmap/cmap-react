import React from 'react';

import { Switch, FormControlLabel, Typography, Link } from '@material-ui/core';

let metadataFields = [
  'dataset_short_name',
  'dataset_long_name',
  'dataset_version',
  'dataset_release_date',
  'dataset_make',
  'dataset_source',
  'dataset_distributor',
  'dataset_acknowledgement',
  'dataset_history',
  'dataset_description',
  'dataset_references',
  'climatology',
  'cruise_names',
];

function generate(ListEl) {
  return metadataFields.map((entry) => <ListEl name={entry} />);
}

const MetadataStep = (props) => {
  let { includeMetadata, handleIncludeMetadata } = props;

  return (
    <React.Fragment>
      <Typography variant="h5">Metadata</Typography>
      <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
        Metada is a list of top-level attributes of the dataset as well as
        metadata describing dataset variables. Some metadata fields are
        optional. You can find a full list of the metadata fields in the data
        submission guide{' '}
        <Link href={'/datasubmission/guide#data-structure-dataset'}>
          here
        </Link>
        .
      </Typography>

      <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
        Would you like to download metada along with the dataset?
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={includeMetadata}
            onChange={handleIncludeMetadata}
            name="metadataSwitch"
            inputProps={{ 'aria-label': 'metadata checkbox' }}
            color="primary"
          />
        }
        label={
          includeMetadata
            ? 'Metadata will be included'
            : 'Metadata will NOT be includeded'
        }
      />
      <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
        Please click "Next" to continue.
      </Typography>
    </React.Fragment>
  );
};

export default MetadataStep;
