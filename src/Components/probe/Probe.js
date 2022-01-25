import React from 'react'
import api from '../../api/api';
import { singleSampleQuery } from '../probe/probeUtils';
import useStyle from './probe.style';
import Button from '@material-ui/core/Button';
import { parse } from 'papaparse';

export default function Probe() {

    const handleQuery = () => {
        let table = 'tblPisces_NRT';
        let variables = ['NO3', 'PO4'];
        let time = '2016-01-01';
        let lat = 30;
        let lon = -160;
        let depth = 0;
        let timeTolerance = 4;
        let latTolerance = 0.25;
        let lonTolerance = 0.25;
        let depthTolerance = 5;
        let hasDepth = false;
        let isClimatology = false;
        let climatologFallback = true;
        let startTime = '2011-12-31T00:00:00.000Z';
        let endTime = '2019-04-27T00:00:00.000Z';

        let query = singleSampleQuery(table, variables, time, lat, lon, depth,
                                      timeTolerance, latTolerance, lonTolerance, depthTolerance,
                                      hasDepth, isClimatology, climatologFallback,
                                      startTime, endTime);
        api.data.sqlQuery(query).then((data)=>{console.log(data)})
    }

    const classes = useStyle();

    const onProbeFileSelect = (e) => {
        var file = e.target.files[0];
        console.log(file.size);
        if(!file) return;

        file.text().then(data => {
            data = parse(data, {header: true});
            console.log(data);
            }
            )
    }

    return (
        <div>
            <input
                className={classes.input}
                accept='text/csv'
                id="probe-file-input"
                type="file"
                onChange={onProbeFileSelect}
            />

            <label htmlFor="probe-file-input">
                <Button variant='contained' color="primary" component="span" style={{marginTop:100}}>
                    Select File
                </Button>

            </label>
                <Button variant="contained" onClick={handleQuery} style={{marginTop:100}}> query </Button>

        </div>
    )
}
