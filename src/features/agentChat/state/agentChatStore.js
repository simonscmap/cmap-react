// State for the CMAP Agent chat panel.
//
// Chat state is local to this feature and is held in a zustand store, following
// the pattern used by the other feature modules (catalogSearch, rowCount,
// multiDatasetDownload). Redux is still the source of truth for the things that
// belong to the application as a whole: whether a user is logged in, and the
// user's API keys.
//
// The agent persists conversations server-side. The client therefore only needs
// to remember the current thread id, which is kept in local storage so that a
// conversation continues across page navigation and page reloads.

import { create } from 'zustand';
import {
  postChat,
  getThreadMessages,
  presignUpload,
  putToPresignedUrl,
  AgentApiError,
} from '../api/agentApi';
import {
  sanitizeArtifactForHint,
  appendFileHint,
  stripFileHints,
  guessContentType,
} from '../utils/messageUtils';
import { threadStorageKey, panelSizeStorageKey } from '../config';
import { localStorageApi } from '../../../Services/persist/local';
import logInit from '../../../Services/log-service';

const log = logInit('agentChat/agentChatStore');

let nextLocalId = 1;
const localId = () => {
  nextLocalId = nextLocalId + 1;
  return `local-${nextLocalId}`;
};

// The panel size the user last set is remembered, so the panel does not snap
// back to its default on every navigation.
const readStoredPanelSize = () => {
  try {
    const stored = localStorageApi.get(panelSizeStorageKey);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    if (parsed && parsed.width && parsed.height) {
      return { width: parsed.width, height: parsed.height };
    }
    return null;
  } catch (e) {
    return null;
  }
};

const readStoredThreadId = () => {
  try {
    const stored = localStorageApi.get(threadStorageKey);
    return stored || null;
  } catch (e) {
    return null;
  }
};

const writeStoredThreadId = (threadId) => {
  try {
    if (threadId) {
      localStorageApi.set(threadStorageKey, threadId);
    } else {
      localStorageApi.del(threadStorageKey);
    }
  } catch (e) {
    log.warn('could not persist thread id', { error: e });
  }
};

// Convert a message record returned by /threads/{id}/messages into the shape
// rendered by the message list.
const fromThreadMessage = (item) => ({
  id: `remote-${item.message_id}`,
  role: item.role === 'assistant' ? 'assistant' : 'user',
  content: stripFileHints(item.content),
  code: null,
  artifacts: [],
  toolTrace: [],
  elapsedMs: null,
  isError: false,
});

const useAgentChatStore = create((set, get) => ({
  isOpen: false,
  // Plots returned by the agent are easier to read in a wider panel, so the
  // panel width can be toggled.
  isMaximized: false,
  panelSize: readStoredPanelSize(),
  // A file chosen with the attach control or dropped onto the panel, held here
  // so that both the panel and the composer can reach it.
  pendingFile: null,
  messages: [],
  threadId: readStoredThreadId(),
  status: 'idle', // idle | sending | restoring
  error: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
  toggleMaximized: () => set({ isMaximized: !get().isMaximized }),

  setPanelSize: (size) => {
    try {
      localStorageApi.set(panelSizeStorageKey, JSON.stringify(size));
    } catch (e) {
      log.warn('could not persist panel size', { error: e });
    }
    set({ panelSize: size });
  },

  setPendingFile: (file) => set({ pendingFile: file || null }),
  clearPendingFile: () => set({ pendingFile: null }),

  clearError: () => set({ error: null }),

  // Abandon the current conversation and begin a new one. The thread itself is
  // retained server-side and remains listed under the user's threads.
  startNewConversation: () => {
    writeStoredThreadId(null);
    set({ messages: [], threadId: null, error: null, status: 'idle' });
  },

  // Restore the messages of the persisted thread. Called when the panel is
  // opened with a known thread id but no messages in memory, which happens
  // after a page navigation or reload.
  restoreConversation: async (apiKey) => {
    const { threadId, status } = get();
    if (!threadId || !apiKey || status !== 'idle') {
      return;
    }
    set({ status: 'restoring', error: null });
    try {
      const response = await getThreadMessages(threadId, apiKey);
      const messages = (response && response.messages ? response.messages : [])
        .filter((item) => item && item.content)
        .map(fromThreadMessage);
      set({ messages, status: 'idle' });
    } catch (e) {
      // A thread that cannot be restored should not block a new conversation:
      // drop the stale id and start clean.
      log.warn('could not restore conversation', { error: e });
      writeStoredThreadId(null);
      set({ messages: [], threadId: null, status: 'idle' });
    }
  },

  // Send a message and append the agent's reply.
  sendMessage: async (text, apiKey, file) => {
    const trimmed = (text || '').trim();
    if ((!trimmed && !file) || !apiKey || get().status === 'sending') {
      return;
    }

    const userMessage = {
      id: localId(),
      role: 'user',
      content: trimmed,
      code: null,
      artifacts: [],
      attachmentName: file ? file.name : null,
      isError: false,
    };

    set({
      messages: get().messages.concat([userMessage]),
      status: 'sending',
      error: null,
      pendingFile: null,
    });

    const startedAt =
      typeof performance !== 'undefined' && performance.now
        ? performance.now()
        : Date.now();

    try {
      // An attached file is uploaded first, then referenced in the message: the
      // chat request itself has no field for an attachment.
      let outgoing = trimmed;
      if (file) {
        set({ status: 'uploading' });
        const contentType = guessContentType(file);
        const presigned = await presignUpload(
          file,
          get().threadId,
          apiKey,
          contentType,
        );
        await putToPresignedUrl(file, presigned.upload);
        const artifact = sanitizeArtifactForHint(
          presigned.artifact || {},
          file,
        );
        outgoing = appendFileHint(trimmed, artifact);
        set({ status: 'sending' });
      }

      const response = await postChat(outgoing, get().threadId, apiKey);
      const threadId = response && response.thread_id ? response.thread_id : null;
      if (threadId && threadId !== get().threadId) {
        writeStoredThreadId(threadId);
      }
      const finishedAt =
        typeof performance !== 'undefined' && performance.now
          ? performance.now()
          : Date.now();

      const assistantMessage = {
        id: localId(),
        role: 'assistant',
        content:
          response && response.assistant_message
            ? response.assistant_message
            : 'The agent returned an empty response.',
        code: response && response.code ? response.code : null,
        artifacts:
          response && Array.isArray(response.artifacts)
            ? response.artifacts
            : [],
        toolTrace:
          response && Array.isArray(response.tool_trace)
            ? response.tool_trace
            : [],
        elapsedMs: Math.max(0, Math.round(finishedAt - startedAt)),
        isError: false,
      };
      set({
        messages: get().messages.concat([assistantMessage]),
        threadId: threadId || get().threadId,
        status: 'idle',
      });
    } catch (e) {
      const isAgentError = e instanceof AgentApiError || e.name === 'AgentApiError';
      const status = isAgentError ? e.status : 0;
      let detail = isAgentError
        ? e.detail
        : 'Something went wrong while contacting the agent.';

      if (status === 401 || status === 403) {
        detail =
          'The API key was not accepted by the agent. A new key can be created on the API Key page.';
      } else if (status === 429) {
        const wait = isAgentError && e.retryAfterSeconds;
        detail = wait
          ? `Too many requests. Please wait ${wait} seconds before sending another message.`
          : 'Too many requests. Please wait a moment before sending another message.';
      }

      set({
        messages: get().messages.concat([
          {
            id: localId(),
            role: 'assistant',
            content: detail,
            code: null,
            artifacts: [],
            isError: true,
          },
        ]),
        status: 'idle',
        error: detail,
      });
    }
  },
}));

export default useAgentChatStore;
