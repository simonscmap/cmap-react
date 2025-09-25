import { apiUrl, fetchOptions, postOptions, deleteOptions } from './config';

const collectionsAPI = {};

collectionsAPI.getUserCollections = async (userId) => {
  let endpoint = apiUrl + `/api/collections/user/${userId}`;
  return await fetch(endpoint, fetchOptions);
};

collectionsAPI.getPublicCollections = async () => {
  let endpoint = apiUrl + '/api/collections/public';
  return await fetch(endpoint, fetchOptions);
};

collectionsAPI.deleteCollection = async (collectionId) => {
  let endpoint = apiUrl + `/api/collections/${collectionId}`;
  return await fetch(endpoint, deleteOptions);
};

collectionsAPI.trackPreview = async (collectionId) => {
  let endpoint = apiUrl + `/api/collections/${collectionId}/preview`;
  return await fetch(endpoint, postOptions);
};

collectionsAPI.trackCopy = async (collectionId) => {
  let endpoint = apiUrl + `/api/collections/${collectionId}/copy`;
  return await fetch(endpoint, postOptions);
};

export default collectionsAPI;
