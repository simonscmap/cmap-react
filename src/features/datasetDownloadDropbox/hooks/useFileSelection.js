import { useState, useMemo } from 'react';

export const useFileSelection = (allFiles) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const totalSize = useMemo(() => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  }, [selectedFiles]);

  const handleToggleFile = (file) => {
    const fileIndex = selectedFiles.findIndex((f) => f.path === file.path);
    if (fileIndex === -1) {
      setSelectedFiles([...selectedFiles, file]);
    } else {
      setSelectedFiles(selectedFiles.filter((_, index) => index !== fileIndex));
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedFiles(allFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  const clearSelections = () => {
    setSelectedFiles([]);
  };

  const areAllSelected =
    allFiles.length > 0 && selectedFiles.length === allFiles.length;

  return {
    selectedFiles,
    totalSize,
    handleToggleFile,
    handleSelectAll,
    clearSelections,
    areAllSelected,
  };
};