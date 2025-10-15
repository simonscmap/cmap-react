import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from './UniversalButton';
import zIndex from '../../enums/zIndex';

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
  actionButton: {
    marginRight: theme.spacing(1),
    '&:last-child': {
      marginRight: 0,
    },
  },
}));

/**
 * ConfirmationDialog
 *
 * Reusable confirmation dialog component for collections feature.
 * Provides a consistent styled dialog for various confirmation scenarios.
 *
 * @param {boolean} open - Whether the dialog is visible
 * @param {function} onClose - Callback when dialog is closed (e.g., clicking backdrop)
 * @param {string} title - Dialog title text
 * @param {string|node} message - Dialog message content (can be string or React node for complex content)
 * @param {Array} actions - Array of action button configurations
 *   Each action object: {
 *     label: string,
 *     onClick: function,
 *     variant: 'primary' | 'secondary' | 'default',
 *     autoFocus: boolean (optional),
 *   }
 * @param {string} ariaLabelId - Optional custom aria-labelledby ID (defaults to generated ID)
 * @param {string} ariaDescriptionId - Optional custom aria-describedby ID (defaults to generated ID)
 */
const ConfirmationDialog = ({
  open,
  onClose,
  title,
  message,
  actions = [],
  ariaLabelId,
  ariaDescriptionId,
}) => {
  const classes = useStyles();

  // Generate default IDs if not provided
  const labelId =
    ariaLabelId ||
    `confirmation-dialog-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const descriptionId =
    ariaDescriptionId ||
    `confirmation-dialog-description-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      aria-modal="true"
      disableScrollLock={true}
    >
      <DialogTitle id={labelId} className={classes.dialogTitle}>
        {title}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {typeof message === 'string' ? (
          <DialogContentText id={descriptionId}>{message}</DialogContentText>
        ) : (
          <div id={descriptionId}>{message}</div>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {actions.map((action, index) => (
          <UniversalButton
            key={index}
            onClick={action.onClick}
            variant={action.variant || 'default'}
            size="medium"
            className={classes.actionButton}
            autoFocus={action.autoFocus}
          >
            {action.label}
          </UniversalButton>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
