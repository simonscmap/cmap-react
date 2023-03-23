import React from 'react';
import {  withStyles } from '@material-ui/core';
import { toolPanelStyles } from './gridStyles';
import { zip, isStringURL } from './datagridHelpers';
// import copyTextToClipboard from '../../../Utility/Clipboard/copyTextToClipboard';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';

export const RenderString = ({ str, k }) => {
  let isURL = isStringURL (str);
  if (isURL) {
    return <a href={str} target="_blank" rel="noreferrer">{str}</a>;
  } else if (k) {
    return <code>{str}:&nbsp;</code>; // render this as the key of an object
  } else {
    return <span>{str}</span>;
  }
}

export const RenderObject = withStyles(toolPanelStyles)(({ classes, obj, indent }) => {
  return Object.entries(obj).map(([k, v], i) => {
    // TODO detect nested object/array values
    // need to handle them here in such a way that they indet properly
    let isLeaf = (typeof v === 'object') ? false : true;

    if (isLeaf) {
      return (
        <div className={classes.objKVWrapper} key={`kv-leaf-${i}`}>
          <RenderString str={k} k={true} />
          <RenderValue val={v} indent={indent + 1} />
        </div>
      );
    } else {
      return (
        <div>
          <div className={classes.objKVWrapper} key={`kv-string-${i}`}>
            <RenderString str={k} k={true} />
          </div>
          <div className={classes.objKVNodeWrapper} style={{ paddingLeft: '2em' }} key={`kv-node-${i}`}>
            <RenderValue val={v} />
          </div>
        </div>
      );
    }
  });
});

const RenderValue = ({ val }) => {
  let valT = typeof val;
  switch (valT) {
    case 'object':
      return <RenderObject obj={val} /> ;
    case 'string':
      return <RenderString str={val} />;
    case 'number':
      return <code>{'' + val}</code>;
    case 'boolean':
      return <span>{val}</span>;
    default:
      return 'unknown';
  }
};

export const UMView = withStyles(toolPanelStyles)(({ classes, data }) => {
  // if the user clicks on a blob, copy it to clipboard
  let handleDispatch = (blob) => {
    let txt = JSON.stringify(blob);
    dispatchCustomWindowEvent("copyToClipboard", txt);
    console.log(txt);
  }

  if (!data) {
    return 'No data';
  }

  return (
    <div className={classes.vumContainer}>
      {data.map((vumBlob, blobIdx) => {
        let keys = Object.keys(vumBlob);
        if (keys.length === 0) {
          return '';
        }
        return (
          <div className={classes.vumBlob} onClick={() => handleDispatch(vumBlob)} key={`vumBlob-${blobIdx}`}>
            {keys.map((key, keyIdx) => {
              let { values, descriptions } = vumBlob[key];
              let zipped = zip(values, descriptions);
              return (
                <div className={classes.blob} key={`blob-${key}`}>
                  <div className={classes.blobKeyHeading}><span>metadata key: </span><code>{key}</code></div>
                   {zipped.map(([value, description], idx) => {

                    return (
                      <div className={classes.blobValuesContainer} key={`blob-${key}(${keyIdx})-blob${idx}`}>
                        <div className={classes.blobKeyV}><RenderValue val={value} /></div>
                        <div className={classes.blobDesc}>{description}</div>
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
