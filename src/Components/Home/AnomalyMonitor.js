import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import { useSelector } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import api from '../../api/api';
// import { homeTheme, colors } from '../Home/theme';
import Plotly from 'react-plotly.js';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: '100%'
  },
  viz: {
    margin: '.5em 0',
    padding: '2em 2em 2em 0em',
    textAlign: 'left',
    // background: 'rgba(0,0,0,0.2)',
  }
}));

const processData = (data, unitString) => {
  const input = [];
  Object.keys(data).forEach((k) => {
    const [lat, lon] = k.split(',');
    const name = `${lat},${lon}`;
    input.push({
      type: "scattergl",
      mode: "line",
      hovertemplate: `Lat: ${lat}, Lon: ${lon}<br>Anomaly: %{y} ${unitString}<extra></extra>`,
      x: data[k].x.map((s) => {
        const [yr, mo] = s.split(', ');
        const newX = new Date(yr, mo);
        return newX;
      }),
      y: data[k].y,
      name,
      line: {
        color: 'rgba(161, 246, 64, 0.1)',
      }
    });
  });
  return input;
}

const margin = {
  b: 40,
  l: 30,
  r: 10,
  t: 50,
};
const layout = {
    autosize: false,
    width: 1180,
    height: 600,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    title: {
      text: 'Sea Surface Temperature Anomalies',
      font: {
        size: 18,
        color: 'rgb(105, 255, 242)',
      }
    },
    margin,
    hoverlabel: {
      bgcolor: 'rgba(0,0,0,0.8)'
    },
    xaxis: {
      title: 'Time [Monthly]',
      titlefont: { size: 16 },
      color: 'rgb(105, 255, 242)',
      gridcolor:'rgba(105, 255, 242, 0.5)',
    },
    yaxis: {
      title: 'SST Anomaly [C°]',
      automargin: true,
      titlefont: { size: 16 },
      color: 'rgb(105, 255, 242)',
      gridcolor:'rgba(105, 255, 242, 0.5)',
    },
    showlegend: false
  };

const AnomalyMonitor = (props) => {
  const { dim } = props;

  const cl = useStyles();

  // const user = useSelector((s) => s.user);
  // const history = useHistory();

  const [sstData, setSstData] = useState (null);
  const [adtData, setAdtData] = useState(null);
  const [reqDuration, setReqDuration] = useState (0);
  const [marshDuration, setMarshDuration] = useState (0);
  const [procDuration, setProcDuration] = useState (0);

  useEffect(() => {
    async function fetchData() {
      try {
        const t0 = Date.now();
        let response = await api.data.named('sst');
        setReqDuration(Date.now() - t0);
        if (response.ok) {
          const t1 = Date.now();
          const result = await response.json();
          setMarshDuration (Date.now() - t1);

          const t2 = Date.now();
          const lines = processData(result, 'C°');
          setProcDuration (Date.now() - t2);
          setSstData(lines);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        let response = await api.data.named('adt');
        if (response.ok) {
          const result = await response.json();
          const lines = processData(result, 'm');
          setAdtData(lines);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  useEffect (() => {
    console.log ({
      reqDuration,
      marshDuration,
      procDuration,
    });
  }, [sstData]);

  const sstLayout = JSON.parse (JSON.stringify (layout));
  const adtLayout = JSON.parse (JSON.stringify (layout));
  sstLayout.width = dim.width - 100;
  adtLayout.width = dim.width - 100;
  adtLayout.title.text = 'Absolute Dynamic Topography (ADT) Anomalies';
  adtLayout.yaxis.title = `ADT Anomaly [m]`;

  return (
    <div className={cl.mainWrapper} id='monitor'>
      <div className={cl.viz}>
        {sstData
          ?
          <div><Plotly data={sstData} layout={sstLayout} /></div>
          : <Skeleton width={dim.width - 100 || 500} height={400}></Skeleton>
        }
      </div>
      <div className={cl.viz}>
        {adtData
          ?
          <div><Plotly data={adtData} layout={adtLayout} /></div>
          : <Skeleton width={dim.width - 100 || 500} height={400}></Skeleton>
        }
      </div>
    </div>
  );
}

export default AnomalyMonitor;
