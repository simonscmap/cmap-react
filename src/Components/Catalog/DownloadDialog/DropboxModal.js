import Dialog from '@material-ui/core/Dialog';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import {
  DialogActions,
  DialogTitle,
  Button,
} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

import DropboxEmbed from './DropboxEmbed';
import { homeTheme } from '../../Home/theme';
import { SpinnerWrapper } from '../../UI/Spinner';
import { dropboxModalCleanup } from '../../../Redux/actions/catalog';
import z from '../../../enums/zIndex';
import { safePath } from '../../../Utility/objectUtils';

const useStyles = makeStyles((theme) => ({
  dialogRoot: {
    zIndex: `${z.LOGIN_DIALOG + 2} !important`,
  },
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'end',
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
    padding: '1em 1em 1em 0',
    marginLeft: '-13px',
    textTransform: 'none',
    color: 'white',
    fontSize: '1em',
  },
  fullHeight: {
    height: '100%',
  },
  closeButton: {
    color: theme.palette.primary.main,
  },
  table: {
    width: 'auto',
    tableLayout: 'auto',
  },
  tc: {
    color: 'white',
    borderBottom: 'none',
  }
}));


const DropboxModal = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const dropboxModalOpen = useSelector((state) => state.download.dropboxModalOpen);
  const vaultLink = useSelector ((state) => state.download.vaultLink);
  const handleClose = () => dispatch (dropboxModalCleanup());

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
        open={dropboxModalOpen !== 'closed'}
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
             <TableContainer>
               <Table className={classes.table} size="small" aria-label="raw files metadata table">
                 <TableBody className={classes.tableBody}>
                   <TableRow>
                     <TableCell className={classes.tc}>Dataset Name</TableCell>
                     <TableCell className={classes.tc}>{shortName}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell className={classes.tc}>Data Type</TableCell>
                     <TableCell className={classes.tc}>{fileType}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell className={classes.tc}>Number of Files</TableCell>
                     <TableCell className={classes.tc}>{fileCount}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell className={classes.tc}>Total Size</TableCell>
                     <TableCell className={classes.tc}>{totalSize}</TableCell>
                   </TableRow>
                 </TableBody>
               </Table>
             </TableContainer>
           </div>}
        </DialogTitle>
        { !vaultLink && <div className={classes.fullHeight}><SpinnerWrapper /></div>}
        <DropboxEmbed />
        <DialogActions>
          <Button onClick={handleClose} className={classes.closeButton}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default DropboxModal;
