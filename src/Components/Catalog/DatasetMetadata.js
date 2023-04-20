import React from 'react';
import { withStyles, TextField } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import ReactJson from 'react-json-view';
import { zip, isStringURL } from './VariablesTable/datagridHelpers';
import colors from '../../enums/colors';

const TABLE_BG_COLOR = '#184562';

const styles = () => ({
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
  metadataBlob: {
    border: '1px solid black',
    margin: '1em 0',
    padding: '1em',
  },
  blobKeyHeading: {
    padding: '1em 0',
    fontSize: '1em',
    '& code': {
      color: colors.primary
    }
  },
  blobValuesContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    padding: '1em',
    borderTop: `1px solid ${colors.primary}`,
  },
  blobKeyV: {

  },
  objKVWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    width: '100%',
    padding: '0.25em 0',
  },
  objKVNodeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  blobDesc: {
   paddingLeft: '1em',
  },
});

const jsonViewTheme = {
  base00: TABLE_BG_COLOR, // background
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
    padding: '2em',
    background: '#184562',
    border: '1px solid black'
  }
}))(({ obj, classes }) => {
  return (
    <div className={classes.udmWrapper}>
      <ReactJson
        src={obj}
        quotesOnKeys={false}
        displayArrayKey={false}
        displayDataTypes={false}
        displayObjectSize={false}
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
  if (!metadata || Object.keys(metadata).length === 0) {
    return '';
  }

  let keys = Object.keys(metadata);

  return (
    <div className={classes.container}>
      {keys.map((key, keyIdx) => {
        let { values, descriptions } = metadata[key];
        let zipped = zip(values, descriptions);
        return (
          <div className={classes.blob} key={`blob-${key}`}>
            <div className={classes.blobKeyHeading}><span>metadata key: </span><code>{key}</code></div>
            <table>
              <thead>
                <tr>
                  <td>Value</td>
                  <td>Description</td>
                </tr>
              </thead>
              <tbody>
                {zipped.map(([value, description], idx) => {
                  return (
                    <tr key={`blob-${key}(${keyIdx})-val(${idx})`}>
                      <td className={classes.blobKeyV}>
                        <RenderValue val={value} />
                      </td>
                      <td className={classes.blobDesc}>
                        {description}
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
