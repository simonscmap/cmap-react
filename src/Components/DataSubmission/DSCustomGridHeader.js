// Custom grid header to add tooltip from data submission guide to data sub ag-grid columns

import React from 'react';

import { withStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';

import dsGuideItems from './Helpers/dsGuideItems';

const sheetToReference = {
  data: 'dataItems',
  dataset_meta_data: 'datasetMetadataItems',
  vars_meta_data: 'variableMetadataItems',
};

const getGuideItem = (sheet, columnId) =>
      dsGuideItems[sheetToReference[sheet]]
      .find(({ label }) => label === columnId);

const styles = (theme) => ({
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  icon: {
    margin: '10px',
    fontSize: '18px',
  }
});


class DSCustomGridHeader extends React.Component {

  constructor(props) {
    super (props);
    // const { value, api } = props;
  }

  render() {
    const { context, column, displayName, classes } = this.props;
    const { sheet } = context;

    const item = getGuideItem (sheet, column.colId);

    if (!item) {
      return <div className={classes.header}>{`${displayName}`}</div>;
    }

    return (
      <div className={classes.header}>
        <span>{displayName}</span>
        <Tooltip
          placement="top"
          title={
            <React.Fragment>
              {item.plainText.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
              <ul>
                {item.bullets.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </React.Fragment>
          }
        >
          <Help className={classes.icon} />
        </Tooltip>
      </div>
    );
  }
}

export default withStyles(styles)(DSCustomGridHeader);
