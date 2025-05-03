// Pop-up dialog for downloading data on catalog pages
import { Dialog } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmbeddedLogin from './EmbeddedLogin';
import DialogContent from './DialogContent';

import styles from './downloadDialogStyles';

import Spinner from '../../UI/Spinner';
import Spacer from '../../Common/Spacer';

import { clearFailedSizeChecks } from '../../../Redux/actions/catalog';

const DialogWrapper = (props) => {
  let { dataset, dialogOpen, classes, handleClose } = props;
  let dispatch = useDispatch();
  let user = useSelector((state) => state.user);

  let close = () => {
    dispatch(clearFailedSizeChecks());
    handleClose();
  };

  // https://v4.mui.com/components/dialogs/#optional-sizes
  let dialogWidth = 'md';

  if (!dialogOpen) {
    return '';
  } else {
    return (
      <Dialog
        fullScreen={false}
        className={classes.muiDialog}
        PaperProps={{
          className: classes.dialogPaper,
        }}
        open={dialogOpen}
        onClose={close}
        fullWidth={true}
        maxWidth={dialogWidth}
      >
        {!!user && !!dataset ? (
          <DialogContent {...props} />
        ) : !user ? (
          <EmbeddedLogin />
        ) : user && !dataset ? (
          <Spacer>
            <Spinner message="Loading Dataset" />
          </Spacer>
        ) : (
          ''
        )}
      </Dialog>
    );
  }
};

export default withStyles(styles)(DialogWrapper);
