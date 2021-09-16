

/**
 *  Shift a dt (string datetime) by `delta` days.
 * --------
 * 
 * @param {string} dt - datetime string. 
 * @param {number} delta - integer number of days to add to `dt`. 
 */
function dtShiftByDay(dt, delta) {
    let dtObj = new Date(dt);
    dtObj.setDate(dtObj.getDate() + delta);
    return dtObj.toISOString().substr(0, 19)
}




/**
 *  Check if dt (string datetime) is within startDT (string datetime) and endDT (string datetime)
 * --------
 * 
 * @param {string} dt - datetime string. 
 * @param {string} startDT - beginning of the datetime range. 
 * @param {string} endDT - end of the datetime range. 
 */
function isWithin(dt, startDT, endDT) {
    dt = new Date(dt);
    startDT = new Date(startDT);
    endDT = new Date(endDT);
    return ! (dt < startDT || dt > endDT)
}




/**
 *  Return month of dt (string datetime)
 * --------
 * 
 * @param {string} dt - datetime string. 
 */
function getMonth(dt) {
    return (new Date(dt).getMonth()) + 1
}




/**
 *  Construct a SQL query to return the average, standard-deviation, and `count` of each variables constrained by
 *  the bounding-box defined by `time`, `lat`, `lon`, `depth`, `timeTolerance`, `latTolerance`, `lonTolerance`, 
 *  and `depthTolerance` parameters.
 * 
 * --------
 * 
 * @param {string} table - table name to sample from.
 * @param {Array.<string>} table - field names (variables) to sample. All variables should belong to `table`.
 * @param {string} time - sampling time. 
 * @param {number} lat - sampling latitude [-90, 90] °N. 
 * @param {number} lon - sampling longitude [-180, 180] °E.   
 * @param {number} depth - sampling depth [m]  
 * @param {number} timeTolerance - sampling temporal tolerance [days].   
 * @param {number} latTolerance - sampling spatial tolerance in meridional direction [°].   
 * @param {number} lonTolerance - sampling spatial tolerance in zonal direction [°].   
 * @param {number} depthTolerance - sampling spatial tolerance in vertical direction [m].   
 * @param {boolean} hasDepth - true if `table` has depth field, otherwise false.   
 * @param {boolean} isClimatology - true if `table` represents a climatological dataset, otherwise false.   
 * @param {boolean} climatologFallback - if true, sample the corresponding climatology field if the sampling time is outside the dataset temporal coverage.   
 * @param {string} startTime - dataset start time.
 * @param {string} endTime - dataset end time.
 */
export function singleSampleQuery(table, variables, time, lat, lon, depth, 
                                  timeTolerance, latTolerance, lonTolerance, depthTolerance, 
                                  hasDepth, isClimatology, climatologFallback, 
                                  startTime, endTime
                                  ) {             
        lat = Number(lat);
        lon = Number(lon);
        depth = Number(depth);
        timeTolerance = Number(timeTolerance);
        latTolerance = Number(latTolerance);
        lonTolerance = Number(lonTolerance);
        depthTolerance = Number(depthTolerance);
        let inTimeRange = true;
        if (!isClimatology) { inTimeRange = isWithin(time, startTime, endTime) }

        let selectClause = variables.reduce(
                                            (fields, field) => fields + `AVG(${field}) ${field}, STDEV(${field}) ${field}_std, COUNT(${field}) ${field}_count, `
                                            , 
                                            'SELECT '
                                            );
        selectClause = selectClause.substr(0, selectClause.length-2) + ` FROM ${table}`;
        let timeClause = ` WHERE [time] BETWEEN '${dtShiftByDay(time, -timeTolerance)}' AND '${dtShiftByDay(time, timeTolerance)}' `
        if  ( (!inTimeRange && climatologFallback) || isClimatology) { timeClause = ` WHERE [month]=${getMonth(time)} ` }   
        let latClause = ` AND lat BETWEEN ${lat-latTolerance} AND ${lat+latTolerance} `;
        let lonClause = ` AND lon BETWEEN ${lon-lonTolerance} AND ${lon+lonTolerance} `;
        let depthClause = '';
        if (hasDepth) { depthClause = ` AND depth BETWEEN ${depth-depthTolerance} AND ${depth+depthTolerance} ` }
        return selectClause + timeClause + latClause + lonClause + depthClause            
}