import SPARSE_DATA_QUERY_MAX_SIZE from '../../../enums/sparseDataQueryMaxSize';

const sparseDataQueryFromPayload = (payload) => {
  let { metadata, parameters } = payload;
  let { dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2, fields } = parameters;
  let depthSelectPart = metadata.Depth_Max ? 'depth, ' : '';
  let depthWherePart = metadata.Depth_Max
    ? `\nAND depth BETWEEN ${depth1} AND ${depth2}`
    : '';
  let depthOrderPart = metadata.Depth_Max ? ', depth' : '';

  let query = `SELECT TOP ${SPARSE_DATA_QUERY_MAX_SIZE} time, lat, lon, ${depthSelectPart}${fields} FROM ${parameters.tableName} WHERE ${fields} IS NOT NULL AND time BETWEEN '${dt1}' AND '${dt2}' AND lat BETWEEN ${lat1} AND ${lat2} AND lon BETWEEN ${lon1} AND ${lon2}${depthWherePart} ORDER BY time, lat, lon${depthOrderPart}`;
  return query;
};

export default sparseDataQueryFromPayload;
