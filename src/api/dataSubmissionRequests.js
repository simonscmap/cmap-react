import { postOptions, apiUrl, fetchOptions } from './config';

const dataSubmissionAPI = {};

dataSubmissionAPI.retrieveSubmissionByUser = async () => {
  return await fetch(
    apiUrl + `/api/datasubmission/submissionsbyuser`,
    fetchOptions,
  );
};

dataSubmissionAPI.retrieveAllSubmissions = async () => {
  return await fetch(apiUrl + `/api/datasubmission/submissions`, fetchOptions);
};

dataSubmissionAPI.addSubmissionComment = async (payload) => {
  return await fetch(apiUrl + '/api/datasubmission/addcomment', {
    ...postOptions,
    body: JSON.stringify(payload),
  });
};

dataSubmissionAPI.beginUploadSession = async (formData) => {
  return await fetch(apiUrl + '/api/datasubmission/beginuploadsession', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
};

dataSubmissionAPI.uploadPart = async (formData) => {
  return await fetch(apiUrl + '/api/datasubmission/uploadfilepart', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
};

dataSubmissionAPI.commitUpload = async (formData) => {
  return await fetch(apiUrl + '/api/datasubmission/commitupload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
};

dataSubmissionAPI.setPhase = async (formData) => {
  return await fetch(apiUrl + '/api/datasubmission/setphase', {
    ...postOptions,
    body: JSON.stringify(formData),
  });
};

dataSubmissionAPI.retrieveCommentHistory = async (payload) => {
  return await fetch(
    `${apiUrl}/api/datasubmission/commenthistory?submissionID=${payload.submissionID}`,
    fetchOptions,
  );
};

dataSubmissionAPI.retrieveMostRecentFile = async (submissionID) => {
  return await fetch(
    `${apiUrl}/api/datasubmission/retrievemostrecentfile?submissionID=${submissionID}`,
    fetchOptions,
  );
};

dataSubmissionAPI.getFileFromLink = async (link) => {
  return await fetch(link);
};

dataSubmissionAPI.deleteSubmission = async (submissionID) => {
  return await fetch(
    `${apiUrl}/api/datasubmission/deletesubmission?submissionID=${submissionID}`,
    fetchOptions,
  );
};

dataSubmissionAPI.checkName = async (payload) => {
  return await fetch(
    `${apiUrl}/api/datasubmission/checkname`, {
      ...postOptions,
      body: JSON.stringify(payload),
    }
  );
}

export default dataSubmissionAPI;
