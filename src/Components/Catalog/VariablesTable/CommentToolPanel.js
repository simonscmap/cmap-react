import React, { useState, useEffect } from 'react';
// import { withStyles } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { toolPanelStyles } from './gridStyles';
import copyTextToClipboard from '../../../Utility/Clipboard/copyTextToClipboard';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';

export const VariableRowRender = React.memo(function BlobRenderFC({
  comment,
  longName,
  handleVariableLink,
}) {
  const classes = toolPanelStyles();
  let handler = handleVariableLink || (() => {});

  if (!comment) {
    return '';
  }
  return (
    <div
      style={classes.vumListRow}
      data-testid="variable-comment-row"
      id="variable-comment-row"
    >
      <div style={classes.variableName} data-testid="variable-name-container">
        <div>
          <a onClick={() => handler(longName)}>{longName || 'no name'}</a>
        </div>
        <div>
          <div style={classes.longNameChip}>Variable</div>
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>{comment}</div>
    </div>
  );
});

export const ListRender = ({ rows, handleVariableLink }) => {
  const classes = toolPanelStyles();

  if (!rows) {
    return '';
  }
  return (
    <div style={classes.vumListContainer}>
      <div style={classes.allCommentsLabel}>
        Comments <span>({rows.length} matching variables with comments)</span>
      </div>
      {rows.map((r, i) => {
        let comment = r.Comment;
        // for each row, spit out a portion of the table with UM
        return (
          <VariableRowRender
            comment={comment}
            longName={r.Long_Name}
            handleVariableLink={handleVariableLink}
            key={`blob-${i}`}
          />
        );
      })}
    </div>
  );
};

const CommentList = ({ shouldDisplay }) => {
  let [isLoaded, setIsLoaded] = useState(false);
  let [rows, setRows] = useState([]);

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
    window.addEventListener('variablesTableModel', handleModel, false);
    if (rows.length < 1 && !isLoaded) {
      // ask for a new dispatch of the table model
      dispatchCustomWindowEvent('askForModel', null);
    }
    return () => {
      window.removeEventListener('variablesTableModel', handleModel, false);
    };
  }, []);

  let rowsWithComments = rows.filter((row) => row && row.Comment);

  // set the focus of the table to the row of the varibale that was clicked
  let handleVariableLink = (longName) => {
    dispatchCustomWindowEvent('askForFocus', { longName });
  };

  if (!shouldDisplay) {
    return '';
  }

  return (
    <ListRender
      rows={rowsWithComments}
      handleVariableLink={handleVariableLink}
    />
  );
};

const SidebarCommentToolPanel = () => {
  const classes = toolPanelStyles();
  let [focusedVariableData, setFocusedVariableData] = useState(null);
  let [isFocusView, setIsFocusView] = useState(false);

  let handleFocus = (e) => {
    let { detail } = e;

    if (detail) {
      // Always set isFocusView to true when receiving a focus event
      setIsFocusView(true);

      // Update the focused variable data
      setFocusedVariableData(detail);
    }
  };

  let handleCopy = (e) => {
    let { detail } = e;
    if (detail) {
      copyTextToClipboard(detail);
    }
  };

  // when another tool panel clears focus, it should shift this tool panel
  // into a list view as well
  const handleClearFocus = () => {
    setIsFocusView(false);
  };

  // Add an effect to check if this tool panel is active
  useEffect(() => {
    // This effect runs when the component mounts or when focusedVariableData changes
    if (focusedVariableData) {
      setIsFocusView(true);
    }
  }, [focusedVariableData]);

  // listen for event containing current panel content
  useEffect(() => {
    window.addEventListener('setFocusEvent', handleFocus, false);
    window.addEventListener('copyToClipboard', handleCopy, false);
    window.addEventListener('clearFocusEvent', handleClearFocus, false);

    // Don't dispatch clearFocusEvent when the component mounts
    // Only ask for updated model if we don't already have data
    if (!focusedVariableData) {
      dispatchCustomWindowEvent('askForModel', null);
    }

    return () => {
      window.removeEventListener('setFocusEvent', handleFocus);
      window.removeEventListener('copyToClipboard', handleCopy);
      window.removeEventListener('clearFocusEvent', handleClearFocus);
    };
  }, [focusedVariableData, isFocusView]);

  /* let copyToClipboard = () => {
   *   dispatchCustomWindowEvent("copyToClipboard", focusedVariableData);
   *   console.log(focusedVariableData);
   * } */

  let handleClose = () => {
    dispatchCustomWindowEvent('clearFocusEvent', {});
    setIsFocusView(false);
  };

  let handleExit = () => {
    dispatchCustomWindowEvent('exitToolBar', {});
  };

  // if render comment, render single comment from event payload
  // else render all comments
  return (
    <div style={classes.toolPanelContainer}>
      <div onClick={handleExit} style={classes.toolBarClose}>
        <Close />
      </div>
      <div style={classes.title}>Comments</div>

      {isFocusView && focusedVariableData && (
        <div>
          <div style={classes.variableFocusLabelContainer}>
            <div style={classes.variableLabel}>{/* removed */}</div>
            <div onClick={handleClose} style={classes.closeBox}>
              <span
                style={{
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  color: 'rgb(105, 255, 242)',
                }}
              >
                Show All Comments
              </span>
            </div>
          </div>
          <VariableRowRender
            comment={focusedVariableData.comment}
            longName={focusedVariableData.longName}
          />
        </div>
      )}
      <CommentList shouldDisplay={!isFocusView} />
    </div>
  );
};

export default SidebarCommentToolPanel;
