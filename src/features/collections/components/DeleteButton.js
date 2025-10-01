import React, { useState } from 'react';
import {
  IconButton,
  Popover,
  Typography,
  Box,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Delete as DeleteIcon } from '@material-ui/icons';

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
  cancelButton: {
    color: '#9e9e9e',
  },
  confirmDeleteButton: {
    color: '#fff',
    backgroundColor: '#d32f2f',
    '&:hover': {
      backgroundColor: '#b71c1c',
    },
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
            <Button
              onClick={handleDeleteCancel}
              className={classes.cancelButton}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className={classes.confirmDeleteButton}
              variant="contained"
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default DeleteButton;
