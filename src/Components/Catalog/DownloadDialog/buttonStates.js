// key off button state
import states from '../../../enums/asyncRequestStates';

// Button State
export const buttonStates = {
  notTried: 'not-tried',
  checkInProgress: 'in-progress',
  checkFailed: 'failed',
  checkSucceededAndDownloadAllowed: 'allowed',
  checkSucceededAndDownloadProhibited: 'prohibited',
};

export const downloadButtonText = {
  [buttonStates.notTried]: 'Awaiting Size Check',
  [buttonStates.checkInProgress]: 'Size Check In Progress',
  [buttonStates.checkFailed]: 'Download',
  [buttonStates.checkSucceededAndDownloadAllowed]: 'Download',
  [buttonStates.checkSucceededAndDownloadProhibited]: 'Disabled Due To Size'
}

// Download Button Messages
export const validationMessages = {
  [states.inProgress]: 'Estimating Query Size ...',
  [states.notTried]: '',
  [states.failed]: 'Unable to determine query size. Download may fail due to size.',
};
