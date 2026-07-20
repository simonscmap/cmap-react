# CMAP Agent Chat

This document describes the CMAP Agent chat feature in the web application: what
it does, how it authenticates, how it is wired into the application, and what
must be true of the agent deployment for it to work.

## What it does

A launcher button in the lower right corner of every page opens a chat panel
that talks to the CMAP Agent. The agent answers questions about the CMAP
catalog and data, and may return generated code alongside its answer.

The feature is mounted once, in `src/Components/UI/GlobalUIComponentWrapper.js`,
alongside the login dialog, the snackbar, and the download dialog. Mounting it
there is what makes it available on every page without each page needing to know
about it.

## The agent service

The agent is a separate service, not part of this repository:

- Service: `https://agent.simonscmap.ai`
- Source: `https://github.com/mdashkezari/cmap-agent-api`
- Interactive documentation: `https://agent.simonscmap.ai/docs`

The browser calls the agent directly. The web application's own Node API is not
involved in the exchange.

### Endpoints used

- `POST /chat` — sends a message, returns `assistant_message`, a `thread_id`,
  and optionally `code`, `artifacts`, `tool_trace`, and `kb_hits`. Responses are
  returned whole; the endpoint does not stream.
- `GET /threads/{thread_id}/messages` — returns the messages of a conversation,
  used to restore a conversation when the panel is reopened.

## Authentication

The agent authenticates with a CMAP API key, sent in the `X-API-Key` header.
These are the same keys the API Key page (`/apikeymanagement`) creates: the
agent validates the key against `tblAPI_keys` and resolves the user identity
from it.

The web application already retrieves a user's keys for that page. Dispatching
`keyRetrievalRequestSend()` calls `/api/user/retrieveapikeys` and places the
result on redux state as `apiKeys`, an array of records shaped
`{ Api_Key, Description }`. The chat feature reuses this: keys are requested the
first time the panel is opened, and the first key is used. A user holding
several keys is authenticated identically by any of them.

The client deliberately does not send a `user_id`. The agent derives the user
from the API key, and returns `403` if a supplied `user_id` disagrees with the
authenticated key.

### Access states

The panel resolves one of four states, in `hooks/useAgentApiKey.js`:

1. `loggedOut` — no user in redux state. The panel invites the visitor to log in
   or register, and opens the standard login dialog.
2. `loadingKeys` — a logged-in user whose keys have not yet been retrieved.
3. `retrievalFailed` — the request for the key list failed. Note that a failure
   leaves `apiKeys` null and records the failure in `apiKeyRetrievalState`
   separately, so a check that waits on the key list alone would spin
   indefinitely. This state offers a retry.
4. `noKey` — a logged-in user with no API key. The panel explains that a key is
   required and links to `/apikeymanagement` to create one.
5. `ready` — a key is available and the conversation is enabled.

A user who creates a key while the panel is open does not need to reopen it: the
key creation saga dispatches a key retrieval on success, `apiKeys` updates, and
the panel moves from the gate to the conversation on its own.

## Conversation continuity

The agent stores conversations. The client keeps only the `thread_id`, in local
storage under `agentChatThreadId`. When the panel is opened and a thread id is
known but no messages are held in memory, which is the case after navigating
between pages or reloading, the messages are restored from the agent. A thread
that cannot be restored is discarded and a new conversation begins.

The header offers a control to start a new conversation. Previous threads remain
stored by the agent.

## Turning the feature off

`src/features/agentChat/config.js` exports `agentChatEnabled`. When it is false
nothing is mounted: no launcher button, no panel, and no request for the user's
API keys. The flag is checked in a wrapper around the widget so that the
component never mounts when the feature is off.

The value can be changed in that file, or overridden at build time without
editing source:

```
REACT_APP_AGENT_CHAT_ENABLED=false
```

Any value other than `false` leaves the feature enabled, so it is on by default.

## Configuration

`src/features/agentChat/config.js` holds the settings:

- The agent base URL defaults to `https://agent.simonscmap.ai` and can be
  overridden at build time with `REACT_APP_AGENT_API_URL`, which is useful when
  pointing a local web application at a locally running agent.
- The request timeout is ten minutes. The agent performs tool calls and database
  queries before answering, so a single response can take a long time.

### Model configuration

The chat request carries an explicit model configuration:

- provider `openai`, model `gpt-4.1-mini`
- `return_code` true, `max_tool_calls` 8

These match the reference client at simonscmap.ai. The agent applies its own
defaults when a request omits them, and those defaults are not the same: the
schema default model differs. Because tool-heavy requests such as colocalization
depend on the model assembling correct tool arguments, a request that succeeds
in one client can fail in another purely through this difference. Sending the
configuration explicitly keeps behaviour aligned between the two frontends.

Each value can be overridden at build time with `REACT_APP_AGENT_LLM_PROVIDER`,
`REACT_APP_AGENT_LLM_MODEL`, `REACT_APP_AGENT_MAX_TOOL_CALLS`, and
`REACT_APP_AGENT_RETURN_CODE`.

### Required agent configuration: CORS

Because the browser calls the agent directly, the agent must allow the origin
the web application is served from. This is configured on the agent deployment
through the `CMAP_AGENT_CORS_ALLOW_ORIGINS` environment variable, which must
include:

```
https://simonscmap.com
https://simonscmap.dev
http://localhost:3000
```

If these are absent, requests fail in the browser before reaching the agent, and
the panel reports that the agent could not be reached. Note that changing the
variable on an Elastic Container Service task definition requires a new task
definition revision and a service update before the running tasks pick it up.

## Structure

```
src/features/agentChat/
├── api/
│   └── agentApi.js        # fetch wrapper, X-API-Key header, timeout, errors
├── components/
│   ├── AgentChatWidget/
│   │   └── index.js       # launcher and panel; the mounted component
│   ├── AccessGate.js      # logged out, loading keys, and no key states
│   ├── ChatMessage.js     # one message, with markdown and code block
│   ├── Composer.js        # the input
│   └── MessageList.js     # scrolling conversation, empty and thinking states
├── hooks/
│   └── useAgentApiKey.js  # resolves access state and the key from redux
├── state/
│   └── agentChatStore.js  # zustand store: panel, messages, thread
├── config.js
└── index.js
```

Chat state is local to the feature and held in a zustand store, following the
pattern of the other feature modules. Redux remains the source of truth for
whether a user is logged in and for the user's API keys.

Answers are rendered as markdown with `react-markdown`, already a dependency of
this application. Note that the installed version, 4, takes its content through
the `source` prop rather than as children.

## Artifacts

An agent reply may carry artifacts: a plot image, a csv of the queried data, or
another file. They are rendered below the reply text by
`components/Artifacts.js`. Images appear inline and open at full size in a new
tab; other artifacts appear as download links. The expiry the agent reports is
shown alongside, because artifact links are time limited.

Artifact urls come in two forms. A url beginning with a slash is relative to the
agent host and is served by the local artifact backend under `/artifacts`, which
the agent treats as a public path; images therefore load in an `img` tag without
the API key header. The S3 backend returns absolute presigned urls, which are
used unchanged.

Because plots are easier to read at size, the panel can be enlarged: the header
offers a maximize control, and the panel can be resized freely by dragging its
upper left corner. A size set by dragging is remembered in local storage under
`agentChatPanelSize`, so the panel does not snap back on every navigation.

Note that artifacts belong to the reply as received. Restoring an earlier
conversation through `GET /threads/{id}/messages` returns the message text only,
so a restored conversation shows its replies without the original images. The
links expire in any case.

## Long urls in replies

The agent sometimes names an artifact url in the body of its answer rather than,
or in addition to, attaching it. Presigned storage urls run to several hundred
characters, and markdown renders a bare url using the url itself as the link
text, which floods a narrow panel.

A custom link renderer in `components/ChatMessage.js` handles this: when a
link's text is the url itself, a compact label derived from the url is shown
instead, usually the file name. Links that already carry meaningful text are
left untouched. The full url remains the link target, and is also set as the
link's title so it can be inspected on hover.

Extracting the link text requires care. In react-markdown version 4 a text node
is rendered through a component, so the children handed to a custom renderer are
React elements rather than plain strings. Comparing the first child directly
against the href therefore never matches, and the renderer silently falls back
to showing the whole url. The text is instead collected by walking the element
tree, in `childrenToText`.

## Attaching a file

A file can be attached to a message in two ways: with the control at the left of
the composer, or by dropping it anywhere on the chat panel, which shows a drop
target while a file is over it. The attachment is held in the feature store
rather than in the composer, so that both routes populate the same place. The
flow then follows the protocol used by the reference client:

1. `POST /files/presign_upload` returns an upload url and an artifact record.
2. The file bytes are sent directly to that url with a `PUT`. This request goes
   to object storage, not to the agent.
3. The artifact record is appended to the outgoing message inside a
   `[CMAP_FILE] ... [/CMAP_FILE]` block, together with an instruction telling
   the agent to use it as a data source, for example with `cmap.colocalize`.

The chat request has no field for an attachment, which is why the reference is
carried in the message text. The block is machine-facing, so it is removed
before a message is displayed, including when a conversation is restored from
the agent. The attached file name is shown beneath the user's message instead.

### Required configuration for uploads

Uploads have two requirements beyond the agent's own CORS settings:

- The agent must run with `CMAP_AGENT_ARTIFACT_BACKEND` set to `s3`. The
  presign endpoint is unavailable otherwise.
- The storage bucket must allow `PUT` and `OPTIONS` from the web application
  origins, which is a bucket CORS rule and is separate from the agent's
  `CMAP_AGENT_CORS_ALLOW_ORIGINS` setting. Without it the browser rejects the
  upload before it reaches storage, and the panel reports that the bucket may
  not allow uploads from this site.

The composer accepts csv files, which is the format the colocalization tool
takes as a source.

## A note on text alignment

`App.scss` contains `.App { text-align: center; }`, a default inherited from
Create React App that applies to the whole application. Individual pages
override it locally. The chat panel therefore sets `text-align: left` on its
root, without which replies, and particularly lists, render centred.

## Tool trace and timing

Each agent reply carries a `tool_trace`: the tools the agent called, with the
arguments given to each, a status, and a preview of the result or an error.
`components/ToolTrace.js` renders a summary line beneath the reply reading
`Tools (n)`, or `Tools (n, m errors)` when any call failed. Opening it lists the
calls; selecting one shows its full record, including arguments. A control
copies the whole trace as json, which is the useful form when reporting a
problem with an answer.

Timing is not part of the response, so it is measured in the client with
`performance.now()` around the whole send. The figure therefore includes any
file upload as well as the agent's own work, which is what a user experiences as
the wait.

Like artifacts, the trace and the timing belong to the reply as received. A
conversation restored through `GET /threads/{id}/messages` returns message text
only, so restored replies show neither.

## Error handling

The store translates failures into messages shown in the conversation:

- `401` and `403` — the key was not accepted; the user is pointed at the API Key
  page.
- `429` — the agent rate limits per user; the `Retry-After` value is included in
  the message when the agent supplies one.
- A network-level failure, which is also how a browser reports a rejected
  cross-origin request, produces a message about not reaching the agent rather
  than the browser's own wording.
- A request exceeding the timeout is reported as the agent not responding in
  time.

## Not included

The following exist in the agent API but are out of scope for this first
version, and are the natural next steps:

- The thread list from `GET /threads`, which would allow browsing and resuming
  past conversations rather than only the most recent one.
- Rendering of `kb_hits`, the knowledge base passages the agent consulted, which
  are returned by the agent but not currently displayed.
