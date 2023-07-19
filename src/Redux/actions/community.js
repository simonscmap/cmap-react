import * as communityActionTypes from '../actionTypes/community';

export const errorReportSend = (errorText, browserInfo, osInfo, stackFirstLine) => ({
  type: communityActionTypes.ERROR_REPORT_SEND,
  payload: {
    errorText,
    browserInfo,
    osInfo,
    stackFirstLine
  },
});
