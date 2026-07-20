// Helpers for attaching an uploaded file to a message, and for displaying long
// urls compactly.
//
// The agent's chat request carries only a message string: there is no field for
// an attachment. An uploaded file is therefore referenced by appending a
// delimited json block to the message, which the agent recognises. This matches
// the protocol used by the reference client at simonscmap.ai.

const OPEN_TAG = '[CMAP_FILE]';
const CLOSE_TAG = '[/CMAP_FILE]';
const BLOCK_PATTERN = /\n*\[CMAP_FILE\]\s*[\s\S]*?\s*\[\/CMAP_FILE\]\n*/g;

// Keep only the fields the agent needs to locate the uploaded object, dropping
// anything empty so the block stays small.
export const sanitizeArtifactForHint = (artifact, file) => {
  const candidate = {
    type: artifact.type || 'file',
    filename: artifact.filename || file.name,
    backend: artifact.backend,
    content_type: artifact.content_type || guessContentType(file),
    url: artifact.url,
    uri: artifact.uri,
    expires_in: artifact.expires_in,
    s3_bucket: artifact.s3_bucket,
    s3_key: artifact.s3_key,
    s3_uri: artifact.s3_uri,
    size_bytes: artifact.size_bytes || file.size,
  };

  const result = {};
  Object.keys(candidate).forEach(function (key) {
    const value = candidate[key];
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  });
  return result;
};

// The instruction accompanying the artifact tells the agent to treat it as a
// data source rather than a file path, which is what makes colocalization work.
const HINT_INSTRUCTIONS =
  'If the user requests colocalization, use this exact source_artifact object ' +
  'with cmap.colocalize. Do not convert it to a string path. If the user ' +
  'explicitly says to use an existing CMAP table as the source dataset ' +
  'instead, follow the user instruction.';

export const appendFileHint = (message, artifact) => {
  const payload = {
    source_artifact: artifact,
    instructions: HINT_INSTRUCTIONS,
  };
  const block = `${OPEN_TAG}\n${JSON.stringify(payload, null, 2)}\n${CLOSE_TAG}`;
  const base = (message || '').trim();
  return base.length > 0 ? `${base}\n\n${block}` : block;
};

// The hint block is machine-facing. It is removed before a message is shown, so
// the conversation reads as the user wrote it. This also applies to messages
// restored from the agent, which contain the block as it was sent.
export const stripFileHints = (content) =>
  (content || '').replace(BLOCK_PATTERN, '\n').trim();

export const guessContentType = (file) => {
  if (file.type && file.type.trim().length > 0) {
    return file.type;
  }
  const lower = (file.name || '').toLowerCase();
  if (lower.lastIndexOf('.csv') === lower.length - 4) {
    return 'text/csv';
  }
  return 'application/octet-stream';
};

// Presigned urls run to hundreds of characters. Rendering one as link text
// floods the panel, so a readable label is derived instead: the file name when
// the url points at one, otherwise the host.
export const compactUrlLabel = (href) => {
  if (!href) {
    return '';
  }
  let withoutQuery = href.split('?')[0];
  let label = withoutQuery;

  try {
    const parsed = new URL(href, window.location.origin);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const last = segments.length ? segments[segments.length - 1] : '';
    label = last || parsed.hostname;
  } catch (e) {
    const segments = withoutQuery.split('/').filter(Boolean);
    label = segments.length ? segments[segments.length - 1] : withoutQuery;
  }

  label = decodeURIComponent(label);

  if (label.length > 48) {
    return `${label.slice(0, 45)}...`;
  }
  return label;
};

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) {
    return '';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
