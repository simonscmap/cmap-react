import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from '../../../shared/components/UniversalButton';
import zIndex from '../../../enums/zIndex';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    backgroundColor: 'rgb(24, 69, 98)',
  },
  dialogRoot: {
    zIndex: `${zIndex.CONFIRMATION_DIALOG} !important`,
  },
  dialogTitle: {
    paddingBottom: theme.spacing(1),
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  cancelButton: {
    marginRight: theme.spacing(1),
  },
  bulletList: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
}));

/**
 * InvalidDatasetsWarning
 *
 * Confirmation dialog shown when user attempts to copy a public collection
 * that contains invalid datasets. Warns user that invalid datasets will be
 * skipped and shows the count of valid vs invalid datasets.
 *
 * @param {boolean} open - Whether the warning dialog is visible
 * @param {function} onCancel - Callback when user cancels the copy operation
 * @param {function} onConfirm - Callback when user confirms copy despite invalid datasets
 * @param {number} invalidCount - Number of invalid datasets that will be skipped
 * @param {number} validCount - Number of valid datasets that will be copied
 * @param {string} collectionName - Name of the collection being copied
 */
const InvalidDatasetsWarning = ({
  open,
  onCancel,
  onConfirm,
  invalidCount,
  validCount,
  collectionName,
}) => {
  const classes = useStyles();

  const handleClose = () => {
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
      aria-labelledby="invalid-datasets-warning-title"
      aria-describedby="invalid-datasets-warning-description"
      aria-modal="true"
      disableScrollLock={true}
    >
      <DialogTitle
        id="invalid-datasets-warning-title"
        className={classes.dialogTitle}
      >
        Invalid Datasets Warning
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <DialogContentText id="invalid-datasets-warning-description">
          This collection contains {invalidCount} dataset
          {invalidCount === 1 ? '' : 's'} that{' '}
          {invalidCount === 1 ? 'is' : 'are'} no longer available and will NOT
          be included in your copy.
        </DialogContentText>
        <DialogContentText className={classes.bulletList} component="ul">
          <li>
            {validCount} valid dataset{validCount === 1 ? '' : 's'} WILL be
            copied
          </li>
          <li>
            {invalidCount} invalid dataset{invalidCount === 1 ? '' : 's'} will
            be SKIPPED
          </li>
        </DialogContentText>
        <DialogContentText>
          Do you want to proceed with copying "{collectionName}"?
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <UniversalButton
          onClick={onCancel}
          variant="secondary"
          size="medium"
          className={classes.cancelButton}
        >
          Cancel
        </UniversalButton>
        <UniversalButton
          onClick={onConfirm}
          variant="primary"
          size="medium"
          autoFocus
        >
          OK - Copy {validCount} Valid Dataset{validCount === 1 ? '' : 's'}
        </UniversalButton>
      </DialogActions>
    </Dialog>
  );
};

export default InvalidDatasetsWarning;
