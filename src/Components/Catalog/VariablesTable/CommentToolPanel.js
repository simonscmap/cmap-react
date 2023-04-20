import React, { useState, useEffect  } from 'react';
import { withStyles } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import CheckBoxTwoToneIcon from '@material-ui/icons/CheckBoxTwoTone';
// import colors from '../../../enums/colors';
import { toolPanelStyles } from './gridStyles';
import copyTextToClipboard from '../../../Utility/Clipboard/copyTextToClipboard';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';

const CommentList = withStyles(toolPanelStyles)(({ classes, shouldDisplay }) => {
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
      console.log('comment tool panel asking for updated model')
      dispatchCustomWindowEvent("clearFocusEvent", null);
    }
    return () => {
      window.removeEventListener("variablesTableModel", handleModel, false);
    };
  }, []);

  let rowsWithComments = rows.filter((row) => row && row.Comment);

  // set the focus of the table to the row of the varibale that was clicked
  let handleVariableLink = (longName) => {
    dispatchCustomWindowEvent("askForFocus", { longName });
  };

  if (!shouldDisplay) {
    return '';
  }

  return (
    <div>
      <div className={classes.allCommentsLabel}>All Comments ({rowsWithComments.length})</div>
      <table>
        <thead>
          <tr>
            <th>Variable Long Name</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>{
          rowsWithComments.map((r, i) => {
            return (
              <tr className={classes.allCommentsRow} key={`comment-row-${i}`}>
                <td>
                  <a onClick={() => handleVariableLink(r.Long_Name)}>{r.Long_Name}</a>
                </td>
                <td>{r.Comment}</td>
              </tr>
            )
          })
        }</tbody>
      </table>
    </div>
  );
});


const SidebarCommentToolPanel = withStyles(toolPanelStyles)((props) => {
  let { classes } = props;
  let [ focusedVariableData, setFocusedVariableData ] = useState(null);
  let [ isFocusView, setIsFocusView ] = useState(false);

  let handleFocus = (e) => {
    let { detail } = e;
    if (detail) {
      if (!focusedVariableData || detail.longName !== focusedVariableData.longName) {
        setFocusedVariableData(detail);
        setIsFocusView(true);
      }
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
    dispatchCustomWindowEvent("copyToClipboard", focusedVariableData);
    console.log(focusedVariableData);
  }

  let handleClose = () => {
    console.log('close');
    dispatchCustomWindowEvent("clearFocusEvent", {});
    setIsFocusView(false);
  }

  // if render comment, render single comment from event payload
  // else render all comments

  return (
    <div className={classes.toolPanelContainer}>
      <div className={classes.title}><span>Comment Tool Panel</span></div>
      {isFocusView && focusedVariableData &&
        <div>
          <div className={classes.variableFocusLabelContainer}>
            <div className={classes.variableLabel}>
              <CheckBoxTwoToneIcon classes={{ root: classes.customIcon }} />
              <span onClick={copyToClipboard} className={classes.variableLongName}>{focusedVariableData.longName}</span>
            </div>
            <div onClick={handleClose} className={classes.closeBox}><Close /></div>
          </div>
          <div>{focusedVariableData.comment}</div>
        </div>
      }
      <CommentList shouldDisplay={!isFocusView} />
    </div>
  );
});

export default SidebarCommentToolPanel;
