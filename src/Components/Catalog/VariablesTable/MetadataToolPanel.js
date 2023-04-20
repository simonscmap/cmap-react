import React, { useState, useEffect  } from 'react';
import {  withStyles } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import CheckBoxTwoToneIcon from '@material-ui/icons/CheckBoxTwoTone';

import { toolPanelStyles } from './gridStyles';
import { processVUM } from './datagridHelpers';
import copyTextToClipboard from '../../../Utility/Clipboard/copyTextToClipboard';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';
import { UMView } from './SimpleJsonRender';

const VUMList = withStyles(toolPanelStyles)(({ classes, shouldDisplay }) => {
  let [ isLoaded, setIsLoaded] = useState(false);
  let [ rows, setRows ] = useState([]);

  let handleModel = (e) => {
    let { detail: currentRows } = e;
    if (currentRows) {
      setRows([...currentRows]);
      setIsLoaded(true);
    }
  };

  // listen for updates to current table model
  // handle initial state loading
  // --> if the parent component dispatches initial model before this component registers a listener,
  //     then this component will not get its initial data
  useEffect(() => {
    window.addEventListener("variablesTableModel", handleModel, false);
    if (rows.length < 1 && !isLoaded) {
      // ask for a new dispatch of the table model
      console.log('metadata tool panel asking for updated model');
      dispatchCustomWindowEvent("clearFocusEvent", null);
    }
    return () => {
      window.removeEventListener("variablesTableModel", handleModel, false);
    };
  }, []);

  let rowsWithUM = rows.filter((row) => row && row.Unstructured_Variable_Metadata);

  // set the focus of the table to the row of the varibale that was clicked
  let handleVariableLink = (longName) => {
    dispatchCustomWindowEvent("askForFocus", { longName });
  };

  if (!shouldDisplay) {
    console.log('hide UM list');
    return '';
  }

  return (
    <div>
      <div className={classes.allCommentsLabel}>All Metadata ({rowsWithUM.length})</div>
      <table>
        <thead>
          <tr>
            <th>Variable Long Name</th>
            <th>Metadata</th>
          </tr>
        </thead>
        <tbody>{
          rowsWithUM.map((r, i) => {
            return (
              <tr className={classes.allCommentsRow} key={`comment-row-${i}`}>
                <td>
                  <a onClick={() => handleVariableLink(r.Long_Name)}>{r.Long_Name}</a>
                </td>
                <td>{r.Unstructured_Variable_Metadata}</td>
              </tr>
            )
          })
        }</tbody>
      </table>
    </div>
  );
});

const SidebarMetadataToolPanel = withStyles(toolPanelStyles)((props) => {
  let { classes } = props;
  let [ eventPayload, setData ] = useState(null);
  let [ isFocusView, setIsFocusView ] = useState(false);

  let handleFocus = (e) => {
    let { detail } = e;
    if (detail) {
      setData(detail);
      setIsFocusView(true);
    }
  }

  let handleCopy = (e) => {
    let { detail } = e;
    if (detail) {
      copyTextToClipboard(detail);
    }
  }

  // when another tool panel clears focus, it should shift this tool panel
  // into a list view as well
  const handleClearFocus = () => {
      console.log('metadata tool panel clear focus');
      setIsFocusView (false);
  }

  // listen for event containing current panel content
  useEffect(() => {
    window.addEventListener("setFocusEvent", handleFocus, false);
    window.addEventListener("copyToClipboard", handleCopy, false);
    window.addEventListener("clearFocusEvent", handleClearFocus, false);
    return () => {
      window.removeEventListener('setFocusEvent', handleFocus);
      window.removeEventListener('copyToClipboard', handleCopy);
      window.removeEventListener('clearFocusEvent', handleClearFocus);
    };
  }, []);

  let copyToClipboard = () => {
    dispatchCustomWindowEvent("copyToClipboard", eventPayload);
    console.log(eventPayload);
  }

  let handleClose = () => {
    dispatchCustomWindowEvent("clearFocusEvent", {});
    setIsFocusView (false);
  }

  // TODO
  // if focus, show metadata for focused variable
  // else, show list of all metadata

  return (
    <div className={classes.toolPanelContainer}>
      <div className={classes.title}><span>Metadata Tool Panel</span></div>

      {isFocusView && eventPayload &&
        <div>
          <div className={classes.variableFocusLabelContainer}>
            <div className={classes.variableLabel}>
              <CheckBoxTwoToneIcon classes={{ root: classes.customIcon }} />
              <span
                onClick={copyToClipboard}
                className={classes.variableLongName}>
                {eventPayload.longName}
              </span>
            </div>
            <div onClick={handleClose} className={classes.closeBox}><Close /></div>
          </div>
          <UMView data={processVUM(eventPayload.unstructuredMetadata)} />
        </div>
      }
      <VUMList shouldDisplay={!isFocusView} />
    </div>
  );
});

export default SidebarMetadataToolPanel;
