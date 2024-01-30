// Hidden input
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// fns
import { safePath } from '../../../Utility/objectUtils';

// action creators
import { setLoadingMessage } from '../../../Redux/actions/ui';
import { checkSubmissionOptionsAndStoreFile } from '../../../Redux/actions/dataSubmission';

const useStyles = makeStyles ((theme) => ({
  paperArea: {
    margin: '30px 0',
    padding: '1.5em',
    whiteSpace: 'pre-wrap',
    border: `1px dashed ${theme.palette.primary.light}`
  },
  displayNone: {
    display: 'none',
  },
}));

const FileUploadArea = (props) => {
  const { subType, subId } = props;
  const dispatch = useDispatch();
  const cl = useStyles ();

  const selectFile = (file) => {
    dispatch (setLoadingMessage ('Reading Workbook'));
    dispatch (checkSubmissionOptionsAndStoreFile (file));
  }

  const handleFileDrop = (e) => {
    console.log ('file dropped; processing', e);
    e.preventDefault();
    const file = e.dataTransfer.items[0].getAsFile();
    selectFile (file);
  };

  const handleFileSelect = (e) => {
    const file = safePath (['target', 'files', '0']) (e);
    if (!file) {
      console.log ('NO FILE!!', e);
    } else {
      selectFile (file)
    }
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Paper
      elevation={2}
      className={cl.paperArea}
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
    >
    <Typography variant="body1">Drop XLSX File Here</Typography>
    <Typography variant="body1">to {subType === "new" ? ` start new submission `: ` to update submission ${subId}` }</Typography>

      <input
        onChange={handleFileSelect}
        className={cl.displayNone}
        accept=".xlsx"
        id="select-file-input"
        type="file"
      />
    </Paper>
  );
};

export default FileUploadArea;
