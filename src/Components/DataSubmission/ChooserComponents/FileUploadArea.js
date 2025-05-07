// Hidden input
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SiMicrosoftexcel } from 'react-icons/si';
import { TbDragDrop } from 'react-icons/tb';

// components
import { StepButton } from './Buttons';
import Spinner from '../../UI/Spinner';
// fns
import { safePath } from '../../../Utility/objectUtils';
import { formatBytes } from '../Helpers/display';

// action creators
import {
  checkSubmissionOptionsAndStoreFile,
  clearSubmissionFile,
} from '../../../Redux/actions/dataSubmission';

const useStyles = makeStyles((theme) => ({
  paperArea: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '30px 0',
    padding: '1.5em',
    whiteSpace: 'pre-wrap',
    border: `1px dashed ${theme.palette.primary.light}`,
  },
  rowOne: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayNone: {
    display: 'none',
  },
  uploadInstruction: {
    fontSize: '1.2em',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  dropOption: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& > svg': {
      color: theme.palette.primary.light,
      fontSize: '3em',
      marginRight: '.2em',
    },
  },
  stepButton: {
    fontSize: '1em',
  },
}));

const FileUploadArea = (props) => {
  const { loadingStatus, reset } = props;
  const dispatch = useDispatch();
  const cl = useStyles();

  const subType = useSelector((state) => state.submissionType);
  const subNameToUpdate = useSelector((state) => {
    if (state.submissionType === 'update' && state.submissionToUpdate) {
      const s = state.dataSubmissions.find(
        (sub) => sub.Submission_ID === state.submissionToUpdate,
      );
      if (s) {
        return s.Dataset_Long_Name;
      } else {
        return null;
      }
    }
  });

  const subToUpdate = useSelector((state) => state.submissionToUpdate);

  const clearPrev = () => {
    reset();
    dispatch(clearSubmissionFile());
  };

  const selectFile = (file) => {
    dispatch(checkSubmissionOptionsAndStoreFile(file, subToUpdate));
  };

  const handleFileDrop = (e) => {
    console.log('file dropped; processing', e);
    e.preventDefault();
    clearPrev();
    const file = e.dataTransfer.items[0].getAsFile();
    selectFile(file);
  };

  const handleFileSelect = (e) => {
    clearPrev();
    const file = safePath(['target', 'files', '0'])(e);
    if (!file) {
      console.log('NO FILE!!', e);
    } else {
      selectFile(file);
    }
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  let [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading && !loadingStatus) {
      setLoading(false);
    }

    const message = ['reading', 'parsing', 'validating'].some(
      (status) => status === (loadingStatus && loadingStatus.status),
    );

    let largeFile = false;
    if (loadingStatus && loadingStatus.totalBytes > 1000000) {
      // greater than about 1 MB
      largeFile = true;
    }

    if (message) {
      let msg;
      if (loadingStatus.status === 'reading') {
        msg = `Reading File (${formatBytes(loadingStatus.totalBytes)})`;
      } else if (loadingStatus.status === 'parsing') {
        msg = `Parsing File (${formatBytes(loadingStatus.totalBytes)})`;
      } else if (loadingStatus.status === 'validating') {
        msg = 'Validating Data';
      }
      if (largeFile) {
        msg += '\nProcessing a large file may take time, please wait.';
      }
      setLoading(msg);
    } else if (!message && loading) {
      setLoading(false);
    }
  }, [loadingStatus]);

  return (
    <Paper
      elevation={2}
      className={cl.paperArea}
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
    >
      {loading ? (
        <Spinner message={loading} />
      ) : (
        <div className={cl.content}>
          <Typography variant="body2" className={cl.uploadInstruction}>
            To{' '}
            {subType === 'new'
              ? ` start a new submission `
              : ` update submission "${subNameToUpdate || '...'}" `}{' '}
            drop an .xlsx file here{' '}
            <span className={cl.dropOption}>
              <TbDragDrop />{' '}
            </span>{' '}
            or browse with the file finder{' '}
            <StepButton component="label" className={cl.stepButton}>
              <SiMicrosoftexcel /> Browse
              <input
                onChange={handleFileSelect}
                accept=".xlsx"
                id="select-file-input"
                type="file"
                hidden
              />
            </StepButton>
          </Typography>
        </div>
      )}
    </Paper>
  );
};

export default FileUploadArea;
/*
 * <div className={cl.rowOne}>
 *         <div className={cl.dropOption}>
 *           <Typography variant="body2" className={cl.uploadInstruction}>
 *             drop an .xlsx file here
 *           </Typography>
 *           <TbDragDrop />
 *           <Typography variant="body2" className={cl.uploadInstruction}>
 *             or browse with the file finder {' '}
 *           </Typography>
 *         </div>
 *         <StepButton component="label" >
 *           <SiMicrosoftexcel/>{' '} Browse
 *           <input
 *             onChange={handleFileSelect}
 *             accept=".xlsx"
 *             id="select-file-input"
 *             type="file"
 *             hidden
 *           />
 *         </StepButton>
 *       </div> */
