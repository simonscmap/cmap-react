import React, { useState } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import ChartControlPanel from './ChartControlPanel';

import colors from '../../Enums/colors';

import { setLoadingMessage } from '../../Redux/actions/ui'; 

const handleSparseMap = (infoObject, palette, zValues) => {

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
                width: 600,
                height: 400,
                font: {color: '#ffffff'},
                title: `${infoObject.parameters.fields}[${infoObject.metadata.Unit}]`,
                // xaxis: {title: 'Longitude', color: '#ffffff'},
                // yaxis: {title: 'Latitude', color: '#ffffff'},
                paper_bgcolor: colors.backgroundGray,

                mapbox: {
                    style: 'basic',
                    center: {
                        lon: (infoObject.parameters.lon1 + infoObject.parameters.lon2) / 2,
                        lat: (infoObject.parameters.lat1 + infoObject.parameters.lat2) / 2
                    }
                },

                annotations: [
                    {
                        text: `Source: ${infoObject.metadata.Distributor.length < 30 ? 
                            infoObject.metadata.Distributor : 
                            infoObject.metadata.Distributor.slice(0,30)} -- Provided by Simons CMAP`,
                        font: {
                            color: 'white',
                            size: 10
                        },
                        xref: 'paper',
                        yref: 'paper',
                        yshift: -202,
                        showarrow: false,
                    }
                ]

            }}
            
            config={{
                mapboxAccessToken:
                  "pk.eyJ1IjoiZGVuaG9sdHoiLCJhIjoiY2p1ZW9obTNhMDVxZjQzcDRvMmdlcDN2aiJ9.HvLaX2bcradeE5T-lpTc8w"
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
    }
})

const mapDispatchToProps = {
    setLoadingMessage
}

const buttonProps = {
    size: 'small',
    color: 'primary',
    variant: 'contained'
}

const SparseMap = (props) => {

    const { classes } = props;

    const { data } = props.chart;
    const [palette, setPalette] = useState('Heatmap');
    const [zValues, setZValues] = useState([data.zMin, data.zMax]);

    const plot = handleSparseMap(data, palette, zValues)

    let handlePaletteChoice = (option) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setPalette(option);
        }, 100)
    }

    let handleZValueConfirm = (values) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setZValues(values);
        }, 100)
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

    return (
        <div>
            <ChartControlPanel
                handlePaletteChoice={handlePaletteChoice}
                handleZValueConfirm={handleZValueConfirm}
                zValues={zValues}
                extent={data.extent}
                downloadCsv={downloadCsv}
            />
            {plot}      
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(SparseMap));