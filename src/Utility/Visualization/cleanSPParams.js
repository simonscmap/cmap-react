const cleanSPParams = ({depth1, depth2, dt1, dt2, fields, lat1, lat2, lon1, lon2, spName, tableName}) => ({
    depth1: parseFloat(depth1),
    depth2: parseFloat(depth2),
    dt1,
    dt2,
    fields,
    lat1: parseFloat(lat1),
    lat2: parseFloat(lat2),
    lon1: parseFloat(lon1),
    lon2: parseFloat(lon2),
    spName,
    tableName,
})

export default cleanSPParams;