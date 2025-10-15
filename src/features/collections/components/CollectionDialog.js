import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    paddingBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    gap: theme.spacing(1),
  },
}));

/**
 * CollectionDialog
 *
 * Reusable dialog wrapper with configurable title, optional close button, and action buttons.
 * Used by both CreateCollectionModal and EditCollectionModal.
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {string} title - Dialog title text
 * @param {node} children - Dialog content
 * @param {node} actions - Action buttons (rendered in DialogActions)
 * @param {boolean} showCloseButton - Show X button (default: true)
 * @param {object} dialogClasses - Custom classes for Dialog paper
 * @param {string} dialogRootClass - Custom class for Dialog root
 * @param {string|boolean} maxWidth - Dialog maxWidth (default: false)
 * @param {boolean} disableScrollLock - Disable scroll lock (default: true)
 * @param {string} ariaLabelledBy - ARIA label ID (default: auto-generated)
 */
const CollectionDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  showCloseButton,
  dialogClasses,
  dialogRootClass,
  maxWidth,
  disableScrollLock,
  ariaLabelledBy,
}) => {
  const classes = useStyles();
  const titleId = ariaLabelledBy || 'collection-dialog-title';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: dialogClasses, root: dialogRootClass }}
      maxWidth={maxWidth}
      disableScrollLock={disableScrollLock}
      aria-labelledby={titleId}
    >
      <DialogTitle id={titleId} className={classes.dialogTitle}>
        {title}
        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            className={classes.closeButton}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions className={classes.dialogActions}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

CollectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  showCloseButton: PropTypes.bool,
  dialogClasses: PropTypes.string,
  dialogRootClass: PropTypes.string,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  disableScrollLock: PropTypes.bool,
  ariaLabelledBy: PropTypes.string,
};

CollectionDialog.defaultProps = {
  actions: null,
  showCloseButton: true,
  dialogClasses: '',
  dialogRootClass: '',
  maxWidth: false,
  disableScrollLock: true,
  ariaLabelledBy: '',
};

export default CollectionDialog;
