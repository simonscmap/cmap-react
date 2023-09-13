import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { colors, pxToRem } from '../../Home/theme';
import { withStyles } from '@material-ui/core/styles';

export const linkType = (link) => {
  if (typeof link !== 'string') {
    return 'Unknown';
  } else if (link.slice(0, 4) === 'http') {
    return 'External';
  } else if (link.slice(0, 1) === '/') {
    return 'Internal';
  } else {
    return 'Unknown';
  }
};

const LinkEditor = withStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    '& label': {
      fontSize: '17px',
    },
  },
  textField: {
    border: `1px solid ${colors.blue.slate}`,
    borderRadius: '4px',
    background: colors.blue.dark,
    '& input': {
      fontSize: `${pxToRem[14]}`,
      border: 0,
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
})(({ classes, link, onChange }) => {
  let { text, url } = link;
  let [t, setT] = useState(text);
  let [u, setU] = useState(url);
  useEffect(() => {
    let update = { text: t, url: u };
    onChange(update);
  }, [t, u]);

  return (
    <div className={classes.container}>
      <TextField
        classes={{
          root: classes.textField,
        }}
        name="text"
        label={'Link Text'}
        InputLabelProps={{ shrink: true, disableAnimation: true }}
        defaultValue={text}
        variant="outlined"
        onChange={(ev) => setT(ev.target.value)}
        fullWidth
      />
      <TextField
        classes={{
          root: classes.textField,
        }}
        label={`URL (${linkType(url)})`}
        InputLabelProps={{ shrink: true, disableAnimation: true }}
        name="url"
        defaultValue={url}
        variant="outlined"
        onChange={(ev) => setU(ev.target.value)}
        fullWidth
      />
    </div>
  );
});

export default LinkEditor;
