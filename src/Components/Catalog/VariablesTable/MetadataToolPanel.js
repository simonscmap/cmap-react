import React, { useState, useEffect  } from 'react';
import {  withStyles } from '@material-ui/core';
import { toolPanelStyles } from './gridStyles';

const SidebarMetadataToolPanel = withStyles(toolPanelStyles)((props = {}) => {
  let [ eventPayload, setData ] = useState(null);

  let handleFocus = (e) => {
    let { detail } = e;
    // console.log('handle focus', e.detail);
    if (detail) {
      setData(detail);
    }
  }

  // listen for event containing current panel content
  useEffect(() => {
    window.addEventListener("metadataFocusEvent", handleFocus, false);
    return () => {
      window.removeEventListener('metadataFocusEvent', handleFocus);
    };
  }, []);

  let renderData = '';

  if (eventPayload && eventPayload.dataType === 'unstructured-metadata') {
    renderData = JSON.stringify(eventPayload.data);
  }
  if (eventPayload && eventPayload.dataType === 'comment') {
    renderData = eventPayload.data;
  }
  return (
    <div>
    <h1>Sidebar Metadata Tool Panel</h1>
    <h2>{eventPayload && eventPayload.colId}</h2>
      {renderData}
    </div>
  );
});

export default SidebarMetadataToolPanel;
