import React, { useState } from 'react';
import { withStyles, TextField, InputAdornment } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import colors from '../../../enums/colors';
import { BlobRender } from '../VariablesTable/MetadataToolPanel';

const TABLE_BG_COLOR = '#184562';

const styles = () => ({
  root: {
    border: `2px solid ${colors.primary}`,
    borderRadius: '4px',
    background: 'rbga(0,0,0,0.4)',
    '& input': {
      width: '260px',
      border: 0, // `2px solid ${colors.blue.royal}`,
      outline: 0,
      '&$hover': {
        border: 0,
        outline: 0,
      },
    },
    '& fieldset': {
      border: 0,
      outline: 0,
    },
  },
  container: {
    background: TABLE_BG_COLOR,
    border: '1px solid black',
    padding: '1em',
    '& a': {
      color: colors.primary,
    },
    '&  a:visited': {
      color: colors.primary,
    },
    fontSize: '0.9em',
    maxHeight: '800px',
    overflowY: 'scroll',
  },
});

const DetailsTable = ({ metadata, classes }) => {
  let [searchTerm, setSearchTerm] = useState('');

  if (!metadata) {
    return '';
  }

  let blobs;

  try {
    blobs = JSON.parse(`${metadata}`);
  } catch (e) {
    console.log('unable to parse dataset metadata', metadata);

    return '';
  }

  let change = (e) => {
    setSearchTerm(e.target.value.trim());
  };

  // calculate which rows (a.k.a blobs) get rendered
  // this involves filtering at two levels
  let rows = blobs.map((blob) => {
    if (searchTerm.length === 0) {
      return blob;
    }

    let entries = Object.entries(blob);

    let filteredEntries = entries.map((entry) => {
      let [metadataKey, { values, descriptions }] = entry;
      // filter out value/description pairs that do not match the search term
      let filteredValues = values.reduce((acc, curr, idx) => {
        if (typeof curr === 'string') {
          if (curr.toLowerCase().includes(searchTerm.toLowerCase())) {
            acc.values.push(curr);
            acc.descriptions.push(descriptions[idx]);
            return acc;
          }
        }
        if (typeof curr === 'object') {
          if (JSON.stringify(curr).toLowerCase().includes(searchTerm.toLowerCase())) {
            acc.values.push(curr);
            acc.descriptions.push(descriptions[idx]);
            return acc;
          }
        }
        return acc;
      }, { values: [], descriptions: []});

      return [metadataKey, filteredValues];
    }).filter((entry) => {
      return entry && Array.isArray(entry) && entry[1].values.length > 0; // filter out entries that do not have any values
    });

    if (filteredEntries) {
      return Object.fromEntries(filteredEntries);
    }

    return null;

  }).filter((row) => row); // filter out blobs that were removed because no values matched


  return (
    <div className={classes.container}>
      <div>
        <TextField
          classes={{
            root: classes.root,
          }}
          name="datasetMetadata"
          placeholder="Search Additonal Metadata Values"
          variant="outlined"
          onChange={change}
          InputProps={{
            startAdornment: (
              <React.Fragment>
                <InputAdornment position="start">
                  <Search style={{ color: colors.primary }} />
                </InputAdornment>
              </React.Fragment>
            ),
          }}
        />
      </div>

    {
      rows.map((r, i) => {
        return <BlobRender blob={r} key={i} />
      })
    }
    </div>
  );
}

export default withStyles(styles)(DetailsTable);
