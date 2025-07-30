import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  selectAutoDownloadEligible,
  selectDirectDownloadLink,
  selectIsVaultFilesLoaded
} from '../state/selectors';

/**
 * Hook for handling auto-download logic
 * Determines whether to trigger direct download or open file selection modal
 * 
 * @returns {Object} Auto-download utilities
 */
const useAutoDownload = () => {
  const autoDownloadEligible = useSelector(selectAutoDownloadEligible);
  const directDownloadLink = useSelector(selectDirectDownloadLink);
  const isVaultFilesLoaded = useSelector(selectIsVaultFilesLoaded);
  
  /**
   * Handles smart download logic
   * - If auto-download eligible and has direct link: triggers direct download
   * - Otherwise: returns 'openModal' to indicate modal should be opened
   */
  const handleSmartDownload = useCallback(() => {
    if (autoDownloadEligible && directDownloadLink) {
      // Trigger direct download by navigating to the download link
      window.location.href = directDownloadLink;
      return 'autoDownload';
    } else {
      // Open file selection modal
      return 'openModal';
    }
  }, [autoDownloadEligible, directDownloadLink]);
  
  return {
    handleSmartDownload,
    canAutoDownload: autoDownloadEligible && directDownloadLink,
    isReady: isVaultFilesLoaded,
    autoDownloadEligible,
    directDownloadLink
  };
};

export default useAutoDownload;