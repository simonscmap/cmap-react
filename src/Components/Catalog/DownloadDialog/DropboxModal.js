import Dialog from '@material-ui/core/Dialog';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import {
  DialogActions,
  DialogTitle,
  Button,
} from '@material-ui/core';

import DropboxEmbed from './DropboxEmbed';
import { homeTheme } from '../../Home/theme';
import { Spinner } from '../../UI/Spinner';
import { setDropboxModalOpen } from '../../../Redux/actions/catalog';
import z from '../../../enums/zIndex';
import { safePath } from '../../../Utility/objectUtils';

const useStyles = makeStyles((theme) => ({
  dialogRoot: {
    zIndex: `${z.LOGIN_DIALOG + 2} !important`,
  },
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cmapMark: {
    zIndex: 100,
    width: '44px',
    height: '44px',
    backgroundImage: "url('/images/home/cmap-logo-mark.svg')",
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  metadataContainer: {
    '& p': {
      textTransform: 'none',
      color: 'white',
    }
  },
  fullHeight: {
    height: '100%',
  },
}));


const DropboxModal = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const dropboxModalOpen = useSelector((state) => state.download.dropboxModalOpen);
  const vaultLink = useSelector ((state) => state.download.vaultLink);
  const handleClose = () => dispatch (setDropboxModalOpen(false));

  const shortName = safePath (['shortName']) (vaultLink);
  const folderName = safePath (['folderName']) (vaultLink);
  const totalSize = safePath (['metadata', 'totalSize']) (vaultLink);
  const fileCount = safePath (['metadata', 'fileCount']) (vaultLink);

  let fileType = '';
  switch (folderName) {
  case 'rep':
    fileType = 'reprocessed';
    break;
  case 'raw':
    fileType = 'raw';
    break;
  case 'nrt':
    fileType = 'near real time';
    break;
  default:
    fileType = 'unknown';
  }

  return (
    <ThemeProvider theme={homeTheme}>
      <Dialog
        fullScreen
        open={dropboxModalOpen}
        aria-labelledby="dropbox-dialog-title"
        classes={{
          root: classes.dialogRoot,
        }}
      >
        <DialogTitle>
          <div className={classes.titleBar}>
            <div className={classes.cmapMark}></div>
            <span>
              Download with Dropbox
            </span>
          </div>
          {vaultLink &&
           <div className={classes.metadataContainer}>
             <p>Download {fileCount} {fileType} file(s) for {shortName}, totaling {totalSize}.</p>
           </div>}
        </DialogTitle>
        { !vaultLink && <div className={classes.fullHeight}><Spinner /></div>}
        <DropboxEmbed />
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default DropboxModal;
