// Custom grid header to add tooltip from data submission guide to data sub ag-grid columns

import React from 'react';

import { withStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';

import dsGuideItems from '../../Utility/DataSubmission/dsGuideItems';

const sheetToReference = {
  data: 'dataItems',
  dataset_meta_data: 'datasetMetadataItems',
  vars_meta_data: 'variableMetadataItems',
};

const styles = (theme) => ({});

const DSCustomGridHeader = (props) => {
  let item = dsGuideItems[sheetToReference[props.context.sheet]].find(
    (e) => e.label === props.column.colId,
  );
  if (!item) {
    return `${props.displayName}`;
  }
  console.log('item', item);
  return (
    <>
      {props.displayName}
      <Tooltip
        placement="top"
        title={
          <>
            {item.plainText.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
            <ul>
              {item.bullets.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </>
        }
      >
        <Help
          style={{ position: 'relative', top: 5, left: 5, fontSize: '17px' }}
        />
      </Tooltip>
    </>
  );
};

export default withStyles(styles)(DSCustomGridHeader);
