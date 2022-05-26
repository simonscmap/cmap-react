// API calls are made here. Primarily called in sagas

import catalogRequests from './catalogRequests';
import communityRequests from './communityRequests';
import dataSubmissionRequests from './dataSubmissionRequests';
import userRequests from './userRequests';
import visualizationRequests from './visualizationRequests';
import dataRequests from './dataRequests';
import newsRequests from './news';

const api = {
  catalog: catalogRequests,
  community: communityRequests,
  data: dataRequests,
  dataSubmission: dataSubmissionRequests,
  user: userRequests,
  visualization: visualizationRequests,
  news: newsRequests,
};

export default api;
