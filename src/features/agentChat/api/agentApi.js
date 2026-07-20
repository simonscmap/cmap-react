// Thin wrapper around window.fetch for the CMAP Agent API.
//
// Authentication is a CMAP API key sent in the X-API-Key header. The agent
// resolves the user id from that key by looking it up in tblAPI_keys, so the
// client deliberately does not send a user_id: the agent responds with 403 if a
// supplied user_id disagrees with the authenticated key.

import {
  agentApiUrl,
  requestTimeoutMs,
  llmProvider,
  llmModel,
  maxToolCalls,
  returnCode,
} from '../config';
import logInit from '../../../Services/log-service';

const log = logInit('agentChat/agentApi');

// An error carrying the http status and the agent's detail message, so that
// calling code can distinguish an expired key from a rate limit.
export function AgentApiError(status, detail, retryAfterSeconds) {
  this.name = 'AgentApiError';
  this.status = status;
  this.detail = detail;
  this.retryAfterSeconds = retryAfterSeconds || null;
  this.message = detail;
}
AgentApiError.prototype = Object.create(Error.prototype);
AgentApiError.prototype.constructor = AgentApiError;

const parsePayload = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
};

const detailFromPayload = (payload, status) => {
  if (payload && typeof payload === 'object' && payload.detail) {
    // FastAPI validation errors put an array here; keep it readable.
    if (typeof payload.detail === 'string') {
      return payload.detail;
    }
    return 'The agent rejected the request.';
  }
  if (typeof payload === 'string' && payload.length) {
    return payload;
  }
  return `Request failed (HTTP ${status})`;
};

// Perform a request against the agent, returning parsed JSON or throwing an
// AgentApiError. A network-level failure (including a CORS rejection, which the
// browser reports as a generic TypeError) is translated into a message that
// points at the likely cause rather than surfacing "Failed to fetch".
const request = async (path, options, apiKey) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    requestTimeoutMs,
  );

  const headers = Object.assign({}, options && options.headers ? options.headers : {});
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  let response;
  try {
    response = await fetch(
      agentApiUrl + path,
      Object.assign({}, options, {
        headers,
        signal: controller.signal,
      }),
    );
  } catch (e) {
    window.clearTimeout(timeoutId);
    if (e && e.name === 'AbortError') {
      throw new AgentApiError(
        0,
        'The agent did not respond in time. The question may be too large, or the service may be busy.',
      );
    }
    log.error('agent request failed at the network level', { error: e, path });
    throw new AgentApiError(
      0,
      'Could not reach the CMAP Agent. Check the network connection and try again.',
    );
  }

  window.clearTimeout(timeoutId);

  const payload = await parsePayload(response);

  if (!response.ok) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null;
    const detail = detailFromPayload(payload, response.status);
    log.warn('agent responded with an error', {
      status: response.status,
      detail,
      path,
    });
    throw new AgentApiError(response.status, detail, retryAfter);
  }

  return payload;
};

// POST /chat
// Body carries the message and, when continuing a conversation, the thread id
// returned by a previous response.
export const postChat = async (message, threadId, apiKey) => {
  const body = {
    message,
    llm: {
      provider: llmProvider,
      model: llmModel,
    },
    options: {
      return_code: returnCode,
      max_tool_calls: maxToolCalls,
    },
  };
  if (threadId) {
    body.thread_id = threadId;
  }
  return await request(
    '/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    apiKey,
  );
};

// POST /files/presign_upload
// Requests a presigned url for uploading a file directly from the browser.
// Requires the agent to be running with an S3 artifact backend.
export const presignUpload = async (file, threadId, apiKey, contentType) => {
  const body = {
    filename: file.name,
    size_bytes: file.size,
    content_type: contentType,
  };
  if (threadId) {
    body.thread_id = threadId;
  }
  return await request(
    '/files/presign_upload',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    apiKey,
  );
};

// Uploads the file bytes to the presigned url. This request goes to object
// storage, not to the agent, so the bucket must permit PUT and OPTIONS from
// this origin. A cross-origin rejection surfaces as a generic TypeError, which
// is translated into a message naming the likely cause.
export const putToPresignedUrl = async (file, upload) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    requestTimeoutMs,
  );

  let response;
  try {
    response = await fetch(upload.url, {
      method: upload.method || 'PUT',
      headers: upload.headers || {},
      body: file,
      signal: controller.signal,
    });
  } catch (e) {
    window.clearTimeout(timeoutId);
    log.error('presigned upload failed at the network level', { error: e });
    throw new AgentApiError(
      0,
      'The file could not be uploaded. If the agent returned a storage upload url, the bucket may not allow uploads from this site.',
    );
  }

  window.clearTimeout(timeoutId);

  if (!response.ok) {
    throw new AgentApiError(
      response.status,
      `The file could not be uploaded (HTTP ${response.status}).`,
    );
  }
};

// GET /threads/{threadId}/messages
// Used to restore a conversation when the panel is reopened.
export const getThreadMessages = async (threadId, apiKey, limit) => {
  const query = `?limit=${encodeURIComponent(String(limit || 200))}&offset=0`;
  return await request(
    `/threads/${encodeURIComponent(threadId)}/messages${query}`,
    { method: 'GET' },
    apiKey,
  );
};

export default {
  postChat,
  getThreadMessages,
  presignUpload,
  putToPresignedUrl,
};
