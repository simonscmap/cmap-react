import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  dropboxFilesDownloadClear,
  resetVaultFilesPagination,
} from '../state/actions';

export const useDropboxDownload = (
  dropboxDownloadState,
  handleClose,
  dataset,
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (dropboxDownloadState.success && dropboxDownloadState.downloadLink) {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = dropboxDownloadState.downloadLink;
      a.download = `${(dataset && dataset.Short_Name) || 'dataset'}_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      dispatch(dropboxFilesDownloadClear());
      handleClose(true, { isSuccess: true });
      dispatch(resetVaultFilesPagination());
    } else if (dropboxDownloadState.error) {
      handleClose(false, {
        isError: true,
        message: dropboxDownloadState.error,
      });
      dispatch(resetVaultFilesPagination());
    }
  }, [dropboxDownloadState, handleClose, dataset, dispatch]);
};
