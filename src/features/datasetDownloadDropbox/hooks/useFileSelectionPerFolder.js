import { useState, useMemo, useEffect } from 'react';

export const useFileSelectionPerFolder = (allFiles, currentFolder) => {
  // Track selections per folder
  const [selectionsByFolder, setSelectionsByFolder] = useState({});

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
    setSelectionsByFolder(prev => ({
      ...prev,
      [currentFolder]: event.target.checked ? allFiles : []
    }));
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

  const areAllSelected =
    allFiles.length > 0 && selectedFiles.length === allFiles.length;

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
    clearSelections,
    clearAllSelections,
    areAllSelected,
    selectionsByFolder,
    totalSelectionsAllFolders,
    allSelectedFiles,
  };
};