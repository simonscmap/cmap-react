export const formatBytes = (bytes) => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

export const estimateDownloadTimeInSeconds = (fileCount) => {
  if (fileCount <= 50) {
    return fileCount * 0.600;
  } else if (fileCount <= 300) {
    return fileCount * 0.163;
  } else {
    return fileCount * 0.264;
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