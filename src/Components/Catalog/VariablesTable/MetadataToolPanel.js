import React, { useState, useEffect  } from 'react';
import {  withStyles } from '@material-ui/core';
import { toolPanelStyles } from './gridStyles';
import { processVUM, zip, isStringURL } from './datagridHelpers';

const RenderValue = ({ val }) => {
  let isURL = isStringURL (val);
  if (isURL) {
    return <a href={val} target="_blank" rel="noreferrer">{val}</a>;
  } else {
    return <span>{val}</span>;
  }
};

const UMView = withStyles(toolPanelStyles)(({ classes, data }) => {
  return (
    <div className={classes.vumContainer}>
      {data.map((vumBlob, blobIdx) => {
        let keys = Object.keys(vumBlob);
        if (keys.length === 0) {
          return '';
        }
        return (
          <div className={classes.vumBlob} key={`vumBlob-${blobIdx}`}>
            {keys.map((key) => {
              let { values, descriptions } = vumBlob[key];
              console.log(`vum blob`, vumBlob, key, values, descriptions);
              let zipped = zip(values, descriptions);
              return (
                <div className={classes.blob} key={`blob-${key}`}>
                  <code>{key}</code>
                  {zipped.map(([value, description], idx) => {
                    return (
                      <div className={classes.blobValuesContainer} key={`blob-${key}-${idx}`}>
                        <div className={classes.blobKeyV}><RenderValue val={value} /></div>
                        <div className={classes.blobKeyV}>{description}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>);
});

const SidebarMetadataToolPanel = withStyles(toolPanelStyles)((props) => {
  let { classes } = props;
  let [ eventPayload, setData ] = useState(null);

  let handleFocus = (e) => {
    let { detail } = e;
    // console.log('handle focus', e.detail);g
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

  if (!eventPayload) {
    return '';
  }

  let renderUM = eventPayload.dataType === 'unstructured-metadata';
  let renderComment = eventPayload.dataType === 'comment';
  let h2 = renderUM ? 'Unstructured Metadata'
         : renderComment ? 'Comment' : '';

  return (
    <div className={classes.toolPanelContainer}>
      <h1>Sidebar Metadata Tool Panel</h1>
      <h2>{h2}</h2>
      {renderUM && <UMView data={processVUM(eventPayload.data)} />}
      {renderComment && <div>{eventPayload.data}</div>}
    </div>
  );
});

export default SidebarMetadataToolPanel;
