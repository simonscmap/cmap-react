// WARNING: This constant is duplicated in the backend (cmap-node-api/controllers/catalog/variableSampleVisualization.js)
// as BACKEND_SPARSE_DATA_QUERY_MAX_SIZE. The backend's value (10000) is more restrictive and will be the effective limit.
//  On the frontend, its used in query construction, but also rendering logic
// TODO: Consider moving this to a shared configuration or making the frontend aware of the backend's limit.
const SPARSE_DATA_QUERY_MAX_SIZE = 100000; // one hundred thousand

export default SPARSE_DATA_QUERY_MAX_SIZE;
