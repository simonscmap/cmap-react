// Enum for async requests.

const states = {
    notTried: 'notTried',
    inProgress: 'inProgress',
    failed: 'failed',
    succeeded: 'succeeded',
    expired: 'expired'
}

export default Object.freeze(states);
