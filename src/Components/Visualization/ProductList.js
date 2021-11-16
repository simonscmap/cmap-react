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
    options,
    // classes,
    handleSelectDataTarget,
    // handleShowMemberVariables,
    // vizSearchResultsLoadingState,
    make,
    // windowWidth,
    windowHeight,
    handleSetVariableDetailsID,
    vizSearchResultsFullCounts,
  } = props;

  const [datasetSummaryID, setDatasetSummaryID] = React.useState(null);

  return (
    <React.Fragment>
      <DatasetInfoDialog
        datasetSummaryID={datasetSummaryID}
        setDatasetSummaryID={setDatasetSummaryID}
      />

      {(make.has('Observation') && make.has('Model')) || make.size === 0 ? (
        <>
          <DataSearchResultGroup
            make="Observation"
            options={options.Observation}
            handleSetVariableDetailsID={handleSetVariableDetailsID}
            listRef={observationListRef}
            handleSelectDataTarget={handleSelectDataTarget}
            height={(windowHeight - 204) / 2 - 45}
            setdatasetSummaryID={setDatasetSummaryID}
            fullCount={vizSearchResultsFullCounts.Observation}
          />

          <DataSearchResultGroup
            make="Model"
            options={options.Model}
            handleSetVariableDetailsID={handleSetVariableDetailsID}
            listRef={modelListRef}
            handleSelectDataTarget={handleSelectDataTarget}
            height={(windowHeight - 204) / 2 - 45}
            setdatasetSummaryID={setDatasetSummaryID}
            fullCount={vizSearchResultsFullCounts.Model}
          />
        </>
      ) : make.has('Observation') ? (
        <DataSearchResultGroup
          make="Observation"
          options={options.Observation}
          handleSetVariableDetailsID={handleSetVariableDetailsID}
          listRef={observationListRef}
          handleSelectDataTarget={handleSelectDataTarget}
          height={windowHeight - 249}
          setdatasetSummaryID={setDatasetSummaryID}
          fullCount={vizSearchResultsFullCounts.Observation}
        />
      ) : (
        <DataSearchResultGroup
          make="Model"
          options={options.Model}
          handleSetVariableDetailsID={handleSetVariableDetailsID}
          listRef={modelListRef}
          height={windowHeight - 249}
          handleSelectDataTarget={handleSelectDataTarget}
          setdatasetSummaryID={setDatasetSummaryID}
          fullCount={vizSearchResultsFullCounts.Model}
        />
      )}
    </React.Fragment>
  );
};

export default connect(plMapStateToProps, null)(ProductList);
