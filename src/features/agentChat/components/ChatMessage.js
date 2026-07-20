// Renders one message in the conversation.
//
// Assistant replies are markdown. react-markdown version 4 is already a
// dependency of this application (it renders dataset descriptions), so no new
// package is introduced; note that version 4 takes its content through the
// `source` prop rather than as children.
//
// A reply may also carry generated code, which the agent returns separately
// from the prose. It is shown below the message in a copyable block.

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CodeIcon from '@material-ui/icons/Code';
import Artifacts from './Artifacts';
import ToolTrace from './ToolTrace';
import { compactUrlLabel, stripFileHints } from '../utils/messageUtils';

const useStyles = makeStyles(() => ({
  row: {
    display: 'flex',
    marginBottom: '14px',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    padding: '10px 14px',
    borderRadius: 'var(--cmap-radius-md, 6px)',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  },
  user: {
    background: 'var(--cmap-hover-strong)',
    color: 'var(--cmap-text-primary)',
  },
  assistant: {
    background: 'var(--cmap-elevated)',
    color: 'var(--cmap-text-primary)',
  },
  error: {
    background: 'rgba(239, 106, 106, 0.16)',
    color: 'var(--cmap-error-tint)',
    border: '1px solid var(--cmap-error)',
  },
  markdown: {
    '& p': {
      margin: '0 0 8px 0',
    },
    '& p:last-child': {
      marginBottom: 0,
    },
    '& a': {
      color: 'var(--cmap-primary)',
    },
    '& code': {
      background: 'var(--cmap-background-deep)',
      padding: '1px 4px',
      borderRadius: '3px',
      fontSize: '0.82rem',
    },
    '& pre': {
      background: 'var(--cmap-background-deep)',
      padding: '10px',
      borderRadius: 'var(--cmap-radius-md, 6px)',
      overflowX: 'auto',
    },
    '& ul, & ol': {
      margin: '0 0 8px 0',
      paddingLeft: '20px',
    },
    '& table': {
      borderCollapse: 'collapse',
      fontSize: '0.8rem',
    },
    '& th, & td': {
      border: '1px solid var(--cmap-divider)',
      padding: '4px 8px',
    },
  },
  attachment: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.74rem',
    color: 'var(--cmap-text-muted)',
    marginTop: '6px',
  },
  codeSection: {
    marginTop: '10px',
    borderTop: '1px solid var(--cmap-divider)',
    paddingTop: '8px',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  codeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--cmap-text-secondary)',
    fontSize: '0.78rem',
  },
  codeBlock: {
    margin: '8px 0 0 0',
    padding: '10px',
    background: 'var(--cmap-background-deep)',
    borderRadius: 'var(--cmap-radius-md, 6px)',
    overflowX: 'auto',
    fontSize: '0.78rem',
    color: 'var(--cmap-text-primary)',
  },
}));

// The agent sometimes includes an artifact url in the body of its answer.
// Presigned urls run to hundreds of characters, and a bare url in markdown is
// linked using the url itself as the link text, which floods the panel.
//
// Extracting that link text needs care: react-markdown version 4 renders text
// nodes through a component, so the children handed to a custom renderer are
// React elements rather than plain strings. The text is therefore collected by
// walking the element tree.
const childrenToText = (children) => {
  const parts = [];

  const walk = (node) => {
    if (node === null || node === undefined || node === false) {
      return;
    }
    if (typeof node === 'string' || typeof node === 'number') {
      parts.push(String(node));
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.props && node.props.children !== undefined) {
      walk(node.props.children);
      return;
    }
    if (node.props && node.props.value !== undefined) {
      parts.push(String(node.props.value));
    }
  };

  walk(children);
  return parts.join('');
};

const markdownRenderers = {
  link: (linkProps) => {
    const href = linkProps.href || '';
    const text = childrenToText(linkProps.children).trim();

    // A link whose text is the url carries no information the label cannot
    // convey, so it is replaced. Links with their own text are left alone.
    const textIsUrl =
      text.length > 0 &&
      (text === href.trim() ||
        text === decodeURIComponent(href.trim()) ||
        (text.indexOf('http') === 0 && text.length > 80));

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={href}>
        {textIsUrl ? compactUrlLabel(href) : linkProps.children}
      </a>
    );
  },
};

const ChatMessage = (props) => {
  const { message } = props;
  const classes = useStyles();
  const [showCode, setShowCode] = useState(false);

  const isUser = message.role === 'user';

  const bubbleClasses = [classes.bubble];
  if (message.isError) {
    bubbleClasses.push(classes.error);
  } else if (isUser) {
    bubbleClasses.push(classes.user);
  } else {
    bubbleClasses.push(classes.assistant);
  }

  const copyCode = () => {
    if (navigator.clipboard && message.code) {
      navigator.clipboard.writeText(message.code);
    }
  };

  return (
    <div
      className={[
        classes.row,
        isUser ? classes.rowUser : classes.rowAssistant,
      ].join(' ')}
    >
      <div className={bubbleClasses.join(' ')}>
        {isUser ? (
          <Typography variant="body2" component="div">
            {stripFileHints(message.content)}
          </Typography>
        ) : (
          <ReactMarkdown
            source={message.content}
            className={classes.markdown}
            renderers={markdownRenderers}
          />
        )}

        {message.attachmentName ? (
          <div className={classes.attachment}>
            {`Attached: ${message.attachmentName}`}
          </div>
        ) : null}

        <Artifacts artifacts={message.artifacts} />

        {message.code ? (
          <div className={classes.codeSection}>
            <div
              className={classes.codeHeader}
              onClick={() => setShowCode(!showCode)}
            >
              <span className={classes.codeLabel}>
                <CodeIcon fontSize="small" />
                {showCode ? 'Hide generated code' : 'Show generated code'}
              </span>
              <Tooltip title="Copy code">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    copyCode();
                  }}
                >
                  <FileCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            {showCode ? (
              <pre className={classes.codeBlock}>{message.code}</pre>
            ) : null}
          </div>
        ) : null}

        {!isUser ? (
          <ToolTrace
            trace={message.toolTrace}
            elapsedMs={message.elapsedMs}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessage;
