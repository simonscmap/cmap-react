import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'throttle-debounce';
import { colors, pxToRem } from '../../Home/theme';

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
    background: 'rgba(0,0,0,0.2)',
    '& input': {
      fontSize: `${pxToRem[18]}`,
      padding: '18px 14px 4px 14px',
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
    '& p': {
      color: 'grey',
      marginTop: 0,
    },
  },
})(({ classes, link, onChange, key }) => {
  let { text = '', url = '' } = link;
  let [t, setT] = useState(text);
  let [u, setU] = useState(url);

  useEffect(() => {
    // let update = { text: t, url: u };
    // debouncedUpdate (update);
    if (onChange && onChange.call) {
      onChange.call(null, { text: t, url: u });
    }
  }, [t, u]);

  return (
    <div className={classes.container}>
      <TextField
        classes={{
          root: classes.textField,
        }}
        error={!t}
        helperText={
          !t
            ? 'Link text must not be empty'
            : 'Text that is displayed for this link'
        }
        name="text"
        label={'Link Text'}
        InputLabelProps={{ shrink: true, disableAnimation: true }}
        defaultValue={text}
        variant="outlined"
        onChange={(ev) => setT(ev.target.value)}
        fullWidth
      />
      <TextField
        error={!u}
        helperText={
          !u ? 'URL must not be empty' : 'The URL target for this link'
        }
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
