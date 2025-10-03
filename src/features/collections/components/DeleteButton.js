import React, { useState } from 'react';
import { IconButton, Popover, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Delete as DeleteIcon } from '@material-ui/icons';
import CollectionButton from './UniversalButton';

const useStyles = makeStyles((theme) => ({
  deleteButton: {
    color: '#d32f2f',
    padding: theme.spacing(0.5),
    marginLeft: -theme.spacing(0.8),
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
    },
  },
  popoverContent: {
    padding: theme.spacing(2),
    maxWidth: 320,
  },
  popoverTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: '#d32f2f',
  },
  popoverMessage: {
    marginBottom: theme.spacing(2),
    color: 'rgba(0, 0, 0, 0.87)',
  },
  popoverActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
}));

const DeleteButton = ({ title, message, onDelete }) => {
  const classes = useStyles();
  const [deleteAnchor, setDeleteAnchor] = useState(null);

  const handleDeleteClick = (event) => {
    setDeleteAnchor(event.currentTarget);
  };

  const handleDeleteCancel = () => {
    setDeleteAnchor(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete();
      setDeleteAnchor(null);
    } catch (error) {
      setDeleteAnchor(null);
    }
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

      <Popover
        open={Boolean(deleteAnchor)}
        anchorEl={deleteAnchor}
        onClose={handleDeleteCancel}
        disableScrollLock={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box className={classes.popoverContent}>
          <Typography className={classes.popoverTitle}>{title}</Typography>
          <Typography variant="body2" className={classes.popoverMessage}>
            {message}
          </Typography>
          <Box className={classes.popoverActions}>
            <CollectionButton
              onClick={handleDeleteCancel}
              variant="default"
              size="medium"
            >
              CANCEL
            </CollectionButton>
            <CollectionButton
              onClick={handleDeleteConfirm}
              variant="danger"
              size="medium"
            >
              DELETE
            </CollectionButton>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default DeleteButton;
