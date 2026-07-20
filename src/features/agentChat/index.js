// CMAP Agent chat feature.
//
// The agent is a separate service (agent.simonscmap.ai) that authenticates with
// a CMAP API key. This feature makes it reachable from every page of the web
// application through a launcher in the lower right corner.
//
// Mounted once, in Components/UI/GlobalUIComponentWrapper.

export { default as AgentChatWidget } from './components/AgentChatWidget';
export { agentChatEnabled } from './config';
export { default as useAgentChatStore } from './state/agentChatStore';
export { ACCESS } from './hooks/useAgentApiKey';
