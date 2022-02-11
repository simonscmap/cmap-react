import React from 'react';
import { Typography, Switch, FormControlLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from './downloadDialogStyles';

const AncillaryDataExplainer = (props) => {
  let { hasAncillaryData } = props;
  return (
    <React.Fragment>
      <Typography variant="h5">
        {hasAncillaryData
          ? 'Download dataset with added ancillary variables.'
          : 'Ancillary Data'}
      </Typography>
      <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
        A growing number of Simons CMAP datasets are being automatically
        colocalized with a large (100+) number of contemporaneous environmental
        variables derived from satellite and numerical model products that are
        hosted in the Simons CMAP database. These variables are referred to as
        "ancillary" variables and are added to the original dataset. To
        distinguish the ancillary variables from those of the original dataset,
        all ancillary variable names are prefixed with "CMAP".
      </Typography>
      {!hasAncillaryData && (
        <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
          Datasets which have ancillary data available will be marked with a
          label in the catalog search results.
        </Typography>
      )}
    </React.Fragment>
  );
};

const AncillaryDataStep = (props) => {
  let {
    datasetHasAncillaryData,
    includeAncillaryData,
    handleIncludeAncillaryData,
  } = props;

  let label;
  if (datasetHasAncillaryData) {
    if (includeAncillaryData) {
      label = <span>Ancillary Data will be included</span>;
    } else {
      label = (
        <span>
          Ancillary data will <em>NOT</em> be included
        </span>
      );
    }
  } else {
    label = 'No Ancillary data to include';
  }

  return (
    <React.Fragment>
      <AncillaryDataExplainer hasAncillaryData={datasetHasAncillaryData} />

      <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
        {datasetHasAncillaryData
          ? 'Would you like to include ancillary data in your download?'
          : 'This dataset does not have any ancillary data available.'}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={includeAncillaryData}
            onChange={handleIncludeAncillaryData}
            name="ancillaryDataSwitch"
            inputProps={{ 'aria-label': 'ancillary data checkbox' }}
            disabled={!datasetHasAncillaryData}
            color="primary"
          />
        }
        label={label}
      />

      <Typography style={{ margin: '10px 0 0 0' }} variant="body1">
        Please click "Next" to continue.
      </Typography>
    </React.Fragment>
  );
};

export default withStyles(styles)(AncillaryDataStep);
