// Configuration for the CMAP Agent chat feature.
//
// The agent is a separate service (see https://github.com/mdashkezari/cmap-agent-api)
// deployed at agent.simonscmap.ai. The browser calls it directly; the agent's
// CORS configuration (CMAP_AGENT_CORS_ALLOW_ORIGINS) must list the origin the
// web application is served from, which currently includes simonscmap.com,
// simonscmap.dev and localhost:3000.
//
// The base url can be overridden at build time with REACT_APP_AGENT_API_URL,
// which is useful when pointing a local web application at a locally running
// agent.

// Feature flag for the whole agent chat feature.
//
// When false, nothing is mounted: no launcher, no panel, and no request for the
// user's API keys. Set it here to turn the feature off in the codebase, or
// override it at build time with REACT_APP_AGENT_CHAT_ENABLED=false without
// editing the source.
export const agentChatEnabled =
  (process.env.REACT_APP_AGENT_CHAT_ENABLED || 'true').toLowerCase() !== 'false';

const DEFAULT_AGENT_API_URL = 'https://agent.simonscmap.ai';

export const agentApiUrl = (
  process.env.REACT_APP_AGENT_API_URL || DEFAULT_AGENT_API_URL
).replace(/\/$/, '');

// The agent performs tool calls and database queries before answering, so a
// single response can take a long time. The reference chat client used by
// simonscmap.ai allows ten minutes; the same allowance is used here.
export const requestTimeoutMs = 600 * 1000;

// Key under which the current thread id is persisted, so that a conversation
// survives navigation between pages and page reloads.
export const threadStorageKey = 'agentChatThreadId';

// Key under which the panel size the user set is remembered.
export const panelSizeStorageKey = 'agentChatPanelSize';

// Panel geometry. The panel is anchored to the lower right corner and is
// resized by dragging its upper left corner.
export const panelDefaultWidth = 420;
export const panelDefaultHeight = 600;
export const panelMinWidth = 320;
export const panelMinHeight = 360;

// Model configuration for the chat request.
//
// The agent applies its own defaults when a request omits these, but those
// defaults are not the same as the ones the reference client at simonscmap.ai
// sends, and tool-heavy requests such as colocalization behave differently
// between models. These values therefore match the reference client, so that a
// question answered there is answered the same way here. Each can be overridden
// at build time.
export const llmProvider = process.env.REACT_APP_AGENT_LLM_PROVIDER || 'openai';
export const llmModel = process.env.REACT_APP_AGENT_LLM_MODEL || 'gpt-4.1-mini';
export const maxToolCalls = Number(
  process.env.REACT_APP_AGENT_MAX_TOOL_CALLS || 8,
);
export const returnCode =
  (process.env.REACT_APP_AGENT_RETURN_CODE || 'true').toLowerCase() === 'true';

// Documentation and key management destinations referenced by the access gate.
export const apiKeyManagementPath = '/apikeymanagement';
