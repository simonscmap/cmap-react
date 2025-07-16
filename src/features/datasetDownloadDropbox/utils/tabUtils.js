export const shouldShowTabs = (availableFolders, mainFolder) => {
  // Show tabs if we have both main folder (REP/NRT) AND RAW
  const hasMainFolder = availableFolders.hasRep || availableFolders.hasNrt;
  return hasMainFolder && availableFolders.hasRaw && mainFolder !== 'raw';
};

export const getTabConfiguration = (availableFolders, mainFolder) => {
  if (!shouldShowTabs(availableFolders, mainFolder)) {
    // Single tab case
    return {
      showTabs: false,
      mainTabLabel: 'Main Files',
      tabs: [{ key: mainFolder, label: 'Main Files' }]
    };
  }
  
  // Two tab case: Main + RAW
  return {
    showTabs: true,
    mainTabLabel: 'Main Files',
    tabs: [
      { key: mainFolder, label: 'Main Files' },
      { key: 'raw', label: 'Raw Files' }
    ]
  };
};

export const getMainTabLabel = (folderType) => {
  switch(folderType) {
    case 'rep': return 'REP';
    case 'nrt': return 'NRT'; 
    case 'raw': return 'RAW';
    default: return 'Files';
  }
};