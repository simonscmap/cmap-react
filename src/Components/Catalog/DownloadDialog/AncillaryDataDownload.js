import React from 'react';

export const AncillaryDataExplainer = ({ hasAncillaryData }) => {
  let had = hasAncillaryData;
  let note = (
    <div style={{ margin: '0 0 10px 0' }}>
      <em>This dataset does not have any ancillary data. </em> Datasets that
      have ancillary data available are marked with a label in the catalog
      search results.
    </div>
  );
  return (
    <React.Fragment>
      {!had && note}
      {had ? 'This dataset is among a' : 'A'} growing number of Simons CMAP
      datasets {had ? 'that' : ''} have been colocalized with a large (100+)
      number of contemporaneous environmental variables derived from satellite
      and numerical model products that are hosted in the Simons CMAP database.
      These variables are referred to as "ancillary" variables and are added to
      the original dataset. To distinguish the ancillary variables from those of
      the original dataset, all ancillary variable names are prefixed with
      "CMAP".
    </React.Fragment>
  );
};
