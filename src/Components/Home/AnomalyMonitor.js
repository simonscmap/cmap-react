import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Plotly from 'react-plotly.js';
import { Skeleton } from '@material-ui/lab';
import states from '../../enums/asyncRequestStates';
import { requestSSTAnomalyDataSend, requestADTAnomalyDataSend } from '../../Redux/actions/data';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: '100%'
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
  }
}));

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
    type: 'date',
    title: 'Time [Monthly]',
    titlefont: { size: 16 },
    color: 'rgb(105, 255, 242)',
    gridcolor: 'rgba(105, 255, 242, 0.5)',
    layer: 'above traces',
    zeroline: true,
    zerolinecolor: '#ffffff',
    zerolinewidth: '2px',
    tickformatstops: [ {
        "dtickrange": [null, "M12"],
        "value": "%b %Y"
      },
      {
        "dtickrange": ["M12", null],
        "value": "%Y"
      }
    ]
  },
  yaxis: {
    title: 'SST Anomaly [°C]',
    automargin: true,
    titlefont: { size: 16 },
    color: 'rgb(105, 255, 242)',
    gridcolor: 'rgba(105, 255, 242, 0.5)',
    zeroline: true,
    zerolinecolor: '#ffffff',
    zerolinewidth: '2px'
  },
  showlegend: false,
  shapes: [{
      type: 'line',
      x0: 0,
      y0: 0,
      y1: 0,
      x1: new Date(),
      line: {
        color: '#ffffff',
      }
  }],
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
        <Skeleton variant="rect" width={width - 100} height={550 - 80}>
        </Skeleton>
        <Skeleton variant="rect" width={width - 100} height={30}></Skeleton>
      </div>
    </div>
  );
};

const AnomalyMonitor = (props) => {
  const { dim } = props;
  const dispatch = useDispatch ();
  const cl = useStyles();

  const sst = useSelector((s) => s.sstReqStatus);
  const adt = useSelector((s) => s.adtReqStatus);

  const [sstReady, setSSTReady] = useState(false);
  const [adtReady, setADTReady] = useState(false);

  const handleSSTReady = () => {
    setSSTReady(true);
  }
  const handleADTReady = () => {
    setADTReady(true);
  };

  useEffect(() => {
    window.addEventListener("sstAnomalyDataReady", handleSSTReady, false);
    window.addEventListener("adtAnomalyDataReady", handleADTReady, false);
    return () => {
      window.removeEventListener("sstAnomalyDataReady", handleSSTReady, false);
      window.removeEventListener("adtAnomalyDataReady", handleADTReady, false);
    };
  },[]);

  useEffect (() => {
    if (sst === states.notTried) {
      dispatch (requestSSTAnomalyDataSend ());
    }
  }, [sst])

  useEffect (() => {
    if (adt === states.notTried) {
      dispatch (requestADTAnomalyDataSend ());
    }
  }, [adt])

  const zeroline = (trace0) => {
    const { x } = trace0;
    const max = x[0];
    const min = x[x.length - 1];
    return {
      type: 'line',
      x0: min,
      y0: 0,
      y1: 0,
      x1: max,
      line: {
        color: '#ffffff',
      }
    }
  };

  const sstLayout = JSON.parse (JSON.stringify (layout));
  const adtLayout = JSON.parse (JSON.stringify (layout));
  sstLayout.width = dim.width - 100;
  adtLayout.width = dim.width - 100;

  adtLayout.title.text = 'Absolute Dynamic Topography (ADT) Anomalies';
  adtLayout.yaxis.title = `ADT Anomaly [m]`;

  if (sstReady) {
    sstLayout.shapes = [zeroline(window.sstAnomalyData[0])];
    const sample = [...window.sstAnomalyData[0].x].sort()
    const tick0 = sample.pop();

    sstLayout.xaxis.tick0 = tick0;
    sstLayout.xaxis.range = [
      new Date (sample[0]).setFullYear(sample[0].getFullYear() - 3),
      new Date (tick0).setFullYear(tick0.getFullYear() + 4),
    ];
  }

  if (adtReady) {
    adtLayout.shapes = [zeroline(window.adtAnomalyData[0])];
    const tick0 = [...window.adtAnomalyData[0].x].sort().pop();
    adtLayout.xaxis.tick0 = tick0;
  }

  const config = { displayLogo: false };

  return (
    <div className={cl.mainWrapper} id='monitor'>
      <div className={cl.viz}>
        {sstReady
          ? <div><Plotly data={window.sstAnomalyData} layout={sstLayout} config={config} /></div>
          : <Placeholder width={dim.width - 70 } status={sst.requestStatus} />
        }
      </div>
      <div className={cl.viz}>
        {adtReady
          ? <div><Plotly data={window.adtAnomalyData} layout={adtLayout} /></div>
          : <Placeholder width={dim.width - 70 } status={adt.requestStatus} />
        }
      </div>
    </div>
  );
}

export default AnomalyMonitor;
