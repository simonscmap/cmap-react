import React from 'react';
import Typography from '@material-ui/core/Typography';

const AncillaryDataExplainer = (props) => {
  let { shortName } = props;
  return (
    <React.Fragment>
      <Typography variant="h5">
        Download dataset with added ancillary variables.
      </Typography>
      <Typography style={{ margin: '10px 0 0 0'}} variant="body1">
        A growing number of Simons CMAP datasets are being automatically
        colocalized with a large (100+) number of contemporaneous environmental
        variables derived from satellite and numerical model products that are
        hosted in the Simons CMAP database. These variables are referred to as
        "ancillary" variables and are added to the original dataset. To
        distinguish the ancillary variables from those of the original dataset,
        all ancillary variable names are prefixed with "CMAP".
      </Typography>
      <Typography style={{ margin: '10px 0 10px 0'}} variant="body1">
        If you opt to include ancillary data in your dowload, the resulting CSV
        file will include those ancillary datapoints in the same table.
      </Typography>
    </React.Fragment>
  );
};

export default AncillaryDataExplainer;
