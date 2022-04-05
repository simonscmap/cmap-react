import * as communityActionTypes from '../actionTypes/community';

export const errorReportSend = (errorText, browserInfo, osInfo) => ({
  type: communityActionTypes.ERROR_REPORT_SEND,
  payload: {
    errorText,
    browserInfo,
    osInfo,
  },
});
