// Variable grid appearing on dataset pages
import {
  withStyles,
} from '@material-ui/core';
import { ArrowDownward, ArrowUpward, Menu, CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox } from '@material-ui/icons';
import { AgGridReact } from 'ag-grid-react';
import React, { useRef, useEffect, useState } from 'react';
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
import { gridStyles } from './gridStyles';

const DatasetPageAGGrid = (props) => {
  const { Variables, classes } = props;
  const gridRef = useRef();

  let [currentFocus, setCurrentFocus] = useState(null);

  const openToolPanel = (panelId) => {
    gridRef && gridRef.current && gridRef.current.api.openToolPanel(panelId);
  }
  const closeSideBar = () => {
    gridRef && gridRef.current && gridRef.current.api.closeToolPanel();
  }

  // dispatch an event notifying tool panel components which variable (row) is selected
  const giveVariableFocus = ({ detail }) => {
    let { longName } = detail;

    let model = gridRef
      && gridRef.current
      && gridRef.current.api
      && gridRef.current.api.getModel
      && gridRef.current.api.getModel();

    if (!model) {
      return;
    }

    let rows = model.rowsToDisplay;
    let match = rows.find((r) => r && r.data && r.data.Long_Name === longName);
    if (match) {
      // get comment, UM
      let payload = {
        longName,
        comment: match.data.Comment,
        unstructuredMetadata: match.data.Unstructured_Variable_Metadata,
      };

      dispatchVariableFocusEvent (payload);
      setCurrentFocus(longName);
    }
  };

  // gridRef needs to be in scope for this click handler, in order to access thi grid api
  const onCellClick = (e) => {
    // send data to tool panels
    let payload = makeVariableFocusPayload (e);
    if (currentFocus !== payload.longName) {
      dispatchVariableFocusEvent (payload);
    }

    // open requested tool panel
    let colId = getColIdFromCellClickEvent (e);
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
    let model = gridRef
      && gridRef.current
      && gridRef.current.api
      && gridRef.current.api.getModel
      && gridRef.current.api.getModel();

    if (model) {
      let rowsToDisplay = model.rowsToDisplay.map((row) => ({
        Comment: row.data.Comment,
        Unstructured_Variable_Metadata: row.data.Unstructured_Variable_Metadata,
        Long_Name: row.data.Long_Name,
      }));

      dispatchCustomVariablesTableModel([...rowsToDisplay]);

      // check if current selection is still in current model
      // if not, deselect it

      let focusIsInModel = rowsToDisplay.some((row) => row.Long_Name === currentFocus);
      if (!focusIsInModel && currentFocus !== null) {
        dispatchClearFocusEvent();
        setCurrentFocus(null);
      }
    }

  }

  const handleClearFocus = () => {
    // clear focus
    gridRef
      && gridRef.current
      && gridRef.current.api
      && gridRef.current.api.clearFocusedCell
      && gridRef.current.api.clearFocusedCell();

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

    let model = gridRef
      && gridRef.current
      && gridRef.current.api
      && gridRef.current.api.getModel
      && gridRef.current.api.getModel();

    if (!model) {
      return;
    }

    let rows = model.rowsToDisplay;
    let match = rows.find((r) => r && r.data && r.data.Long_Name === longName);

    if (match) {
      if (gridRef && gridRef.current && gridRef.current.api) {
        let focusedCell = gridRef.current.api.getFocusedCell();
        if (!focusedCell || focusedCell.rowIndex !== match.rowIndex) {
          gridRef.current.api.setFocusedCell(match.rowIndex, 'variableName', null);
          gridRef.current.api.ensureIndexVisible(match.rowIndex, 'middle');
        }
      }
    }
    setCurrentFocus(longName);
  }

  // listen for "clear" focus from side panel
  useEffect(() => {
    window.addEventListener("clearFocusEvent", handleClearFocus, false);
    window.addEventListener("setFocusEvent", handleFocus, false);
    window.addEventListener("askForFocus", giveVariableFocus, false);
    window.addEventListener("exitToolBar", closeSideBar, false);
    return () => {
      window.removeEventListener('clearFocusEvent', handleClearFocus);
      window.removeEventListener("setFocusEvent", handleFocus, false);
      window.removeEventListener("askForFocus", giveVariableFocus, false);
      window.addEventListener("exitToolBar", closeSideBar, false);
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
          height: `${Variables.length * 60 + 200}px`,
          maxHeight: '800px',
        }}
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDef}
          rowData={Variables}
          onGridReady={(params) => params.columnApi.autoSizeAllColumns()}
          onCellClicked={onCellClick}
          // onColumnResized={(args) => console.log(args)}
          onModelUpdated={dispatchCurrentTableModel}
          colResizeDefault={'shift'}
          // enableCellTextSelection={true}
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
            toolPanels: [{
              // The unique ID for this panel. Used in the API and elsewhere to refer to the panel.
              id: 'metadata',
              // The key used for localisation for displaying the label. The label is displayed in the tab button.
              labelKey: 'metadata',
              // The default label if `labelKey` is missing or does not map to valid text through localisation.
              labelDefault: 'Metadata',
              // The min width of the tool panel. Default: `100`
              minWidth: 300,
              // The max width of the tool panel. Default: `undefined`
              // maxWidth: number,
              // The initial width of the tool panel. Default: `$side-bar-panel-width (theme variable)`
              width: 500,
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
              // The unique ID for this panel. Used in the API and elsewhere to refer to the panel.
              id: 'comments',
              // The key used for localisation for displaying the label. The label is displayed in the tab button.
              labelKey: 'comments',
              // The default label if `labelKey` is missing or does not map to valid text through localisation.
              labelDefault: 'Comments',
              // The min width of the tool panel. Default: `100`
              minWidth: 300,
              // The max width of the tool panel. Default: `undefined`
              // maxWidth: number,
              // The initial width of the tool panel. Default: `$side-bar-panel-width (theme variable)`
              width: 500,
              // The key of the icon to be used as a graphical aid beside the label in the side bar.
              iconKey: 'grip',
              // The tool panel component to use as the panel.
              // The provided panels use components `agColumnsToolPanel` and `agFiltersToolPanel`.
              // To provide your own custom panel component, you reference it here.
              toolPanelFramework: CommentToolPanel,
              // Customise the parameters provided to the `toolPanel` component.
              // toolPanelParams?: any;
            },
            ]
          }}
        />
      </div>
    </div>
  );
};

export default withStyles(gridStyles)(DatasetPageAGGrid);
