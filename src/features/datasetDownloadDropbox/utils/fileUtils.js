export const formatBytes = (bytes) => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

export const estimateDownloadTimeInSeconds = (fileCount) => {
  if (fileCount <= 25) {
    return 10;
  } else if (fileCount <= 100) {
    return fileCount * 0.4;
  } else {
    return fileCount * 0.3;
  }
};

export const formatEstimatedTime = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }
};
