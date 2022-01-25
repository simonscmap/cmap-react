// generic data requests
import { apiUrl, fetchOptions } from './config';

const dataAPI = {};

dataAPI.customQuery = async (query) => {
  if (!query) {
    console.log(`customQuery reqeived no arguments`);
    return null;
  }

  let response = await fetch(
    apiUrl + `/api/data/query?query=${query}`,
    fetchOptions,
  );

  return response
};

export default dataAPI;
