import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectFolderAllCachedFiles } from '../state/selectors';

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
      
      if (event.target.checked) {
        // ADD current page files that aren't already selected
        const filesToAdd = allFiles.filter(file => 
          !currentSelections.some(selected => selected.path === file.path)
        );
        return {
          ...prev,
          [currentFolder]: [...currentSelections, ...filesToAdd]
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
      
      // Add all cached files that aren't already selected
      const filesToAdd = allCachedFiles.filter(file => 
        !currentSelections.some(selected => selected.path === file.path)
      );
      
      return {
        ...prev,
        [currentFolder]: [...currentSelections, ...filesToAdd]
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

  // Get total selections across all folders
  const totalSelectionsAllFolders = useMemo(() => {
    return Object.values(selectionsByFolder).reduce((total, folderSelections) => 
      total + folderSelections.length, 0
    );
  }, [selectionsByFolder]);

  // Get all selected files from all folders
  const allSelectedFiles = useMemo(() => {
    return Object.values(selectionsByFolder).flat();
  }, [selectionsByFolder]);

  return {
    selectedFiles,
    totalSize,
    handleToggleFile,
    handleSelectAll,
    handleSelectAllInFolder,
    handleClearPageSelections,
    clearSelections,
    clearAllSelections,
    areAllSelected,
    areIndeterminate,
    selectionsByFolder,
    totalSelectionsAllFolders,
    allSelectedFiles,
  };
};