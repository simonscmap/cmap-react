import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Delete as DeleteIcon } from '@material-ui/icons';
import ConfirmationPopover from '../../../shared/components/ConfirmationPopover';

const useStyles = makeStyles((theme) => ({
  deleteButton: {
    color: 'rgba(255, 255, 255, 0.4)',
    padding: theme.spacing(0.5),
    marginLeft: -theme.spacing(0.8),
    '&:hover': {
      color: '#d32f2f',
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
    },
  },
}));

const DeleteButton = ({ title, message, followerCount, onDelete }) => {
  const classes = useStyles();
  const [deleteAnchor, setDeleteAnchor] = useState(null);

  let displayMessage = message;
  if (followerCount > 0) {
    const followerText = followerCount === 1 ? 'follower' : 'followers';
    displayMessage = `This collection has ${followerCount} ${followerText} who will lose access when you delete it. This action is permanent and cannot be undone.`;
  }

  const handleDeleteClick = (event) => {
    setDeleteAnchor(event.currentTarget);
  };

  const handleDeleteCancel = () => {
    setDeleteAnchor(null);
  };

  const handleDeleteConfirm = () => {
    setDeleteAnchor(null);
    onDelete();
  };

  return (
    <>
      <IconButton
        className={classes.deleteButton}
        onClick={handleDeleteClick}
        size="small"
      >
        <DeleteIcon />
      </IconButton>

      <ConfirmationPopover
        open={Boolean(deleteAnchor)}
        anchorEl={deleteAnchor}
        onClose={handleDeleteCancel}
        title={title}
        message={displayMessage}
        actions={[
          { label: 'CANCEL', onClick: handleDeleteCancel, variant: 'default' },
          { label: 'DELETE', onClick: handleDeleteConfirm, variant: 'danger' },
        ]}
      />
    </>
  );
};

export default DeleteButton;
