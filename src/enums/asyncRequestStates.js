// Enum for async requests.
const states = {
  notTried: 'notTried',
  inProgress: 'inProgress',
  streaming: 'streaming',
  processing: 'processing',
  failed: 'failed',
  succeeded: 'succeeded',
  expired: 'expired',
};

export default Object.freeze(states);

export const hasFailed = (s) => s === states.failed;
export const hasSucceeded = (s) => s === states.succeeded;
