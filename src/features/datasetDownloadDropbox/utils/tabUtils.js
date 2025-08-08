export const shouldShowTabs = (availableFolders) => {
  // Show tabs if we have both main folder (REP/NRT) AND RAW
  const hasMainFolder = availableFolders.hasRep || availableFolders.hasNrt;
  return hasMainFolder && availableFolders.hasRaw;
};

export const getTabConfiguration = (availableFolders) => {
  const hasMainFolder = availableFolders.hasRep || availableFolders.hasNrt;
  const hasRawFolder = availableFolders.hasRaw;

  if (!shouldShowTabs(availableFolders)) {
    // Single tab case - either only main folder or only raw folder
    if (hasRawFolder && !hasMainFolder) {
      // Only raw folder exists
      return {
        showTabs: false,
        mainTabLabel: 'Raw Files',
        tabs: [{ key: 'raw', label: 'Raw Files' }],
      };
    } else {
      // Only main folder exists (rep/nrt)
      return {
        showTabs: false,
        mainTabLabel: 'Main Files',
        tabs: [{ key: 'main', label: 'Main Files' }],
      };
    }
  }

  // Two tab case: Main + RAW (both exist)
  return {
    showTabs: true,
    mainTabLabel: 'Main Files',
    tabs: [
      { key: 'main', label: 'Main Files' },
      { key: 'raw', label: 'Raw Files' },
    ],
  };
};

export const getMainTabLabel = (folderType) => {
  switch (folderType) {
    case 'rep':
      return 'REP';
    case 'nrt':
      return 'NRT';
    case 'raw':
      return 'RAW';
    default:
      return 'Files';
  }
};
