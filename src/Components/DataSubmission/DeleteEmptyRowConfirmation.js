import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../Home/theme';

const useStyles = makeStyles ((theme) => ({
  dialogPaper: {
    backgroundColor: colors.blue.slate
  }
}));

const DeleteEmptyRowConfirmation = (props) => {
  const { data, remove, close } = props;
  const classes = useStyles();

  const [open, setOpen] = React.useState(data && data.open || false);


  React.useEffect(() => {
    if (!data) {
      setOpen(false);
    } else if (data && data.open) {
      setOpen(true);
    }
  }, [data])

  const handleNo = () => {
    close();
  };

  const handleYes = () => {
    if (!data) {
      return close();
    }
    const { sheet, rowToRemove } = data;

    typeof remove === 'function' && remove(sheet, rowToRemove);
  }

  return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    PaperProps={{
        className: classes.dialogPaper,
      }}
      >
        <DialogTitle id="alert-dialog-title">{"Delete Empty Row?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`The row is now empty. Empty rows are not allowed in data sheets. Would you like to remove it?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNo} color="primary">
            No
          </Button>
          <Button onClick={handleYes} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default DeleteEmptyRowConfirmation;
