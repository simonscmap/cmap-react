// The CMAP Agent chat widget.
//
// This component is mounted once, in GlobalUIComponentWrapper, so that the
// agent is reachable from every page of the application. It renders a launcher
// button in the lower right corner and, when opened, a chat panel anchored to
// the same corner.
//
// The panel sits below Material-UI's modal layer, so dialogs opened from within
// it (the login dialog, for example) appear above it rather than behind it.

import React, { useEffect, useRef, useState } from 'react';
import { Typography, IconButton, Tooltip, Fab, Badge } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import AddCommentIcon from '@material-ui/icons/AddComment';
import ChatIcon from '@material-ui/icons/Chat';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

import useAgentChatStore from '../../state/agentChatStore';
import {
  agentChatEnabled,
  panelDefaultWidth,
  panelDefaultHeight,
  panelMinWidth,
  panelMinHeight,
} from '../../config';
import useAgentApiKey, { ACCESS } from '../../hooks/useAgentApiKey';
import AccessGate from '../AccessGate';
import MessageList from '../MessageList';
import Composer from '../Composer';

const useStyles = makeStyles((theme) => ({
  launcher: {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    zIndex: 1250,
    [theme.breakpoints.down('xs')]: {
      right: '16px',
      bottom: '16px',
    },
  },
  panel: {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    zIndex: 1250,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 110px)',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--cmap-surface)',
    border: '1px solid var(--cmap-divider)',
    borderRadius: 'var(--cmap-radius-md, 6px)',
    boxShadow: '0 12px 32px rgba(3, 23, 47, 0.55)',
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
      right: '8px',
      left: '8px',
      bottom: '8px',
      width: 'auto',
      maxWidth: 'none',
      height: 'calc(100vh - 100px)',
    },
  },
  panelMaximized: {
    width: 'calc(100vw - 48px)',
    height: 'calc(100vh - 110px)',
  },
  // The panel sits inside an element that centres text application-wide
  // (.App in App.scss), so alignment is set explicitly here.
  panelText: {
    textAlign: 'left',
  },
  resizeHandle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '18px',
    height: '18px',
    cursor: 'nwse-resize',
    zIndex: 3,
    // A small visual grip, drawn with a gradient so no extra markup is needed.
    background:
      'linear-gradient(135deg, var(--cmap-primary) 0%, var(--cmap-primary) 28%, transparent 29%)',
    opacity: 0.6,
    borderTopLeftRadius: 'var(--cmap-radius-md, 6px)',
    '&:hover': {
      opacity: 1,
    },
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  dropOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '24px',
    background: 'var(--cmap-scrim)',
    border: '2px dashed var(--cmap-primary)',
    borderRadius: 'var(--cmap-radius-md, 6px)',
    color: 'var(--cmap-text-primary)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 8px 10px 16px',
    borderBottom: '1px solid var(--cmap-divider)',
    background: 'var(--cmap-surface-dark)',
  },
  title: {
    color: 'var(--cmap-text-primary)',
  },
  subtitle: {
    color: 'var(--cmap-text-muted)',
    fontSize: '0.72rem',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
}));

const AgentChatWidget = () => {
  const classes = useStyles();

  const isOpen = useAgentChatStore((state) => state.isOpen);
  const isMaximized = useAgentChatStore((state) => state.isMaximized);
  const panelSize = useAgentChatStore((state) => state.panelSize);
  const messages = useAgentChatStore((state) => state.messages);
  const status = useAgentChatStore((state) => state.status);
  const threadId = useAgentChatStore((state) => state.threadId);
  const open = useAgentChatStore((state) => state.open);
  const close = useAgentChatStore((state) => state.close);
  const toggleMaximized = useAgentChatStore((state) => state.toggleMaximized);
  const setPanelSize = useAgentChatStore((state) => state.setPanelSize);
  const setPendingFile = useAgentChatStore((state) => state.setPendingFile);
  const sendMessage = useAgentChatStore((state) => state.sendMessage);
  const restoreConversation = useAgentChatStore(
    (state) => state.restoreConversation,
  );
  const startNewConversation = useAgentChatStore(
    (state) => state.startNewConversation,
  );

  const { access, apiKey } = useAgentApiKey(isOpen);
  const canChat = access === ACCESS.ready;

  // Drag and drop. A counter is used rather than a boolean because dragenter
  // and dragleave also fire as the pointer crosses child elements, which would
  // otherwise make the overlay flicker.
  const [dragDepth, setDragDepth] = useState(0);

  const handleDragEnter = (event) => {
    if (!canChat) {
      return;
    }
    event.preventDefault();
    setDragDepth((depth) => depth + 1);
  };

  const handleDragOver = (event) => {
    if (!canChat) {
      return;
    }
    // Without this the browser opens the file instead of offering it here.
    event.preventDefault();
  };

  const handleDragLeave = () => {
    setDragDepth((depth) => (depth > 0 ? depth - 1 : 0));
  };

  // Resizing. The panel is anchored to the lower right corner, so dragging the
  // upper left corner away from that anchor enlarges it. Pointer tracking is
  // attached to the document so the drag continues if the pointer leaves the
  // handle.
  const panelRef = useRef(null);

  const handleResizeStart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const rect = panelRef.current
      ? panelRef.current.getBoundingClientRect()
      : { width: panelDefaultWidth, height: panelDefaultHeight };
    const startWidth = rect.width;
    const startHeight = rect.height;

    const onMove = (moveEvent) => {
      const width = Math.min(
        Math.max(startWidth + (startX - moveEvent.clientX), panelMinWidth),
        window.innerWidth - 32,
      );
      const height = Math.min(
        Math.max(startHeight + (startY - moveEvent.clientY), panelMinHeight),
        window.innerHeight - 110,
      );
      setPanelSize({ width: Math.round(width), height: Math.round(height) });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      // Restore text selection, disabled during the drag.
      document.body.style.userSelect = '';
    };

    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleDrop = (event) => {
    if (!canChat) {
      return;
    }
    event.preventDefault();
    setDragDepth(0);
    const dropped =
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files.length
        ? event.dataTransfer.files[0]
        : null;
    if (dropped) {
      setPendingFile(dropped);
    }
  };

  // When the panel is opened and a previous conversation exists but its
  // messages are not in memory (after navigating between pages, or reloading),
  // restore them from the agent.
  useEffect(() => {
    if (isOpen && canChat && threadId && messages.length === 0) {
      restoreConversation(apiKey);
    }
  }, [isOpen, canChat, threadId, messages.length, apiKey, restoreConversation]);

  if (!isOpen) {
    return (
      <Tooltip title="Ask the CMAP Agent" placement="left">
        <Fab
          color="primary"
          className={classes.launcher}
          onClick={open}
          aria-label="Open the CMAP Agent chat"
        >
          <Badge
            color="secondary"
            variant="dot"
            invisible={messages.length === 0}
          >
            <ChatIcon />
          </Badge>
        </Fab>
      </Tooltip>
    );
  }

  return (
    <div
      ref={panelRef}
      className={[
        classes.panel,
        classes.panelText,
        isMaximized ? classes.panelMaximized : '',
      ].join(' ')}
      style={
        isMaximized
          ? undefined
          : {
              width: panelSize ? panelSize.width : panelDefaultWidth,
              height: panelSize ? panelSize.height : panelDefaultHeight,
            }
      }
      role="dialog"
      aria-label="CMAP Agent chat"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {dragDepth > 0 && canChat ? (
        <div className={classes.dropOverlay}>
          Drop a csv to attach it to the next message
        </div>
      ) : null}

      {!isMaximized ? (
        <div
          className={classes.resizeHandle}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-label="Resize the chat panel"
          title="Drag to resize"
        />
      ) : null}

      <div className={classes.header}>
        <div>
          <Typography variant="h6" className={classes.title}>
            CMAP Agent
          </Typography>
          <span className={classes.subtitle}>
            Answers may be imperfect; verify important results.
          </span>
        </div>
        <div className={classes.headerActions}>
          {canChat && messages.length > 0 ? (
            <Tooltip title="Start a new conversation">
              <IconButton size="small" onClick={startNewConversation}>
                <AddCommentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title={isMaximized ? 'Restore the panel' : 'Maximize'}>
            <IconButton
              size="small"
              onClick={toggleMaximized}
              aria-label={isMaximized ? 'Restore the panel' : 'Maximize'}
            >
              {isMaximized ? (
                <FullscreenExitIcon fontSize="small" />
              ) : (
                <FullscreenIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={close}
              aria-label="Close the CMAP Agent chat"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className={classes.body}>
        {canChat ? (
          <React.Fragment>
            <MessageList messages={messages} status={status} />
            <Composer
              onSend={(text, file) => sendMessage(text, apiKey, file)}
              disabled={status === 'sending' || status === 'uploading'}
            />
          </React.Fragment>
        ) : (
          <AccessGate access={access} />
        )}
      </div>
    </div>
  );
};

// The feature flag is checked in a wrapper rather than inside the component, so
// that when the feature is disabled the component never mounts and none of its
// hooks run. A conditional return inside the component would sit above its hook
// calls, which is not a shape React permits.
const AgentChatWidgetGate = () =>
  agentChatEnabled ? <AgentChatWidget /> : null;

export default AgentChatWidgetGate;
