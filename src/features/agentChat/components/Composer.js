// The message input.
//
// Enter sends the message; Shift and Enter together insert a line break. The
// input is disabled while a request is in flight, because the agent handles one
// message per thread at a time.

import React, { useState, useRef } from 'react';
import { TextField, IconButton, Tooltip, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import useAgentChatStore from '../state/agentChatStore';
import { formatBytes } from '../utils/messageUtils';

const useStyles = makeStyles(() => ({
  wrapper: {
    borderTop: '1px solid var(--cmap-divider)',
  },
  composer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    padding: '12px 16px',
  },
  field: {
    flex: 1,
  },
  attachment: {
    padding: '10px 16px 0 16px',
  },
  hiddenInput: {
    display: 'none',
  },
}));

const Composer = (props) => {
  const { onSend, disabled } = props;
  const classes = useStyles();
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // The attachment lives in the feature store, because a file can arrive either
  // through the control here or by being dropped onto the panel.
  const file = useAgentChatStore((state) => state.pendingFile);
  const setPendingFile = useAgentChatStore((state) => state.setPendingFile);
  const clearPendingFile = useAgentChatStore((state) => state.clearPendingFile);

  const send = () => {
    const trimmed = value.trim();
    if ((!trimmed && !file) || disabled) {
      return;
    }
    onSend(trimmed, file);
    setValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFileChosen = (event) => {
    const chosen =
      event.target.files && event.target.files.length
        ? event.target.files[0]
        : null;
    setPendingFile(chosen);
  };

  const removeFile = () => {
    clearPendingFile();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className={classes.wrapper}>
      {file ? (
        <div className={classes.attachment}>
          <Chip
            icon={<AttachFileIcon />}
            label={`${file.name} (${formatBytes(file.size)})`}
            onDelete={removeFile}
            variant="outlined"
            size="small"
          />
        </div>
      ) : null}

      <div className={classes.composer}>
        <input
          ref={inputRef}
          type="file"
          className={classes.hiddenInput}
          onChange={handleFileChosen}
          accept=".csv,text/csv"
        />
        <Tooltip title="Attach a csv, or drop one onto the panel">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => inputRef.current && inputRef.current.click()}
              aria-label="Attach a file"
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <TextField
        className={classes.field}
        variant="outlined"
        size="small"
        multiline
        rowsMax={5}
          placeholder="Ask about CMAP data"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Tooltip title="Send">
          <span>
            <IconButton
              color="primary"
              onClick={send}
              disabled={
                disabled || (value.trim().length === 0 && !file)
              }
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default Composer;
