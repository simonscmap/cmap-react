import React, { useState } from 'react';
import { withStyles, TextField, InputAdornment } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import ReactJson from 'react-json-view';
import { zip, isStringURL } from './VariablesTable/datagridHelpers';
import colors from '../../enums/colors';

const TABLE_BG_COLOR = '#184562';

const styles = () => ({
  root: {
    border: `2px solid ${colors.primary}`,
    borderRadius: '4px',
    background: 'rbga(0,0,0,0.4)',
    '& input': {
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
  },
  blob: {
    marginTop: '1em',
    borderTop: `1px solid rgb(157, 209, 98, 0.3)`,
    padding: '1em',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.3)'
    },
    '& table td:first-child': {
      width: '500px',
      '@media (max-width:1280px)': {
        width: '200px',
      },
    },
    '& table td:nth-of-type(odd)': {
      paddingRight: `1em`,
    },
    '& table td:nth-of-type(even)': {
      paddingLeft: `1em`,
    },
    '& table td': {
      verticalAlign: 'top',
    },
    '& table thead td': {
      fontWeight: ' bold',
      color: 'rgba(255, 255, 255, 0.3)',
      textDecoration: 'underline',
      paddingBottom: '.5em',
    }
  },

  blobKeyHeading: {
    padding: '1em 0',
    fontSize: '1em',
    '& code': {
      color: colors.primary
    }
  },
  blobDesc: {
   // paddingLeft: '1em',
  },
});

const jsonViewTheme = {
  base00: "rgba(0,0,0,0)", // background
  base01: "#dedede",    // lighter bg (status bars, line numbers, folding marks)
  base02: "#dedede",    // selection bg
  base03: "#dedede",    // comments, invisibles, line highlighting
  base04: "#dedede",  // dark foreground
  base05: "#dedede", // default fg (caret, delimiters, operators)
  base06: "#dedede", // light fg
  base07: "#dedede", // light bg
  base08: "#dedede", // variables, XML tags, markup link text, markup lists, diff
  base09: "rgba(255, 255, 255, 1)", // integers, boolean, constants, xml attributes, markup link url
  base0A: "rgba(255, 255, 255, 1)", // Classes, Markup Bold, Search Text Background
  base0B: "rgba(255, 255, 255, 1)", // Strings, Inherited Class, Markup Code, Diff Inserted
  base0C: "rgba(255, 255, 255, 1)", // Support, Regular Expressions, Escape Characters, Markup Quotes
  base0D: "rgba(255, 255, 255, 1)", // Functions, Methods, Attribute IDs, Headings
  base0E: "rgba(255, 255, 255, 1)", // Keywords, Storage, Selector, Markup Italic, Diff Changed
  base0F: "rgba(255, 255, 255, 1)" // Deprecated, Opening/Closing Embedded Language Tags, e.g.
};

const RenderString = ({ str, k }) => {
  let isURL = isStringURL (str);
  if (isURL) {
    return <a href={str} target="_blank" rel="noreferrer">{str}</a>;
  } else if (k) {
    return <code>{str}:</code>; // render this as the key of an object
  } else {
    return <span>{str}</span>;
  }
}

const RenderObject = withStyles(() => ({
  udmWrapper: {
    padding: '1em',
  }
}))(({ obj, classes }) => {
  return (
    <div className={classes.udmWrapper}>
      <ReactJson
        src={obj}
        name={false}
        quotesOnKeys={false}
        displayArrayKey={false}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={false}
        theme={jsonViewTheme}
      />
    </div>);
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
const DetailsTable = ({ metadata, classes }) => {
  let [searchTerm, setSearchTerm] = useState('');

  if (!metadata) {
    return '';
  }

  let um;

  try {
    um = JSON.parse(metadata);
    console.log('parsed um', um);
  } catch (e) {
    console.log('unable to parse', metadata);
  }

  let change = (e) => {
    setSearchTerm(e.target.value);
  };

  let keys = Object.keys(um).filter((k) => {
    if (searchTerm.length === 0) {
      return true;
    }

    return um[k].values.some((value) => {
      if (typeof value === 'string') {
        // placeholder
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'object') {
        return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    })
  });


  return (
    <div className={classes.container}>
      <div>
        <TextField
          classes={{
            root: classes.root,
          }}
          name="datasetMetadata"
          placeholder="Search Metadata Values"
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
      {keys.map((key, keyIdx) => {
        let { values, descriptions } = um[key];
        let zipped = zip(values, descriptions).filter(([v]) => {
          if (typeof v === 'string') {
            // placeholder
            return v.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (typeof v === 'object') {
            return JSON.stringify(v).toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false
        });

        return (
          <div className={classes.blob} key={`blob-${key}`}>
            <div className={classes.blobKeyHeading}><span>metadata key: </span><code>{key}</code></div>
            <table>
              <thead>
                <tr>
                  <td>Description</td>
                  <td>Value</td>
                </tr>
              </thead>
              <tbody>
                {zipped.map(([value, description], idx) => {
                  return (
                    <tr key={`blob-${key}(${keyIdx})-val(${idx})`}>
                      <td className={classes.blobDesc}>
                        {description}
                      </td>
                      <td className={classes.blobKeyV}>

                        <RenderValue val={value} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export default withStyles(styles)(DetailsTable);
