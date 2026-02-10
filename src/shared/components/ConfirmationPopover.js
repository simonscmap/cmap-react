import React from 'react';
import { Popover, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from './UniversalButton';
import colors from '../../enums/colors';

const useStyles = makeStyles((theme) => ({
  popoverContent: {
    padding: theme.spacing(2),
    maxWidth: 320,
  },
  popoverTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: colors.primary,
  },
  popoverMessage: {
    marginBottom: theme.spacing(2),
    color: 'white',
  },
  popoverActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
}));

const ConfirmationPopover = ({
  open,
  anchorEl,
  onClose,
  title,
  message,
  actions = [],
  anchorOrigin = { vertical: 'top', horizontal: 'left' },
  transformOrigin = { vertical: 'bottom', horizontal: 'left' },
  ariaLabelId,
  ariaDescriptionId,
}) => {
  const classes = useStyles();

  const labelId = ariaLabelId || 'confirmation-popover-title';
  const descriptionId = ariaDescriptionId || 'confirmation-popover-description';

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableScrollLock={true}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
    >
      <Box className={classes.popoverContent} role="alertdialog" aria-modal="true">
        <Typography id={labelId} className={classes.popoverTitle}>{title}</Typography>
        <Typography id={descriptionId} variant="body2" className={classes.popoverMessage}>
          {message}
        </Typography>
        <Box className={classes.popoverActions}>
          {actions.map((action, index) => (
            <UniversalButton
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="medium"
              autoFocus={action.autoFocus}
            >
              {action.label}
            </UniversalButton>
          ))}
        </Box>
      </Box>
    </Popover>
  );
};

export default ConfirmationPopover;
