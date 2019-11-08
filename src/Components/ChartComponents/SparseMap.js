import React, { useState } from 'react';
import { connect } from 'react-redux';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import ChartControlPanel from './ChartControlPanel';

import colors from '../../Enums/colors';
import chartBase from '../../Utility/chartBase';

import { setLoadingMessage } from '../../Redux/actions/ui'; 
import SparseScatter from './SparseScatter';

import { format } from 'd3-format';

const handleSparseMap = (infoObject, palette, zValues) => {

    var hovertext = infoObject.variableValues.map((value, i) => {
        let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';

        return `Lat: ${format('.2f')(infoObject.lats[i])}\xb0` +
        `<br>` +
        `Lon: ${format('.2f')(infoObject.lons[i])}\xb0` + 
        '<br>' +
        `${infoObject.parameters.fields}: ${format(formatter)(value)} [${infoObject.metadata.Unit}]`;
    });

    return (
        <Plot
            style= {{
                position: 'relative',
                display:'inline-block'
            }}
            
            data={[
                {   
                    zauto: false,
                    zmin: zValues[0],
                    zmax: zValues[1],
                    lon: infoObject.lons,
                    lat: infoObject.lats,
                    z: infoObject.variableValues,
                    zmin:'',
                    autocolorscale: false,
                    colorscale: palette,
                    radius: 6,                    
                    name: infoObject.parameters.fields,
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
                width: 800,
                height: 570,
                title: `${infoObject.parameters.fields} [${infoObject.metadata.Unit}]`,
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

                annotations: chartBase.annotations(infoObject.metadata.Distributor)
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
        textTransform: 'none'
    }
})

const mapDispatchToProps = {
    setLoadingMessage
}

function tabProps(index) {
    return {
      id: `sparse-tab-${index}`,
      'aria-controls': `sparse-tab-${index}`,
    };
  }

const SparseTabPanel = (props) => {
    const { children, selectedTab, index, controlPanelProps, } = props;
    console.log('A tab panel re-rendered');
    console.log(controlPanelProps)

    return (
        <div hidden={selectedTab !== index}>
            <ChartControlPanel
                // handlePaletteChoice={handlePaletteChoice}
                // handleZValueConfirm={handleZValueConfirm}
                // zValues={zValues}
                // extent={data.extent}
                // downloadCsv={downloadCsv}
                {...controlPanelProps}
            />
            {children}
        </div>
    )
}


const SparseMap = (props) => {

    const { classes } = props;

    const { data } = props.chart;

    const [palette, setPalette] = useState('Heatmap');
    const [zValues, setZValues] = useState([data.zMin, data.zMax]);
    const [markerOptions, setMarkerOptions] = useState({opacity: .7, color:'#ff1493', size: 12});
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
        props.setLoadingMessage('Processing Data');

        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));

            let csv = data.generateCsv();
            const blob = new Blob([csv], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `${data.parameters.fields}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, 100)
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
            <SparseTabPanel selectedTab={tab} index={0} controlPanelProps={controlPanelProps.map}>
                {plot}
            </SparseTabPanel>
            
            <SparseTabPanel selectedTab={tab} index={1} controlPanelProps={controlPanelProps.scatter}>
                <SparseScatter
                    xValues={data.times}
                    yValues={data.variableValues}
                    markerOptions={markerOptions}
                    infoObject={data}
                    xTitle='Time'
                    yTitle={data.parameters.fields}
                    type='time'
                />
            </SparseTabPanel>

            <SparseTabPanel selectedTab={tab} index={2} controlPanelProps={controlPanelProps.scatter}>
                <SparseScatter
                    xValues={data.lats}
                    yValues={data.variableValues}
                    markerOptions={markerOptions}
                    infoObject={data}
                    xTitle='Latitude'
                    yTitle={data.parameters.fields}
                    type='latitude'
                />
            </SparseTabPanel>

            <SparseTabPanel selectedTab={tab} index={3} controlPanelProps={controlPanelProps.scatter}>
                <SparseScatter
                    xValues={data.lons}
                    yValues={data.variableValues}
                    markerOptions={markerOptions}
                    infoObject={data}
                    xTitle='Longitude'
                    yTitle={data.parameters.fields}
                    type='longitude'
                />
            </SparseTabPanel>

            {data.hasDepth &&
                <SparseTabPanel selectedTab={tab} index={4} controlPanelProps={controlPanelProps.scatter}>
                    <SparseScatter
                        xValues={data.variableValues}
                        yValues={data.depths}
                        markerOptions={markerOptions}
                        infoObject={data}
                        xTitle={data.parameters.fields}
                        yTitle='Depth'
                        type='depth'
                    />
                </SparseTabPanel>            
            }
                
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(SparseMap));