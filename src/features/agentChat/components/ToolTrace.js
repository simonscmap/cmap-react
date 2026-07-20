// The tool trace and timing summary for one agent reply.
//
// The agent returns a `tool_trace` array describing the tools it called, each
// entry carrying a name, a status, the arguments it was given, and a preview of
// the result or an error. This is the record of how an answer was produced,
// which matters when an answer is surprising or wrong.
//
// Timing is not part of the response. It is measured in the client, around the
// whole send, so it includes any file upload as well as the agent's own work.

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  summary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px',
    fontSize: '0.72rem',
    color: 'var(--cmap-text-muted)',
  },
  toggle: {
    background: 'transparent',
    border: 0,
    padding: 0,
    font: 'inherit',
    color: 'var(--cmap-primary)',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  panel: {
    marginTop: '8px',
    borderTop: '1px solid var(--cmap-divider)',
    paddingTop: '8px',
  },
  panelActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '6px',
  },
  copyButton: {
    background: 'transparent',
    border: '1px solid var(--cmap-divider)',
    borderRadius: 'var(--cmap-radius-sm, 4px)',
    color: 'var(--cmap-text-secondary)',
    fontSize: '0.7rem',
    padding: '2px 8px',
    cursor: 'pointer',
  },
  item: {
    background: 'var(--cmap-background-deep)',
    border: '1px solid var(--cmap-divider)',
    borderRadius: 'var(--cmap-radius-md, 6px)',
    padding: '8px 10px',
    marginBottom: '6px',
    cursor: 'pointer',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    fontSize: '0.76rem',
  },
  toolName: {
    color: 'var(--cmap-text-primary)',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  statusOk: {
    color: 'var(--cmap-success)',
    fontSize: '0.7rem',
  },
  statusError: {
    color: 'var(--cmap-error)',
    fontSize: '0.7rem',
  },
  preview: {
    marginTop: '6px',
    fontSize: '0.7rem',
    color: 'var(--cmap-text-secondary)',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  detail: {
    marginTop: '6px',
    fontSize: '0.7rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    color: 'var(--cmap-text-secondary)',
    maxHeight: '260px',
    overflowY: 'auto',
    margin: 0,
  },
}));

// Durations are shown in the unit that reads most naturally at that scale.
export const formatDuration = (ms) => {
  if (typeof ms !== 'number' || !isFinite(ms) || ms < 0) {
    return null;
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(seconds >= 10 ? 0 : 1)} s`;
  }
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)} min ${whole % 60} sec`;
};

const prettyJson = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
};

const oneLine = (value, limit) => {
  if (value === null || value === undefined) {
    return '';
  }
  const text = typeof value === 'string' ? value : prettyJson(value);
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > limit ? `${flat.slice(0, limit)}...` : flat;
};

const isError = (item) =>
  Boolean(item && (item.error || (item.status && item.status !== 'ok' && item.status !== 'cached')));

const ToolTrace = (props) => {
  const { trace, elapsedMs } = props;
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  const items = Array.isArray(trace) ? trace : [];
  const duration = formatDuration(elapsedMs);

  if (items.length === 0 && !duration) {
    return null;
  }

  const errorCount = items.filter(isError).length;
  const label =
    errorCount > 0
      ? `Tools (${items.length}, ${errorCount} error${errorCount === 1 ? '' : 's'})`
      : `Tools (${items.length})`;

  const copyTrace = () => {
    const text = prettyJson(items);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        },
        () => setCopied(false),
      );
    }
  };

  return (
    <div>
      <div className={classes.summary}>
        {items.length > 0 ? (
          <button
            type="button"
            className={classes.toggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            {label}
          </button>
        ) : null}
        {duration ? <span>{duration}</span> : null}
      </div>

      {isOpen && items.length > 0 ? (
        <div className={classes.panel}>
          <div className={classes.panelActions}>
            <button
              type="button"
              className={classes.copyButton}
              onClick={copyTrace}
            >
              {copied ? 'Copied' : 'Copy trace'}
            </button>
          </div>

          {items.map((item, index) => {
            const failed = isError(item);
            const expanded = expandedIndex === index;
            return (
              <div
                key={`${item.tool || 'tool'}-${index}`}
                className={classes.item}
                onClick={() => setExpandedIndex(expanded ? null : index)}
              >
                <div className={classes.itemHeader}>
                  <span className={classes.toolName}>
                    {item.tool || 'tool'}
                  </span>
                  <span className={failed ? classes.statusError : classes.statusOk}>
                    {failed ? item.status || 'error' : item.status || 'ok'}
                  </span>
                </div>

                {!expanded ? (
                  <div className={classes.preview}>
                    {oneLine(
                      failed && item.error ? item.error : item.result_preview,
                      120,
                    )}
                  </div>
                ) : (
                  <pre className={classes.detail}>
                    {prettyJson({
                      tool: item.tool,
                      status: item.status,
                      arguments: item.arguments,
                      result_preview: item.result_preview,
                      error: item.error,
                    })}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ToolTrace;
