// Virtualized product list used on viz page for catalog-like and related-data searches
// Each child will be a dataset, which will have variable children
import React from 'react';
import { connect } from 'react-redux';
import DatasetInfoDialog from './DatasetInfoDialog';
import DataSearchResultGroup from './DataSearchResultGroup';

const observationListRef = React.createRef();
const modelListRef = React.createRef();

const plMapStateToProps = (state) => ({
  windowHeight: state.windowHeight,
  windowWidth: state.windowWidth,
  vizSearchResultsFullCounts: state.vizSearchResultsFullCounts,
});

const ProductList = (props) => {
  const {
    options, // these are structured search results (see Utility/Catalog/buildSearchOptionsFromDatasetList)
    handleSelectDataTarget,
    selectedMakes, // this is a set; it contains the makes the user has selected
    windowHeight,
    handleSetVariableDetailsID,
    vizSearchResultsFullCounts,
  } = props;

  const [datasetSummaryID, setDatasetSummaryID] = React.useState(null);

  const noMakesSelected = selectedMakes.size === 0;
  const shouldShowObservationResults =
    selectedMakes.has('Observation') || noMakesSelected;
  const shouldShowModelResults = selectedMakes.has('Model') || noMakesSelected;

  // are we showing both Observation and Model results, or just one?
  // TODO: this could probably just be a flex box instead of manually set group heights
  const isDoubleMakeLayout =
    noMakesSelected ||
    (selectedMakes.has('Observation') && selectedMakes.has('Model'));
  const groupHeight = isDoubleMakeLayout
    ? (windowHeight - 204) / 2 - 45
    : windowHeight - 249;

  const sharedDrillProps = {
    handleSetVariableDetailsID,
    handleSelectDataTarget,
    height: groupHeight,
    setDatasetSummaryID,
  };

  return (
    <React.Fragment>
      <DatasetInfoDialog
        datasetSummaryID={datasetSummaryID}
        setDatasetSummaryID={setDatasetSummaryID}
      />

      <div style={shouldShowObservationResults ? {} : { display: 'none' }}>
        <DataSearchResultGroup
          {...sharedDrillProps}
          make="Observation"
          options={options.Observation}
          listRef={observationListRef}
          fullCount={vizSearchResultsFullCounts.Observation}
        />
      </div>

      <div style={shouldShowModelResults ? {} : { display: 'none' }}>
        <DataSearchResultGroup
          {...sharedDrillProps}
          make="Model"
          options={options.Model}
          listRef={modelListRef}
          fullCount={vizSearchResultsFullCounts.Model}
        />
      </div>
    </React.Fragment>
  );
};

export default connect(plMapStateToProps, null)(ProductList);
