// Hidden input
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SiMicrosoftexcel } from "react-icons/si";
import { TbDragDrop } from "react-icons/tb";

// components
import { StepButton } from './Buttons';

// fns
import { safePath } from '../../../Utility/objectUtils';

// action creators
import { setLoadingMessage } from '../../../Redux/actions/ui';
import { checkSubmissionOptionsAndStoreFile } from '../../../Redux/actions/dataSubmission';

const useStyles = makeStyles ((theme) => ({
  paperArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2em',
    margin: '30px 0',
    padding: '1.5em',
    whiteSpace: 'pre-wrap',
    border: `1px dashed ${theme.palette.primary.light}`
  },
  rowOne: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2em',
  },
  displayNone: {
    display: 'none',
  },
  uploadInstruction: {
    fontSize: '1.2em',
  },
  dropOption: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& > svg': {
      color: theme.palette.primary.light,
      fontSize: '4em',
      marginRight: '.2em',
    }
  }
}));

const FileUploadArea = (props) => {
  const dispatch = useDispatch();
  const cl = useStyles ();

  const subId = useSelector ((state) => state.submissionToUpdate);
  const subType = useSelector ((state) => state.submissionType);

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
      <Typography variant="body2" className={cl.uploadInstruction}>
        To {subType === "new"
             ? ` start a new submission `
             : ` to update submission #${subId}`
        }
      </Typography>
      <div className={cl.rowOne}>
        <div className={cl.dropOption}>
          <TbDragDrop />
          <Typography variant="body2" className={cl.uploadInstruction}>
            {' '} drop .xlsx file here, or
          </Typography>
        </div>
        <StepButton component="label" >
          <SiMicrosoftexcel/>{' '} Browse
          <input
            onChange={handleFileSelect}
            accept=".xlsx"
            id="select-file-input"
            type="file"
            hidden
          />
        </StepButton>
      </div>
    </Paper>
  );
};

export default FileUploadArea;
