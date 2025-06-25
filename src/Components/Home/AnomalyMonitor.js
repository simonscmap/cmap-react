import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// Keep the Redux imports but we won't actively use them
import { useDispatch } from 'react-redux';
import Plotly from 'react-plotly.js';
import { Skeleton } from '@material-ui/lab';
// Keep the imports but we won't actively use them - commented out code references these
// import states from '../../enums/asyncRequestStates';
// import {
//   requestAvgSSTAnomalyDataSend,
//   requestAvgADTAnomalyDataSend,
// } from '../../Redux/actions/data';
import dayjs from 'dayjs';
import Papa from 'papaparse';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: '100%',
  },
  viz: {
    margin: '.5em 0',
    padding: '2em 2em 2em 0em',
    textAlign: 'left',
  },
  placeholder: {
    width: '100%',
    height: '550px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  left: {
    paddingRight: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  right: {
    height: '550px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '10px',
  },
}));

const margin = {
  b: 40,
  l: 30,
  r: 10,
  t: 50,
  pad: {
    l: 30,
    r: 30,
  },
};

const layout = {
  autosize: false,
  width: 1180,
  height: 600,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  title: {
    text: 'Globally Averaged Anomalies',
    font: {
      size: 24,
      color: 'rgb(105, 255, 242)',
    },
  },
  margin,
  hoverlabel: {
    bgcolor: 'rgba(0,0,0,0.8)',
  },
  xaxis: {
    type: 'date',
    automargin: true,
    title: {
      text: 'Time [Monthly]',
      standoff: 30,
    },
    titlefont: { size: 16 },
    color: 'rgb(105, 255, 242)',
    gridcolor: 'rgba(105, 255, 242, 0)',
    layer: 'above traces',
    zeroline: false,
    showline: true,
    linewidth: 3,
    zerolinecolor: '#ffffff',
    zerolinewidth: '2px',
    mirror: 'ticks',
    tickformatstops: [
      {
        dtickrange: [null, 'M12'],
        value: '%b %Y',
      },
      {
        dtickrange: ['M12', null],
        value: '%Y',
      },
    ],
  },
  yaxis: {
    title: {
      text: 'Sea Surface Temperature Anomaly [°C]',
      standoff: 30,
    },
    automargin: true,
    titlefont: { size: 16 },
    color: 'rgb(105, 255, 242)',
    gridcolor: 'rgba(105, 255, 242, 0)',
    zeroline: false,
    zerolinecolor: '#ffffff',
    zerolinewidth: '2px',
    showline: true,
    linewidth: 3,
    mirror: 'ticks',
  },
  showlegend: false,
  shapes: [
    {
      type: 'line',
      x0: 0,
      y0: 0,
      y1: 0,
      x1: new Date(),
      line: {
        color: '#ffffff',
      },
    },
  ],
};

const Placeholder = (props) => {
  const { status, width } = props;
  const cl = useStyles();

  return (
    <div className={cl.placeholder}>
      <div className={cl.left}>
        <Skeleton variant="rect" width={30} height={468}></Skeleton>
      </div>
      <div className={cl.right}>
        <Skeleton variant="rect" width={400} height={30}></Skeleton>
        <Skeleton
          variant="rect"
          width={width - 100}
          height={550 - 80}
        ></Skeleton>
        <Skeleton variant="rect" width={width - 100} height={30}></Skeleton>
      </div>
    </div>
  );
};

const AnomalyMonitor = (props) => {
  const { dim } = props;
  // const dispatch = useDispatch();
  const cl = useStyles();

  // Keep these selectors for reference but we won't use them
  /* 
  const avgSSTReqStatus = useSelector((s) => s.avgSstReqStatus);
  const avgADTReqStatus = useSelector((s) => s.avgAdtReqStatus);
  const avgSSTDataFromRedux = useSelector((s) => s.avgSSTData);
  const avgADTDataFromRedux = useSelector((s) => s.avgADTData);
  */

  // State for local data
  const [avgSSTData, setAvgSSTData] = useState(null);
  const [avgADTData, setAvgADTData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Comment out the original data fetching logic but keep it for reference
  /*
  useEffect(() => {
    if (avgSSTReqStatus === states.notTried) {
      dispatch(requestAvgSSTAnomalyDataSend());
    }
  }, [avgSSTReqStatus]);

  useEffect(() => {
    if (avgADTReqStatus === states.notTried) {
      dispatch(requestAvgADTAnomalyDataSend());
    }
  }, [avgADTReqStatus]);
  */

  // Function to process CSV data into the format expected by Plotly
  const processCSVData = (data, unitString, color) => {
    if (!data || data.length === 0) {
      return null;
    }

    const dates = data.map((row) => new Date(row.date));
    const values = data.map((row) => parseFloat(row.value));

    return [
      {
        type: 'scattergl',
        mode: 'line',
        hovertemplate: `Time: %{x|%b, %Y}<br>Anomaly: %{y:.3f} ${unitString}<extra></extra>`,
        x: dates,
        y: values,
        line: {
          color: color || 'rgba(161, 246, 64, 1)',
          width: 5,
        },
      },
    ];
  };

  // Load local CSV data
  useEffect(() => {
    setIsLoading(true);

    // Load SST data
    fetch('/data/sst_anomaly_data.csv')
      .then((response) => response.text())
      .then((csvText) => {
        const results = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });

        const sstData = processCSVData(results.data, '°C');
        setAvgSSTData(sstData);

        // Load ADT data after SST data is loaded
        return fetch('/data/adt_anomaly_data.csv');
      })
      .then((response) => response.text())
      .then((csvText) => {
        const results = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });

        const adtData = processCSVData(
          results.data,
          'm',
          'rgba(105, 255, 242, 1)',
        );
        setAvgADTData(adtData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading anomaly data:', error);
        setIsLoading(false);
      });
  }, []);

  const [dualLayout, setDualLayout] = useState(null);

  const dualLayoutTemplate = JSON.parse(JSON.stringify(layout));

  useEffect(() => {
    if (avgSSTData && avgADTData) {
      const sortedSSTDates = avgSSTData[0].x
        .slice()
        .map((d) => d.toISOString())
        .sort();
      const startDate = sortedSSTDates.shift();
      const endDate = sortedSSTDates.pop();
      setDualLayout({
        ...dualLayoutTemplate,
        width: dim.width - 100,
        xaxis: {
          ...dualLayoutTemplate.xaxis,
          range: [
            dayjs(startDate).subtract(10, 'M').toDate(),
            dayjs(endDate).add(10, 'M').toDate(),
          ], // gives chart area padding along x axis
        },
        yaxis: {
          ...dualLayoutTemplate.yaxis,
          color: 'rgba(161, 246, 64, 1)',
        },
        yaxis2: {
          ...dualLayoutTemplate.yaxis,
          title: {
            text: `Absolute Dynamic Topography Anomaly [m]`,
            standoff: 30,
          },
          overlaying: 'y',
          side: 'right',
          zeroline: false,
        },
        shapes: null,
        // showlegend: true,
      });
    }
  }, [avgSSTData, avgADTData, dim]);

  const config = { displayLogo: false };

  return (
    <div className={cl.mainWrapper} id="monitor">
      <div className={cl.viz}>
        {isLoading && <Placeholder width={dim.width} />}
        {!isLoading && avgSSTData && avgADTData && (
          <div>
            <Plotly
              data={[avgSSTData[0], { ...avgADTData[0], yaxis: 'y2' }]}
              layout={dualLayout}
              config={config}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyMonitor;
