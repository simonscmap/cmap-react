// Variable grid appearing on dataset pages
import {
  withStyles,
} from '@material-ui/core';
import { ArrowDownward, ArrowUpward, Menu, CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox } from '@material-ui/icons';
import { AgGridReact } from 'ag-grid-react';
import React, { useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import HelpButtonAndDialog from '../../Navigation/Help/HelpButtonAndDialog';
import VariableGridHelpContents from './VariableGridHelpContents';
import MetadataToolPanel from './MetadataToolPanel';
import { columnDefs, defaultColumnDef } from './columnDefinitions';
import {
  dispatchCustomMetadataFocusEvent,
  getColIdFromCellClickEvent,
  makeVUMPayload,
  makeCommentPayload
} from './datagridHelpers';
import { colors } from '../../Home/theme';
import { gridStyles } from './gridStyles';

const DatasetPageAGGrid = (props) => {
  const { Variables, classes } = props;
  const gridRef = useRef();

  const openToolPanel = () => {
    gridRef && gridRef.current && gridRef.current.api.openToolPanel('metadata');
  }

  // gridRef needs to be in scope for this click handler, in order to access thi grid api
  const onCellClick = (e) => {
    let colId = getColIdFromCellClickEvent (e);
    if (colId === 'Unstructured_Variable_Metadata') {
      let payload = makeVUMPayload (e);
      dispatchCustomMetadataFocusEvent (payload);
      openToolPanel ();
    } else if (colId === 'Comment') {
      let payload = makeCommentPayload (e);
      dispatchCustomMetadataFocusEvent (payload);
      openToolPanel ();
    } else if (colId === 'unknown') {
      console.error('could not extract colId from cell click event', e);
    }
  };

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
          frameworkComponents={{ metadataToolPanel: MetadataToolPanel }}
          sideBar={{
            position: 'right',
            defaultToolsPanel: 'metadata',
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
              toolPanel: 'metadataToolPanel',
              // Customise the parameters provided to the `toolPanel` component.
              // toolPanelParams?: any;
            }]
          }}
        />
      </div>
    </div>
  );
};

export default withStyles(gridStyles)(DatasetPageAGGrid);
