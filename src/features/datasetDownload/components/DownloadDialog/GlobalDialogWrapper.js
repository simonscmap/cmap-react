// Pop-up dialog for downloading data on catalog pages

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { Dialog } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import EmbeddedLogin from './EmbeddedLogin';
import DialogContent from './DialogContent';

import Spinner from '../../../../Components/UI/Spinner';
import Spacer from '../../../../Components/Common/Spacer';

import { downloadDialogClear } from '../../../../Redux/actions/ui';

import colors from '../../../../enums/colors';
import zIndex from '../../../../enums/zIndex';
import { safePath } from '../../../../Utility/objectUtils';
import states from '../../../../enums/asyncRequestStates';
import logInit from '../../../../Services/log-service';

const log = logInit('dialog').addContext({
  src: 'Components/Catalog/DownloadDialog',
});

// https://v4.mui.com/components/dialogs/#optional-sizes
const DIALOG_WIDTH = 'md';

const useStyles = makeStyles((theme) => ({
  downloadDialogPaper: {
    backgroundColor: colors.solidPaper,
  },
  muiDialog: {
    zIndex: `${zIndex.MUI_DIALOG} !important`,
  },
}));

const dataSelector = createSelector(
  [
    safePath(['downloadDialog', 'shortName']),
    safePath(['datasetDetailsPage', 'data']),
    safePath(['downloadDialog', 'data']),
  ],
  (shortName, detailPageData, fetchedData) => {
    if (!shortName) {
      return null;
    } else if (fetchedData && fetchedData.Short_Name === shortName) {
      return fetchedData;
    } else if (detailPageData && detailPageData.Short_Name === shortName) {
      return detailPageData;
    } else {
      return null;
    }
  },
);

const GlobalDialogWrapper = (props) => {
  const dispatch = useDispatch();
  const cl = useStyles();

  const globalDialog = useSelector((state) => state.downloadDialog);
  const { open } = globalDialog;
  const user = useSelector((state) => state.user);
  const data = useSelector(dataSelector);

  // OPEN/CLOSE
  const [openState, setOpenState] = useState(open);

  useEffect(() => {
    if (openState !== open) {
      if (open === false) {
        dispatch(downloadDialogClear());
      }
      setOpenState(open);
    }
  }, [open]);

  const close = () => {
    setOpenState(false);
    dispatch(downloadDialogClear());
  };

  const dialogProps = {
    dataset: data,
    handleClose: close,
    dialogOpen: openState,
  };

  if (!openState) {
    return <React.Fragment />;
  }

  if (openState) {
    return (
      <Dialog
        fullScreen={false}
        className={cl.muiDialog}
        PaperProps={{
          className: cl.downloadDialogPaper,
        }}
        open={openState}
        onClose={close}
        fullWidth={true}
        maxWidth={DIALOG_WIDTH}
      >
        {!!user && !!data ? (
          <DialogContent {...dialogProps} />
        ) : !user ? (
          <EmbeddedLogin />
        ) : user && !data ? (
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

export default GlobalDialogWrapper;
