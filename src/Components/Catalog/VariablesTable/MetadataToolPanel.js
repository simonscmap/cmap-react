import React, { useState, useEffect } from 'react';
import { Close } from '@material-ui/icons';
import { toolPanelStyles } from './gridStyles';
import copyTextToClipboard from '../../../Utility/Clipboard/copyTextToClipboard';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';
import { zip, isStringURL } from './datagridHelpers';

export const RenderString = ({ str, k }) => {
  let isURL = isStringURL(str);
  if (isURL) {
    return (
      <a href={str} target="_blank" rel="noreferrer">
        {str}
      </a>
    );
  } else if (k) {
    return <code>{str}:&nbsp;</code>; // render this as the key of an object
  } else {
    return <span>{str}</span>;
  }
};

export const RenderObject = ({ obj, indent }) => {
  const classes = toolPanelStyles();

  return Object.entries(obj).map(([k, v], i) => {
    // TODO detect nested object/array values
    // need to handle them here in such a way that they indet properly
    let isLeaf = typeof v === 'object' ? false : true;

    if (isLeaf) {
      return (
        <div style={classes.objKVWrapper} key={`k(${k})-leaf-${i}`}>
          <RenderString str={k} k={true} />
          <RenderValue val={v} indent={indent + 1} />
        </div>
      );
    } else {
      return (
        <div key={`k${k}-node-${i}`}>
          <div style={classes.objKVWrapper}>
            <RenderString str={k} k={true} />
          </div>
          <div style={{ ...classes.objKVNodeWrapper, paddingLeft: '2em' }}>
            <RenderValue val={v} />
          </div>
        </div>
      );
    }
  });
};

const RenderValue = ({ val }) => {
  let valT = typeof val;
  switch (valT) {
    case 'object':
      return <RenderObject obj={val} />;
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

export const BlobRender = ({ blob }) => {
  const classes = toolPanelStyles();

  if (!blob || typeof blob !== 'object') {
    console.log('did not receive blob, or correct type of blob', blob);
    return '';
  }
  let keys = Object.keys(blob);

  return (
    <div style={classes.blobContainer}>
      {keys.map((key, keyIdx) => {
        // for each metadata "key" of the UM for this variable, spit out its description/value pairs
        let { values, descriptions } = blob[key];
        let zipped = zip(values, descriptions);
        return (
          <div
            style={classes.blobKeyContainer}
            key={`blobKey-${key}(${keyIdx})`}
          >
            <div style={classes.keyLabel}>
              <span>Additional Metadata for key: </span>
              <code>{key}</code>
            </div>
            <div style={classes.headers}>
              <div>Description</div>
              <div>Value</div>
            </div>
            {zipped.map(([value, description], idx) => {
              return (
                <div style={classes.valuePair} key={`value${idx}`}>
                  <div style={classes.description}>{description}</div>
                  <div style={classes.value}>
                    <RenderValue val={value} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const VariableRowRender = React.memo(function BlobRenderFC({
  um,
  longName,
  handleVariableLink,
}) {
  const classes = toolPanelStyles();
  let handler = handleVariableLink || (() => {});
  let blobs = um;

  if (!blobs) {
    return '';
  }

  return (
    <div style={classes.vumListRow}>
      <div style={classes.variableName}>
        <div>
          <a onClick={() => handler(longName)}>{longName || 'no name'}</a>
        </div>
        <div>
          <div style={classes.longNameChip}>Variable</div>
        </div>
      </div>
      {Array.isArray(blobs) &&
        blobs.map((blob, blobIndex) => {
          return <BlobRender blob={blob} key={blobIndex} />;
        })}
    </div>
  );
});

export const ListRender = ({ rows, handleVariableLink }) => {
  const classes = toolPanelStyles();

  if (!rows) {
    return '';
  }

  return (
    <div style={classes.vumListContainer}>
      <div style={classes.allCommentsLabel}>
        Metadata <span>({rows.length} matching variables with metadata)</span>
      </div>
      {rows.map((r, i) => {
        let um = r.Unstructured_Variable_Metadata;
        // for each row, spit out a portion of the table with UM
        return (
          <VariableRowRender
            um={um}
            longName={r.Long_Name}
            handleVariableLink={handleVariableLink}
            key={`blob-${i}`}
          />
        );
      })}
    </div>
  );
};

const VUMList = ({ shouldDisplay }) => {
  let [isLoaded, setIsLoaded] = useState(false);
  let [rows, setRows] = useState([]);

  let handleModel = (e) => {
    let { detail: currentRows } = e;
    if (currentRows) {
      setRows([...currentRows]);
      setIsLoaded(true);
    }
  };

  // listen for updates to current table model
  // handle initial state loading
  // --> if the parent component dispatches initial model before this component registers a listener,
  //     then this component will not get its initial data
  useEffect(() => {
    window.addEventListener('variablesTableModel', handleModel, false);
    if (rows.length < 1 && !isLoaded) {
      // ask for a new dispatch of the table model
      // console.log('metadata tool panel asking for updated model');
      dispatchCustomWindowEvent('clearFocusEvent', null);
    }
    return () => {
      window.removeEventListener('variablesTableModel', handleModel, false);
    };
  }, []);

  let rowsWithUM = rows.filter(
    (row) => row && row.Unstructured_Variable_Metadata,
  );

  // set the focus of the table to the row of the varibale that was clicked
  let handleVariableLink = (longName) => {
    dispatchCustomWindowEvent('askForFocus', { longName });
  };

  if (!shouldDisplay) {
    return '';
  }

  return (
    <ListRender rows={rowsWithUM} handleVariableLink={handleVariableLink} />
  );
};

const SidebarMetadataToolPanel = (props) => {
  const classes = toolPanelStyles();
  let [eventPayload, setData] = useState(null);
  let [isFocusView, setIsFocusView] = useState(false);

  let handleFocus = (e) => {
    let { detail } = e;
    if (detail) {
      // console.log('setFocusEvent detail', detail);
      setData(detail);
      setIsFocusView(true);
    }
  };

  let handleCopy = (e) => {
    let { detail } = e;
    if (detail) {
      copyTextToClipboard(detail);
    }
  };

  // when another tool panel clears focus, it should shift this tool panel
  // into a list view as well
  const handleClearFocus = () => {
    // console.log('metadata tool panel clear focus');
    setIsFocusView(false);
  };

  // listen for event containing current panel content
  useEffect(() => {
    window.addEventListener('setFocusEvent', handleFocus, false);
    window.addEventListener('copyToClipboard', handleCopy, false);
    window.addEventListener('clearFocusEvent', handleClearFocus, false);
    return () => {
      window.removeEventListener('setFocusEvent', handleFocus);
      window.removeEventListener('copyToClipboard', handleCopy);
      window.removeEventListener('clearFocusEvent', handleClearFocus);
    };
  }, []);

  let handleDeselect = () => {
    dispatchCustomWindowEvent('clearFocusEvent', {});
    setIsFocusView(false);
  };

  let handleExit = () => {
    dispatchCustomWindowEvent('exitToolBar', {});
  };

  return (
    <div style={classes.toolPanelContainer}>
      <div onClick={handleExit} style={classes.toolBarClose}>
        <Close />
      </div>
      <div style={classes.title}>Additional Metadata</div>
      {isFocusView && eventPayload && (
        <div>
          <div style={classes.variableFocusLabelContainer}>
            <div style={classes.variableLabel}>{/* removed */}</div>
            <div onClick={handleDeselect} style={classes.closeBox}>
              <span>Deselect Variable</span>
              <Close />
            </div>
          </div>
          <VariableRowRender
            um={eventPayload.unstructuredMetadata}
            longName={eventPayload.longName}
          />
        </div>
      )}
      <VUMList shouldDisplay={!isFocusView} />
    </div>
  );
};

export default SidebarMetadataToolPanel;
