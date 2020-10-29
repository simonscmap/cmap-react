import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Scene } from '@esri/react-arcgis';

import CruiseSelector from './CruiseSelector';
import colors from '../../Enums/colors';

import Draggable from 'react-draggable';

import { throttle } from 'throttle-debounce';

const styles = (theme) => ({
    container: {
        margin: '0 auto 0 auto',
        width: '100vw',
        height: '100vh',
    }
})

// const drawButtonStyles = (theme) => ({
//     outerDiv: {
//         // padding:'12px 0 12px 0',
//         backgroundColor: 'transparent',
//         // width: '180px',
//         borderRadius: '4px',
//         marginRight: '20px',
//         position: 'fixed',
//         top: '60px',
//         right: '12px',
//     },

//     drawButton: {
//         // border: '1px solid #333333',
//         border: `1px solid #333333`,
//         borderRadius: '4px',
//         color: colors.primary,        
//         cursor: 'pointer',
//         padding: '6px',
//         width: '160px',
//         fontSize:'14px',
//         backgroundColor: colors.backgroundGray,
//         boxShadow: '1px 1px 1px 1px #242424',
//         // backgroundColor: 'rgba(255, 128, 0, .8)',
//         // backgroundColor: 'transparent',
//         fontFamily: '"Avenir Next W00","Helvetica Neue",Helvetica,Arial,sans-serif',
//         '&:hover': { 
//             borderColor: 'white'
//         },
//     },

//     helpText: {
//         marginTop: 0,
//         color: 'white',
//         fontFamily: '"Avenir Next W00","Helvetica Neue",Helvetica,Arial,sans-serif'
//     },

//     cancelButton: {
//         display: 'none',
//         color: 'white'
//     }
// })

// const DrawButtonRaw = (props) => {
//     const { classes, showHelp } = props;

//     return (
//         <Draggable>
//             <div className={classes.outerDiv} id='draw-region-div'>
//                 {showHelp && <p className={classes.helpText}>Click once to draw <br/>and again to finish</p>}
//                 <button id='draw-button' className={classes.drawButton}>
//                     Select Region
//                 </button>
//                 <button id='cancel-button' className={`${classes.drawButton} ${classes.cancelButton}`}>
//                     Cancel
//                 </button>
//             </div>
//         </Draggable>
//     )
// }

// const DrawButton = withStyles(drawButtonStyles)(DrawButtonRaw);

const polygonSymbol = {
    type: "polygon-3d",
    symbolLayers: [
        {
            type: "fill",
            material: {
            color: [0, 255, 255, .3]
            },
            outline: {
                color: [0, 255, 255, 1],
                size: '2px'
            }
        }
    ]
};

const polylineSymbol = {
    type: "line-3d",
        symbolLayers: [
            {
                type: "line",
                size: "3px",
                material: {
                    color: {
                        r: 0,
                        g: 255,
                        b: 255,
                        a: 0
                    }
                },
            }
        ]
}

class UiComponents extends React.Component {

    constructor(props) {
        super(props);
        this.sketchModel = new props.esriModules.SketchViewModel({
            layer: props.regionLayer,
            view: props.view,
            polygonSymbol,
            polylineSymbol,
            defaultUpdateOptions: {
                toggleToolOnClick: false,
                tool: "transform"
            }
        })
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        return false;
    }

    render() {
        const { view, esriModules, regionLayer, setShowHelp } = this.props;
        var { sketchModel } = this;

        // var drawButton = document.getElementById('draw-button');
        // var cancelButton = document.getElementById('cancel-button');

        const throttledUpdate = throttle(75, (event) => {
            if(event.state === 'active'){
                this.props.updateDomainFromGraphicExtent(esriModules.Utils.webMercatorToGeographic(event.graphic.geometry.extent));
            }
        })

        sketchModel.on("create", (event) => {
            if(event.state === 'active' && event.toolEventInfo && event.toolEventInfo.type === 'vertex-add'){
                sketchModel.complete();
            }

            if(event.graphic && event.graphic.visible) {
                event.graphic.visible = false;
            }
            if(event.state === 'cancel'){
                setShowHelp(false);
                // drawButton.style.display = 'inline-block';
                // cancelButton.style.display = 'none';
            }

            if(event.state === "complete") {
                setShowHelp(false);
                this.props.updateDomainFromGraphicExtent(esriModules.Utils.webMercatorToGeographic(event.graphic.geometry.extent));
                // drawButton.style.display = 'inline-block';
                // cancelButton.style.display = 'none';
            }
        });

        sketchModel.on('create', throttledUpdate)

        sketchModel.on('update', (event) => {
            if(event.toolEventInfo && event.toolEventInfo.type === 'move-stop'){
                if(event.state === 'cancel') return;
                this.props.updateDomainFromGraphicExtent(event.graphics[0].geometry.extent);
                // drawButton.style.display = 'inline-block';
                // cancelButton.style.display = 'none';
            }
        });   
        
        // drawButton.addEventListener("click", (event) => {
        //         regionLayer.removeAll();
        //         setShowHelp(true);
        //         sketchModel.create('polyline', {
        //             mode:'click'            
        //         });
        //         drawButton.style.display = 'none';
        //         cancelButton.style.display = 'inline-block';
        // });

        // cancelButton.addEventListener('click', (event) => {
        //     sketchModel.cancel();
        //     setShowHelp(false);
        //     // drawButton.style.display = 'inline-block';
        //     cancelButton.style.display = 'none';
        // })

        // view.ui.add('draw-region-div', 'bottom-right');
        // view.ui.add('cruise-selector', 'top-right');

        view.ui.remove('zoom');
        view.ui.remove('navigation-toggle');
        view.ui.remove('compass');
        view.ui.remove('attribution');

        return null;
    }
}

const TrajectoryController = React.memo((props) => {
    const { cruiseTrajectory, trajectoryLayer, esriModules } = props;
    
    if(cruiseTrajectory){
        const { lons, lats } = cruiseTrajectory;

        let midIndex = Math.floor(lons.length / 2);

        trajectoryLayer.removeAll();

        var polyLines = [[]];
        var lineIndex = 0;

        let lonStart = lons[0];
        let latStart = lats[0];
        let maxDistance = 0;

        // Create a new path array each time 180 lon is crossed
        lons.forEach((lon, i) => {
            let lat = lats[i];

            let latDistance = Math.abs(lat - latStart);
            let _lonDistance = Math.abs(lon - lonStart);
            let lonDistance = _lonDistance > 180? 360 - _lonDistance : _lonDistance;

            let distance = Math.sqrt(latDistance * latDistance + lonDistance * lonDistance);
            maxDistance = distance > maxDistance ? distance : maxDistance;

            polyLines[lineIndex].push([lon, lat]);

            if(i < lons.length - 1){
                if((lon > 160 && lon < 180) && (lons[i + 1] > -180 && lons[i + 1] < -160)){
                    polyLines.push([]);
                    lineIndex ++;
                }

                if((lon > -180 && lon < -160) && (lon[i + 1] > 160 && lon[i + 1] < 180)){
                    polyLines.push([]);
                    lineIndex ++;
                }
            }
        })

        var cruiseTrajectorySymbol = {
            type: 'line-3d',
            symbolLayers: [{
                type: 'line',
                material: { color: [0, 255, 255, 1] },
                cap:  'round',
                join: 'round',
                size: 2
            }]
        }

        polyLines.forEach(line => {

            let cruiseTrajectoryGeometry = {
                type: 'polyline',
                paths: line
            }

            let graphic = new esriModules.Graphic({
                geometry: cruiseTrajectoryGeometry,
                symbol: cruiseTrajectorySymbol
            });

            trajectoryLayer.add(graphic);
        })

        try {
            const center = [lons[midIndex], lats[midIndex]];

            var zoom = 7 - Math.floor(maxDistance / 6);            
    
            props.view.goTo({
                target: center,
                zoom
            }, {
                maxDuration: 2500,
                speedFactor: .5
            });    

        } catch(e) {console.log(e)}

    } else {
        trajectoryLayer.removeAll();

        props.view.goTo({
            target: [-140, 30],
            zoom: 3
        }, {
            maxDuration: 2500,
            speedFactor: .5
        }); 
    }
    return '';
})

class MapContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
            showHelp: false
        }
        this.regionLayer = new props.esriModules.GraphicsLayer();
        this.trajectoryLayer = new props.esriModules.GraphicsLayer();
    }

    render = () => {
        const { classes, esriModules, spParams, cruiseTrajectory, globeUIRef } = this.props;


        const lat1 = parseFloat(spParams.lat1);
        const lat2 = parseFloat(spParams.lat2);
        const lon1 = parseFloat(spParams.lon1);
        let _lon2 = parseFloat(spParams.lon2);
        const lon2 = _lon2 < lon1 ? _lon2 + 360 : _lon2;

        this.regionLayer.removeAll();

        var polygon = {
            type: 'polygon', 
            rings: [
                [lon1, lat1],
                [lon2, lat1],
                [lon2, lat2],
                [lon1, lat2],
                [lon1, lat1]
            ]
        };

        let regionGraphic = new esriModules.Graphic({
            geometry: polygon,
            symbol: polygonSymbol
        })

        this.regionLayer.add(regionGraphic);

        return (
            <div className={classes.container} id='found-you'>
                <Scene
                    mapProperties={{ 
                        basemap: 'satellite',
                        layers: [
                            this.regionLayer,
                            this.trajectoryLayer
                        ],

                    }}
                    viewProperties={{
                        center: [-140, 30],
                        zoom: 3,
                        highlightOptions: {
                            haloOpacity: 0,
                            haloColor: 'rgba(0, 0, 0, 0)',
                            fillOpacity: 0,
                            color: "rgba(0, 0, 0, 0)"
                        }
                    }}
                >
                    <TrajectoryController 
                        cruiseTrajectory={cruiseTrajectory}
                        trajectoryLayer={this.trajectoryLayer}
                        esriModules={esriModules}
                    />
                    <UiComponents
                        updateDomainFromGraphicExtent = {this.props.updateDomainFromGraphicExtent}
                        esriModules={esriModules}
                        measurementPositions={this.props.measurementPositions}
                        regionLayer={this.regionLayer}
                        setShowHelp={(showHelp) => this.setState({...this.state, showHelp})}
                        ref={globeUIRef}
                    />
                </Scene>

                {/* <DrawButton showHelp={this.state.showHelp}/> */}
                <CruiseSelector updateParametersFromCruiseBoundary={this.props.updateParametersFromCruiseBoundary} showCruiseControl={this.props.showCruiseControl}/>
            </div>            
        )
    }
}

export default withStyles(styles)(MapContainer);