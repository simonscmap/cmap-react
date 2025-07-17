import React from 'react';

const TabPanel = ({ children, value, index }) => {
  if (value !== index) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`file-tabpanel-${index}`}
      aria-labelledby={`file-tab-${index}`}
    >
      {children}
    </div>
  );
};

export default TabPanel;