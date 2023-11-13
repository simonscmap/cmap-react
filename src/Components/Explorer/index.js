import React, { useEffect, useState } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import api from '../../api/api';
import { homeTheme, colors } from '../Home/theme';
import Plotly from 'react-plotly.js';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: '100vw',
    height: '100vh',
    margin: '-21px 0 0 0',
    background: colors.gradient.slate2,
  },
  alignmentWrapper: {
    margin: '0 auto',
    maxWidth: '1900px',
    paddingTop: '200px',
    color: 'white',
    textAlign: 'left',
    '& table': {
      textAlign: 'left',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    gap: '3em',
    justifyContent: 'flex-start'
  }
}));

const processData = (data) => {
  console.log ('processing', data);
  const input = [];
  Object.keys(data).forEach((k) => {
    const [lat, lon] = k.split(',');
    const name = `lat${lat},lon${lon}`;
    input.push({
      type: "scattergl",
      mode: "line",
      x: data[k].x.map((s) => {
        const [yr, mo] = s.split(', ');
        const newX = new Date(yr, mo);
        return newX;
      }),
      y: data[k].y,
      name,
      line: {
        color: 'rgba(0, 0, 0, 0.2)',
      }
    });
  });
  return input;
}

const TestComponent = () => {
  const cl = useStyles();

  const user = useSelector((s) => s.user);
  const history = useHistory();

  const [data, setData] = useState (null);
  const [reqDuration, setReqDuration] = useState (0);
  const [marshDuration, setMarshDuration] = useState (0);
  const [procDuration, setProcDuration] = useState (0);

  useEffect(() => {
    if (!user) {
      return;
    }
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

  const layout = {
    title: 'Title of the Graph',
    xaxis: {
      title: 'x-axis title'
    },
    yaxis: {
      title: 'y-axis title'
    },
    showlegend: false
  };

  if (!user) {
    history.push('/');
  }

  console.log (data);

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={cl.mainWrapper}>
        <div className={cl.alignmentWrapper}>
          <h1>Test Component</h1>
          <div className={cl.content}>
    {data ? <div><Plotly data={data} layout={layout} /></div> : 'No data'}

    <div>
            {data ?
              <table>
                <thead>
                  <tr>
                    <th>operation</th>
                    <th>duration (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>request</th>
                    <th>{reqDuration}</th>
                  </tr>
                  <tr>
                    <th>marshall</th>
                    <th>{marshDuration}</th>
                  </tr>
                  <tr>
                    <th>processing</th>
                    <th>{procDuration}</th>
                  </tr>
                  <tr>
                    <th>TOTAL</th>
                    <th>{((reqDuration + marshDuration + procDuration) / 1000).toLocaleString()} seconds</th>
                  </tr>

                </tbody>
              </table>
              : ''
            }
    </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default TestComponent;

export const testPageConfig = {
  route: '/test',
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Left',
};
