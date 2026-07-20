// Renders the artifacts attached to an agent reply.
//
// The agent returns artifacts as loosely typed records. The fields that matter
// here are:
//
//   type          "image", "data", "file", or similar
//   content_type  a mime type, used when `type` is absent
//   url / uri     where the artifact can be fetched
//   filename      display name
//   expires_in    seconds until the link stops working
//
// A url beginning with a slash is relative to the agent host: the local
// artifact backend mounts files under /artifacts, which the agent treats as a
// public path, so images load in an img tag without the API key header. The S3
// backend returns absolute presigned urls instead, which are used as given.

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { agentApiUrl } from '../config';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  image: {
    maxWidth: '100%',
    borderRadius: 'var(--cmap-radius-md, 6px)',
    border: '1px solid var(--cmap-divider)',
    background: 'var(--cmap-neutral-light)',
    display: 'block',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    fontSize: '0.74rem',
    color: 'var(--cmap-text-muted)',
    marginTop: '4px',
  },
  name: {
    wordBreak: 'break-all',
  },
  link: {
    color: 'var(--cmap-primary)',
    textDecoration: 'none',
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    fontSize: '0.78rem',
    color: 'var(--cmap-text-secondary)',
  },
}));

const resolveArtifactUrl = (artifact) => {
  const raw = artifact.url || artifact.uri || '';
  if (!raw) {
    return '';
  }
  if (raw.charAt(0) === '/') {
    return agentApiUrl + raw;
  }
  return raw;
};

const isImage = (artifact) => {
  const type = (artifact.type || '').toLowerCase();
  const contentType = (artifact.content_type || '').toLowerCase();
  return type === 'image' || contentType.indexOf('image/') === 0;
};

const labelFor = (artifact) =>
  artifact.filename || artifact.content_type || artifact.type || 'artifact';

// Expiry is reported in seconds; hours are easier to read for the long-lived
// links the agent issues.
const expiryLabel = (seconds) => {
  if (!seconds) {
    return null;
  }
  if (seconds < 3600) {
    return `expires in ~${Math.round(seconds / 60)} min`;
  }
  return `expires in ~${Math.round(seconds / 3600)} h`;
};

const Artifacts = (props) => {
  const { artifacts } = props;
  const classes = useStyles();

  if (!artifacts || artifacts.length === 0) {
    return null;
  }

  return (
    <div className={classes.container}>
      {artifacts.map((artifact, index) => {
        const url = resolveArtifactUrl(artifact);
        if (!url) {
          return null;
        }

        const label = labelFor(artifact);
        const expiry = expiryLabel(artifact.expires_in);

        if (isImage(artifact)) {
          return (
            <div key={`${label}-${index}`}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={label} className={classes.image} />
              </a>
              <div className={classes.meta}>
                <span className={classes.name}>{label}</span>
                <a
                  className={classes.link}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
                <a className={classes.link} href={url} download={label}>
                  Download
                </a>
                {expiry ? <span>{`(${expiry})`}</span> : null}
              </div>
            </div>
          );
        }

        return (
          <div key={`${label}-${index}`} className={classes.fileRow}>
            <span className={classes.name}>{label}</span>
            <a className={classes.link} href={url} download={label}>
              Download
            </a>
            {expiry ? <span>{`(${expiry})`}</span> : null}
          </div>
        );
      })}
    </div>
  );
};

export default Artifacts;
