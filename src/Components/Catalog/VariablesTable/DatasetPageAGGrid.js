// Variable grid appearing on dataset pages
import { Typography, withStyles } from '@material-ui/core';
import {
  ArrowDownward,
  ArrowUpward,
  Menu,
  CheckBox,
  CheckBoxOutlineBlank,
  IndeterminateCheckBox,
} from '@material-ui/icons';
import { AgGridReact } from 'ag-grid-react';
import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import HelpButtonAndDialog from '../../Navigation/Help/HelpButtonAndDialog';
import VariableGridHelpContents from './VariableGridHelpContents';
import MetadataToolPanel from './MetadataToolPanel';
import CommentToolPanel from './CommentToolPanel';
import { columnDefs, defaultColumnDef } from './columnDefinitions';
import {
  dispatchVariableFocusEvent,
  dispatchCustomVariablesTableModel,
  getColIdFromCellClickEvent,
  makeVariableFocusPayload,
  dispatchClearFocusEvent,
} from './datagridHelpers';
import { colors } from '../../Home/theme';
import Spinner from '../../UI/Spinner';
import states from '../../../enums/asyncRequestStates';

import { gridStyles } from './gridStyles';

const DatasetPageAGGrid = (props) => {
  const { variables, classes } = props;
  const gridRef = useRef();

  let [currentFocus, setCurrentFocus] = useState(null);

  const openToolPanel = (panelId) => {
    gridRef && gridRef.current && gridRef.current.api.openToolPanel(panelId);
  };
  const closeSideBar = () => {
    gridRef && gridRef.current && gridRef.current.api.closeToolPanel();
  };

  // dispatch an event notifying tool panel components which variable (row) is selected
  const giveVariableFocus = ({ detail }) => {
    let { longName } = detail;

    let model =
      gridRef &&
      gridRef.current &&
      gridRef.current.api &&
      gridRef.current.api.getModel &&
      gridRef.current.api.getModel();

    if (!model) {
      return;
    }

    let rows = model.rowsToDisplay;
    let match = rows.find((r) => r && r.data && r.data.Long_Name === longName);
    if (match) {
      console.log('match row', match);
      // get comment, UM
      let payload = {
        longName,
        comment: match.data.Comment,
        unstructuredMetadata: match.data.Unstructured_Variable_Metadata,
      };

      dispatchVariableFocusEvent(payload);
      setCurrentFocus(longName);
    }
  };

  // gridRef needs to be in scope for this click handler, in order to access thi grid api
  const onCellClick = (e) => {
    // send data to tool panels
    let payload = makeVariableFocusPayload(e);
    if (currentFocus !== payload.longName) {
      dispatchVariableFocusEvent(payload);
    }

    // open requested tool panel
    let colId = getColIdFromCellClickEvent(e);
    if (colId === 'Unstructured_Variable_Metadata') {
      // dispatch both event to load variable data into both tool panels
      openToolPanel('metadata');
    } else if (colId === 'Comment') {
      openToolPanel('comments');
    } else if (colId === 'unknown') {
      console.error('could not extract colId from cell click event', e);
    }
  };

  const dispatchCurrentTableModel = () => {
    // dispatch current ag model
    let model =
      gridRef &&
      gridRef.current &&
      gridRef.current.api &&
      gridRef.current.api.getModel &&
      gridRef.current.api.getModel();

    if (model) {
      let rowsToDisplay = model.rowsToDisplay.map((row) => ({
        Comment: row.data.Comment,
        Unstructured_Variable_Metadata: row.data.Unstructured_Variable_Metadata,
        Long_Name: row.data.Long_Name,
      }));

      dispatchCustomVariablesTableModel([...rowsToDisplay]);

      // check if current selection is still in current model
      // if not, deselect it

      let focusIsInModel = rowsToDisplay.some(
        (row) => row.Long_Name === currentFocus,
      );
      if (!focusIsInModel && currentFocus !== null) {
        dispatchClearFocusEvent();
        setCurrentFocus(null);
      }
    }
  };

  const handleClearFocus = () => {
    // clear focus
    gridRef &&
      gridRef.current &&
      gridRef.current.api &&
      gridRef.current.api.clearFocusedCell &&
      gridRef.current.api.clearFocusedCell();

    dispatchCurrentTableModel();
    if (currentFocus !== null) {
      setCurrentFocus(null);
    }
  };

  // respond to setFocusEvent
  const handleFocus = (event) => {
    let { detail } = event;
    let { longName } = detail;

    setCurrentFocus(longName);

    let model =
      gridRef &&
      gridRef.current &&
      gridRef.current.api &&
      gridRef.current.api.getModel &&
      gridRef.current.api.getModel();

    if (!model) {
      return;
    }

    let rows = model.rowsToDisplay;
    let match = rows.find((r) => r && r.data && r.data.Long_Name === longName);

    if (match) {
      if (gridRef && gridRef.current && gridRef.current.api) {
        let focusedCell = gridRef.current.api.getFocusedCell();
        if (!focusedCell || focusedCell.rowIndex !== match.rowIndex) {
          gridRef.current.api.setFocusedCell(
            match.rowIndex,
            'variableName',
            null,
          );
          gridRef.current.api.ensureIndexVisible(match.rowIndex, 'middle');
        }
      }
    }
    setCurrentFocus(longName);
  };

  // listen for "clear" focus from side panel
  useEffect(() => {
    window.addEventListener('clearFocusEvent', handleClearFocus, false);
    window.addEventListener('setFocusEvent', handleFocus, false);
    window.addEventListener('askForFocus', giveVariableFocus, false);
    window.addEventListener('exitToolBar', closeSideBar, false);
    return () => {
      window.removeEventListener('clearFocusEvent', handleClearFocus);
      window.removeEventListener('setFocusEvent', handleFocus, false);
      window.removeEventListener('askForFocus', giveVariableFocus, false);
      window.addEventListener('exitToolBar', closeSideBar, false);
    };
  }, []);
  return (
    <div id="DatasetAGGrid">
      <HelpButtonAndDialog
        title="Variable Table"
        content={<VariableGridHelpContents />}
        buttonClass={classes.helpButton}
      />

      <div
        className={classes.gridWrapper + ' ag-theme-material'}
        style={{
          height: `${variables.length * 60 + 200}px`,
          maxHeight: '800px',
        }}
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDef}
          rowData={variables}
          onGridReady={(params) => params.columnApi.autoSizeAllColumns()}
          onCellClicked={onCellClick}
          // onColumnResized={(args) => console.log(args)}
          onModelUpdated={dispatchCurrentTableModel}
          colResizeDefault={'shift'}
          enableCellTextSelection={true} // this does not seem to work
          // enableFilter={true}
          floatingFilter={true}
          rowHeight={38}
          suppressHorizontalScroll={false}
          alwaysShowHorizontalScroll={true}
          // enableBrowserTooltips={true}
          // cacheQuickFilter={true}
          // quickFilterText={quickSearch}
          getContextMenuItems={() => ['copy', 'csvExport']}
          icons={{
            menu: ReactDOMServer.renderToString(
              <Menu style={{ fontSize: '1.2rem', color: colors.primary }} />,
            ),
            sortAscending: ReactDOMServer.renderToString(
              <ArrowUpward
                style={{ fontSize: '1.2rem', color: colors.primary }}
              />,
            ),
            sortDescending: ReactDOMServer.renderToString(
              <ArrowDownward
                style={{ fontSize: '1.2rem', color: colors.primary }}
              />,
            ),
            checkboxChecked: ReactDOMServer.renderToString(
              <CheckBox
                style={{ fontSize: '1.2rem', color: colors.primary }}
              />,
            ),
            checkboxUnchecked: ReactDOMServer.renderToString(
              <CheckBoxOutlineBlank
                style={{ fontSize: '1.2rem', color: colors.primary }}
              />,
            ),
            checkboxIndeterminate: ReactDOMServer.renderToString(
              <IndeterminateCheckBox
                style={{ fontSize: '1.2rem', color: colors.primary }}
              />,
            ),
          }}
          sideBar={{
            position: 'right',
            defaultToolsPanel: 'comments',
            toolPanels: [
              {
                // The unique ID for this panel. Used in the API and elsewhere to refer to the panel.
                id: 'metadata',
                // The key used for localisation for displaying the label. The label is displayed in the tab button.
                labelKey: 'Additional Variable Metadata',
                // The default label if `labelKey` is missing or does not map to valid text through localisation.
                labelDefault: 'Additional Variable Metadata',
                // The min width of the tool panel. Default: `100`
                minWidth: 225,
                // The max width of the tool panel. Default: `undefined`
                // maxWidth: number,
                // The initial width of the tool panel. Default: `$side-bar-panel-width (theme variable)`
                width: 225,
                // The key of the icon to be used as a graphical aid beside the label in the side bar.
                iconKey: 'grip',
                // The tool panel component to use as the panel.
                // The provided panels use components `agColumnsToolPanel` and `agFiltersToolPanel`.
                // To provide your own custom panel component, you reference it here.
                toolPanelFramework: MetadataToolPanel,
                // Customise the parameters provided to the `toolPanel` component.
                // toolPanelParams?: any;
              },
              {
                id: 'comments',
                labelKey: 'comments',
                labelDefault: 'Comments',
                minWidth: 225,
                width: 225,
                iconKey: 'grip',
                toolPanelFramework: CommentToolPanel,
                toolPanelParams: {
                  currentFocus,
                  setCurrentFocus,
                },
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

const DatasetVariables = withStyles(gridStyles)(DatasetPageAGGrid);

const mapStateToProps = (state) => ({
  loadingState: state.datasetDetailsPage.variablesLoadingState,
  metadataLoadingState:
    state.datasetDetailsPage.unstructuredMetadataLoadingState,
  dataset: state.datasetDetailsPage.data,
  variables: state.datasetDetailsPage.variables,
  metadata: state.datasetDetailsPage.unstructuredVariableMetadata,
});

const DatasetVariablesTableWithLoadingState = connect(mapStateToProps)(
  (props) => {
    let { loadingState, metadataLoadingState, dataset, variables, metadata } =
      props;

    let eitherHasFailed = [loadingState, metadataLoadingState].some(
      (s) => s === states.failed,
    );
    let eitherIsPending = [loadingState, metadataLoadingState].some(
      (s) => s === states.inProgress,
    );
    let bothHaveSucceeded = [loadingState, metadataLoadingState].every(
      (s) => s === states.succeeded,
    );

    if (bothHaveSucceeded && dataset) {
      let datasetStats = {
        Time_Min: dataset.Time_Min,
        Time_Max: dataset.Time_Max,
        Lat_Min: dataset.Lat_Min,
        Lat_Max: dataset.Lat_Max,
        Lon_Min: dataset.Lon_Min,
        Lon_Max: dataset.Lon_Max,
        Depth_Min: dataset.Depth_Min,
        Depth_Max: dataset.Depth_Max,
      };

      let ammendedVariables = variables.map((variable) => {
        return Object.assign({}, variable, datasetStats, {
          Unstructured_Variable_Metadata: metadata[variable.Variable] || null,
        });
      });

      return <DatasetVariables variables={ammendedVariables} />;
    } else if (eitherHasFailed) {
      return (
        <Typography>
          Oops! There was an error loading the dataset variables.
        </Typography>
      );
    } else if (eitherIsPending) {
      return (
        <div id="DatasetAGGrid">
          <div
            className={'ag-theme-material'}
            style={{
              height: '400px',
              border: '1px solid black',
              lineHeight: '400px',
            }}
          >
            Doopie Doopie Doopie
            <div style={{ margin: '0 auto' }}>
              <Spinner />
            </div>
          </div>
        </div>
      );
    } else {
      return '';
    }
  },
);

export default DatasetVariablesTableWithLoadingState;
