import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import { useSelector } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import api from '../../api/api';
// import { homeTheme, colors } from '../Home/theme';
import Plotly from 'react-plotly.js';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: '100%'
  }
}));

const processData = (data) => {
  const input = [];
  Object.keys(data).forEach((k) => {
    const [lat, lon] = k.split(',');
    const name = `${lat},${lon}`;
    input.push({
      type: "scattergl",
      mode: "line",
      hovertemplate: `<b>Trace</b><br>Lat: ${lat}, Lon: ${lon}<br>Deviation: %{y} C°<extra></extra>`,
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

const AnomalyMonitor = (props) => {
  const cl = useStyles();

  // const user = useSelector((s) => s.user);
  // const history = useHistory();

  const [data, setData] = useState (null);
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
          const lines = processData(result);
          setProcDuration (Date.now() - t2);
          setData(lines);
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
  }, [data]);

  const layout = {
    autosize: false,
    width: (props && props.dim && props.dim.width - 20) || 1180,
    height: 400,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    title: {
      text: 'Sea Surface Temperature Anomalies',
      font: {
        color: 'rgb(105, 255, 242)',
      }
    },
    hoverlabel: {
      bgcolor: 'rgba(0,0,0,0.8)'
    },
    xaxis: {
      title: 'Time [Monthly]',
      titlefont: { size: 18 },
      color: 'rgb(105, 255, 242)',
      gridcolor:'rgba(105, 255, 242, 0.5)',
    },
    yaxis: {
      title: 'Sea Surface Temperature [C°]',
      automargin: true,
      titlefont: { size: 18 },
      color: 'rgb(105, 255, 242)',
      gridcolor:'rgba(105, 255, 242, 0.5)',

    },
    showlegend: false
  };

  return (
    <div className={cl.mainWrapper} id='monitor'>
      <div>
        {data ? <div><Plotly data={data} layout={layout} /></div> : ''}
      </div>
    </div>
  );
}

export default AnomalyMonitor;
