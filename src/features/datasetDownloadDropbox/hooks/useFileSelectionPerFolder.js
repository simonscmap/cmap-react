import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectFolderAllCachedFiles } from '../state/selectors';
import { estimateDownloadTimeInSeconds, checkCombinedLimits } from '../utils/fileUtils';
import { MAX_FILES_LIMIT, MAX_SIZE_LIMIT_BYTES } from '../constants/defaults';

export const useFileSelectionPerFolder = (allFiles, currentFolder) => {
  // Track selections per folder
  const [selectionsByFolder, setSelectionsByFolder] = useState({});

  // Get all cached files for current folder (for select all functionality)
  const allCachedFiles = useSelector((state) => selectFolderAllCachedFiles(state, currentFolder));

  // Get current folder's selections
  const selectedFiles = useMemo(() => {
    return selectionsByFolder[currentFolder] || [];
  }, [selectionsByFolder, currentFolder]);

  // Calculate total size for current folder's selections
  const totalSize = useMemo(() => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  }, [selectedFiles]);

  // Calculate estimated download time for current folder's selections
  const estimatedTimeSeconds = useMemo(() => {
    return estimateDownloadTimeInSeconds(selectedFiles.length);
  }, [selectedFiles.length]);

  // Clear selections when files change (e.g., on pagination)
  useEffect(() => {
    // This effect will only clear if the files array changes
    // but not when just switching tabs
  }, [allFiles]);

  const handleToggleFile = (file) => {
    setSelectionsByFolder(prev => {
      const currentSelections = prev[currentFolder] || [];
      const fileIndex = currentSelections.findIndex((f) => f.path === file.path);
      
      let newSelections;
      if (fileIndex === -1) {
        // Check if adding this file would exceed either file count or size limits for current tab only
        const currentTabFileCount = currentSelections.length;
        const currentTabTotalSize = currentSelections.reduce((total, f) => total + f.size, 0);
        
        const combinedCheck = checkCombinedLimits(
          currentTabFileCount,
          currentTabTotalSize,
          file,
          MAX_FILES_LIMIT,
          MAX_SIZE_LIMIT_BYTES
        );
        
        if (!combinedCheck.canAdd) {
          // Don't add the file if we're at either limit for this tab
          return prev;
        }
        
        newSelections = [...currentSelections, file];
      } else {
        newSelections = currentSelections.filter((_, index) => index !== fileIndex);
      }
      
      return {
        ...prev,
        [currentFolder]: newSelections
      };
    });
  };

  const handleSelectAll = (event) => {
    setSelectionsByFolder(prev => {
      const currentSelections = prev[currentFolder] || [];
      
      // Handle both event objects and direct calls
      const shouldSelect = event && event.target ? event.target.checked : !areAllSelected;
      
      if (shouldSelect) {
        // Calculate current tab selections and size (current folder only)
        const currentTabFileCount = currentSelections.length;
        const currentTabTotalSize = currentSelections.reduce((total, f) => total + f.size, 0);
        
        // ADD current page files that aren't already selected, but respect both limits for this tab only
        const filesToAdd = allFiles.filter(file => 
          !currentSelections.some(selected => selected.path === file.path)
        );
        
        // Add files one by one, checking both limits for current tab only
        const filesToAddLimited = [];
        let runningFileCount = currentTabFileCount;
        let runningSize = currentTabTotalSize;
        
        for (const file of filesToAdd) {
          const combinedCheck = checkCombinedLimits(
            runningFileCount,
            runningSize,
            file,
            MAX_FILES_LIMIT,
            MAX_SIZE_LIMIT_BYTES
          );
          
          if (combinedCheck.canAdd) {
            filesToAddLimited.push(file);
            runningFileCount++;
            runningSize += file.size;
          } else {
            break; // Stop when we hit either limit for this tab
          }
        }
        
        return {
          ...prev,
          [currentFolder]: [...currentSelections, ...filesToAddLimited]
        };
      } else {
        // REMOVE current page files from selections
        const filesToKeep = currentSelections.filter(selected =>
          !allFiles.some(file => file.path === selected.path)
        );
        return {
          ...prev,
          [currentFolder]: filesToKeep
        };
      }
    });
  };

  const clearSelections = () => {
    setSelectionsByFolder(prev => ({
      ...prev,
      [currentFolder]: []
    }));
  };

  const clearAllSelections = () => {
    setSelectionsByFolder({});
  };

  // NEW: Select all files in the entire folder (not just current page)
  const handleSelectAllInFolder = () => {
    setSelectionsByFolder(prev => {
      const currentSelections = prev[currentFolder] || [];
      
      // Calculate current tab selections and size (current folder only)
      const currentTabFileCount = currentSelections.length;
      const currentTabTotalSize = currentSelections.reduce((total, f) => total + f.size, 0);
      
      // Add all cached files that aren't already selected, but respect both limits for this tab only
      const filesToAdd = allCachedFiles.filter(file => 
        !currentSelections.some(selected => selected.path === file.path)
      );
      
      // Add files one by one, checking both limits for current tab only
      const filesToAddLimited = [];
      let runningFileCount = currentTabFileCount;
      let runningSize = currentTabTotalSize;
      
      for (const file of filesToAdd) {
        const combinedCheck = checkCombinedLimits(
          runningFileCount,
          runningSize,
          file,
          MAX_FILES_LIMIT,
          MAX_SIZE_LIMIT_BYTES
        );
        
        if (combinedCheck.canAdd) {
          filesToAddLimited.push(file);
          runningFileCount++;
          runningSize += file.size;
        } else {
          break; // Stop when we hit either limit for this tab
        }
      }
      
      return {
        ...prev,
        [currentFolder]: [...currentSelections, ...filesToAddLimited]
      };
    });
  };

  // NEW: Clear selections only for current page
  const handleClearPageSelections = () => {
    setSelectionsByFolder(prev => {
      const currentSelections = prev[currentFolder] || [];
      
      // Remove only current page files from selections
      const filesToKeep = currentSelections.filter(selected =>
        !allFiles.some(file => file.path === selected.path)
      );
      
      return {
        ...prev,
        [currentFolder]: filesToKeep
      };
    });
  };

  const areAllSelected =
    allFiles.length > 0 && 
    allFiles.every(file => selectedFiles.some(selected => selected.path === file.path));

  const areIndeterminate = 
    allFiles.length > 0 && 
    allFiles.some(file => selectedFiles.some(selected => selected.path === file.path)) &&
    !areAllSelected;

  // Get current tab file count (current folder only)
  const currentTabFileCount = useMemo(() => {
    return selectedFiles.length;
  }, [selectedFiles.length]);

  // Get current tab total size (already calculated as totalSize)
  const currentTabTotalSize = totalSize;

  // File limit checking (current tab only)
  const isCurrentTabFileLimitReached = useMemo(() => {
    return currentTabFileCount >= MAX_FILES_LIMIT;
  }, [currentTabFileCount]);

  // Size limit checking (current tab only)
  const isCurrentTabSizeLimitReached = useMemo(() => {
    return currentTabTotalSize >= MAX_SIZE_LIMIT_BYTES;
  }, [currentTabTotalSize]);

  const canSelectFile = (file) => {
    // Can select if file is already selected (for deselection)
    const isAlreadySelected = selectedFiles.some(selected => selected.path === file.path);
    if (isAlreadySelected) {
      return true;
    }
    
    // Check both file count and size limits for current tab only
    const combinedCheck = checkCombinedLimits(
      currentTabFileCount,
      currentTabTotalSize,
      file,
      MAX_FILES_LIMIT,
      MAX_SIZE_LIMIT_BYTES
    );
    
    return combinedCheck.canAdd;
  };

  return {
    selectedFiles,
    totalSize,
    estimatedTimeSeconds,
    handleToggleFile,
    handleSelectAll,
    handleSelectAllInFolder,
    handleClearPageSelections,
    clearSelections,
    clearAllSelections,
    areAllSelected,
    areIndeterminate,
    selectionsByFolder,
    currentTabFileCount,
    currentTabTotalSize,
    isCurrentTabFileLimitReached,
    isCurrentTabSizeLimitReached,
    canSelectFile,
  };
};