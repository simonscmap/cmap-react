import React, { useState } from 'react';
import { connect } from 'react-redux';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import ChartControlPanel from './ChartControlPanel';

import colors from '../../Enums/colors';
import chartBase from '../../Utility/chartBase';
import handleChartDateString from '../../Utility/handleChartDatestring';

import { setLoadingMessage } from '../../Redux/actions/ui';
import { csvFromVizRequestSend } from '../../Redux/actions/visualization';

import SparseScatter from './SparseScatter';

const handleSparseMap = (infoObject, palette, zValues) => {

    const { parameters, metadata } = infoObject;

    const date = parameters.dt1 === parameters.dt2 ? handleChartDateString(parameters.dt1) :
        handleChartDateString(parameters.dt1) + ' to ' + handleChartDateString(parameters.dt2);

    const lat = parameters.lat1 === parameters.lat2 ? parameters.lat1 + '\xb0' :
        parameters.lat1 + '\xb0 to ' + parameters.lat2 + '\xb0';

    const lon = parameters.lon1 === parameters.lon2 ? parameters.lon1 + '\xb0' :
        parameters.lon1 + '\xb0 to ' + parameters.lon2 + '\xb0';

    const depth = !infoObject.hasDepth ? 'Surface' :
        parameters.depth1 === parameters.depth2 ? `${parameters.depth1}[m]` :
        `${parameters.depth1}[m] to ${parameters.depth2}[m]`;

    return (
        <Plot
            style= {{
                position: 'relative',
                // display:'inline-block',
                width: '60vw',
                height: '40vw',
                minWidth: '510px',
                minHeight: '340px'
            }}
            
            useResizeHandler={true}
            
            data={[
                {   
                    zauto: false,
                    zmin: zValues[0],
                    zmax: zValues[1],
                    lon: infoObject.lons,
                    lat: infoObject.lats,
                    z: infoObject.variableValues,
                    autocolorscale: false,
                    colorscale: palette,
                    radius: 6,                    
                    name: `${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`,
                    type: 'densitymapbox',
                    
                    colorbar: {
                        title: {
                            text: `[${infoObject.metadata.Unit}]`
                        },
                        exponentformat: 'power'
                    },
                }
            ]}

            layout= {{
                ...chartBase.layout,
                title: {
                    text: `${metadata.Dataset_Name}` +
                        `<br>${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name} [${metadata.Unit}]` + 
                        `<br>${date}, ` + 
                        depth + 
                        `<br>Lat: ${lat}, ` +
                        `Lon: ${lon}`,
                    font: {
                        size: 12
                    }
                },
                mapbox: {
                    style: "white-bg",
                    layers: [
                        {
                            sourcetype: "raster",
                            source: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
                            below: "traces"
                        }
                    ],
                    center: infoObject.center,
                    zoom: infoObject.zoom
                },

                annotations: chartBase.annotations(infoObject.metadata.Distributor, metadata.Data_Source)
            }}
            
            config={{
                ...chartBase.config,
                mapboxAccessToken:
                  "pk.eyJ1IjoiZGVuaG9sdHoiLCJhIjoiY2p1ZW9obTNhMDVxZjQzcDRvMmdlcDN2aiJ9.HvLaX2bcradeE5T-lpTc8w",
                
              }}
        />)
}


const styles = theme => ({
    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white'
    },

    buttonBlock: {
        display:'block'
    },

    tabs: {
        marginBottom: theme.spacing(2)
    },

    tab: {
        boxShadow: '1px 1px 1px 1px #242424',
        fontSize: '15px',
        textTransform: 'none',
        color: theme.palette.primary.main
    }
})

const mapDispatchToProps = {
    setLoadingMessage,
    csvFromVizRequestSend
}

function tabProps(index) {
    return {
      id: `sparse-tab-${index}`,
      'aria-controls': `sparse-tab-${index}`,
    };
  }

const SparseTabPanel = (props) => {
    const { children, selectedTab, index, controlPanelProps } = props;

    return (
        <div hidden={selectedTab !== index}>
            <ChartControlPanel
                {...controlPanelProps}
                chart={props.chart}
            />
            {children}
        </div>
    )
}


const SparseMap = React.memo((props) => {

    const { classes, csvFromVizRequestSend } = props;
    const { data } = props.chart;
    const { metadata } = data;

    const [palette, setPalette] = useState('Heatmap');
    const [zValues, setZValues] = useState([data.zMin, data.zMax]);
    const [markerOptions, setMarkerOptions] = useState({opacity: .7, color:'#ff1493', size: 6});
    const [tab, setTab] = useState(0);

    const plot = handleSparseMap(data, palette, zValues)

    const handlePaletteChoice = (option) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setPalette(option);
        }, 100)
    }

    const handleZValueConfirm = (values) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setZValues(values);
        }, 100)
    }

    const handleTabChange = (event, newValue) => {
        setTab(newValue)
    }

    const downloadCsv = () => {
        csvFromVizRequestSend(data, metadata.Table_Name, metadata.Variable, metadata.Long_Name);
    }

    const handleMarkerOptionsConfirm = (values) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setMarkerOptions(values);
        }, 100)
    }

    const forceResize = () => {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 30);        
    }

    const controlPanelProps = {
        map: {
            palette,
            handlePaletteChoice,
            zValues,
            handleZValueConfirm,
            downloadCsv
        },

        scatter: {
            downloadCsv,
            markerOptions,
            setMarkerOptions,
            handleMarkerOptionsConfirm
        }
    }
    
    return (
        <div>
            <Tabs 
                value={tab} 
                onChange={handleTabChange} 
                aria-label="Sparse tabs" 
                centered
                indicatorColor='primary'
                className={classes.tabs}
            >
                <Tab label="Map" {...tabProps(0)} className={classes.tab} onClick={forceResize}/>
                <Tab label="By Time" {...tabProps(1)} className={classes.tab}/>
                <Tab label="By Lat" {...tabProps(2)} className={classes.tab}/>
                <Tab label="By Lon" {...tabProps(3)} className={classes.tab}/>
                {data.hasDepth && <Tab label="By Depth" {...tabProps(4)} className={classes.tab}/>}
            </Tabs>
            <SparseTabPanel selectedTab={tab} index={0} controlPanelProps={controlPanelProps.map} chart={props.chart}>
                {tab === 0 && plot}
            </SparseTabPanel>
            
            <SparseTabPanel selectedTab={tab} index={1} controlPanelProps={controlPanelProps.scatter} chart={props.chart}>
                {tab === 1 &&
                    <SparseScatter
                        xValues={data.times}
                        yValues={data.variableValues}
                        markerOptions={markerOptions}
                        infoObject={data}
                        xTitle='Time'
                        yTitle={`${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name} [${metadata.Unit}]`}
                        type='time'
                    />
                }
            </SparseTabPanel>

            <SparseTabPanel selectedTab={tab} index={2} controlPanelProps={controlPanelProps.scatter} chart={props.chart}>
                {tab === 2 &&
                    <SparseScatter
                        xValues={data.lats}
                        yValues={data.variableValues}
                        markerOptions={markerOptions}
                        infoObject={data}
                        xTitle='Latitude'
                        yTitle={`${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`}
                        type='latitude'
                    />                
                }
            </SparseTabPanel>

            <SparseTabPanel selectedTab={tab} index={3} controlPanelProps={controlPanelProps.scatter} chart={props.chart}>
                {tab === 3 && 
                    <SparseScatter
                        xValues={data.lons}
                        yValues={data.variableValues}
                        markerOptions={markerOptions}
                        infoObject={data}
                        xTitle='Longitude'
                        yTitle={`${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`}
                        type='longitude'
                    />                
                }
            </SparseTabPanel>

            {data.hasDepth &&
                <SparseTabPanel selectedTab={tab} index={4} controlPanelProps={controlPanelProps.scatter} chart={props.chart}>
                    {tab === 4 &&
                        <SparseScatter
                            xValues={data.variableValues}
                            yValues={data.depths}
                            markerOptions={markerOptions}
                            infoObject={data}
                            xTitle={`${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`}
                            yTitle='Depth[m]'
                            type='depth'
                        />                    
                    }
                </SparseTabPanel>            
            }
                
        </div>
    )
})

export default connect(null, mapDispatchToProps)(withStyles(styles)(SparseMap));