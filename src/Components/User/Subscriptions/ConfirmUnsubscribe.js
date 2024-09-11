import React from 'react';
import { ThemeProvider, makeStyles, withStyles } from '@material-ui/core/styles';
import { homeTheme } from '../../Home/theme';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';

// Button
export const CustomButton = withStyles((theme) => ({
  root: {
    color: 'white',
    backgroundColor: 'transparent',
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#000000',
    },
    margin: 0,
    borderRadius: '25px',
    boxSizing: 'border-box',
    padding: '0 10px',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
  },
}))(Button);

const ConfirmUnsubscribe = (props) => {
  const { open, handleUnsubscribe, shortName, handleClose } = props;

  return (
    <ThemeProvider theme={homeTheme}>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={Paper}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle>
          Confirm Unsubscribe
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click Unsubscribe to stop receiving email notifications for <code>{shortName}</code>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <CustomButton onClick={handleUnsubscribe} color="primary">
            Unsubscribe
          </CustomButton>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default ConfirmUnsubscribe;
