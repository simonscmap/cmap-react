const sparseDataQueryFromPayload = (payload) => {
    let { metadata, parameters } = payload;
    let { dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2, fields } = parameters;
    let depthSelectPart = metadata.Depth_Max ? 'depth, ' : '';
    let depthWherePart = metadata.Depth_Max ? `\nAND depth BETWEEN ${depth1} AND ${depth2}` : '';
    let depthOrderPart = metadata.Depth_Max ? ', depth' : '';

    let query =  `SELECT TOP 1200000 time, lat, lon, ${depthSelectPart}${fields} FROM ${parameters.tableName} WHERE time BETWEEN '${dt1}' AND '${dt2}' AND lat BETWEEN ${lat1} AND ${lat2} AND lon BETWEEN ${lon1} AND ${lon2}${depthWherePart} ORDER BY time, lat, lon${depthOrderPart}`;
    console.log(query);
    return query;
}

export default sparseDataQueryFromPayload;