// api/community
import { apiUrl, postOptions } from './config';

const communityAPI = {};

communityAPI.errorReport = async (formData) => {
  return await fetch(apiUrl + '/api/community/errorreport', {
    ...postOptions,
    body: JSON.stringify(formData),
  });
};

export default communityAPI;
