import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import CheckBoxTwoToneIcon from '@material-ui/icons/CheckBoxTwoTone';
// import colors from '../../../enums/colors';
import { toolPanelStyles } from './gridStyles';
import copyTextToClipboard from '../../../Utility/Clipboard/copyTextToClipboard';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';

export const VariableRowRender = withStyles(toolPanelStyles)(
  React.memo(function BlobRenderFC({
    comment,
    longName,
    classes,
    handleVariableLink,
  }) {
    let handler = handleVariableLink || (() => {});

    if (!comment) {
      return '';
    }

    return (
      <div className={classes.vumListRow}>
        <div className={classes.variableName}>
          <div>
            <a onClick={() => handler(longName)}>{longName || 'no name'}</a>
          </div>
          <div>
            <div className={classes.longNameChip}>Variable</div>
          </div>
        </div>
        {comment}
      </div>
    );
  }),
);

export const ListRender = withStyles(toolPanelStyles)(({
  rows,
  classes,
  handleVariableLink,
}) => {
  if (!rows) {
    return '';
  }

  return (
    <div className={classes.vumListContainer}>
      <div className={classes.allCommentsLabel}>
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
});

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
      // console.log('comment tool panel asking for updated model')
      dispatchCustomWindowEvent('clearFocusEvent', null);
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

const SidebarCommentToolPanel = withStyles(toolPanelStyles)((props) => {
  let { classes } = props;
  let [focusedVariableData, setFocusedVariableData] = useState(null);
  let [isFocusView, setIsFocusView] = useState(false);

  let handleFocus = (e) => {
    let { detail } = e;
    if (detail) {
      if (
        !focusedVariableData ||
        detail.longName !== focusedVariableData.longName
      ) {
        setFocusedVariableData(detail);
        setIsFocusView(true);
      }
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

  // listen for event containing current panel content
  useEffect(() => {
    window.addEventListener('setFocusEvent', handleFocus, false);
    window.addEventListener('copyToClipboard', handleCopy, false);
    window.addEventListener('clearFocusEvent', handleClearFocus, false);
    return () => {
      window.removeEventListener('setFocusEvent', handleFocus);
      window.removeEventListener('copyToClipboard', handleCopy);
      window.removeEventListener('clearFocusEvent', handleClearFocus);
    };
  }, []);

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
    <div className={classes.toolPanelContainer}>
      <div className={classes.title}>
        <div>
          <span>Comment Tool Panel</span>
        </div>
        <div onClick={handleExit} className={classes.toolBarClose}>
          <span>Exit Tool Panel</span>
          <Close />
        </div>
      </div>

      {isFocusView && focusedVariableData && (
        <div>
          <div className={classes.variableFocusLabelContainer}>
            <div className={classes.variableLabel}>{/* removed */}</div>
            <div onClick={handleClose} className={classes.closeBox}>
              <span>Deselect Variable</span>
              <Close />
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
});

export default SidebarCommentToolPanel;
