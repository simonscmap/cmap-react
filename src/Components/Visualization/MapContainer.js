// Container for ArcGIS globe. The "scene" component injects control props into its children

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Scene } from '@esri/react-arcgis';



const styles = (theme) => ({
    container: {
        margin: '0 auto 0 auto',
        width: '100vw',
        height: '100vh',
    }
})

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
        const { view } = this.props;

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

        // polyLines.forEach(line => {

        //     let cruiseTrajectoryGeometry = {
        //         type: 'polyline',
        //         paths: line
        //     }

        //     let graphic = new esriModules.Graphic({
        //         geometry: cruiseTrajectoryGeometry,
        //         symbol: cruiseTrajectorySymbol
        //     });

        //     trajectoryLayer.add(graphic);
        // })






        ///////////////////////////////
        let point = {};
        let markerSymbol = {};
        let pointGraphic = {};

        let downSampleCoeff = Math.floor(lons.length / 1000) + 1;
        lons.forEach((lon, i) => {
            if (i % downSampleCoeff === 0) {
                let lat = lats[i];
                point = {
                    type: "point", 
                    x: lon,
                    y: lat,
                    // z: 1000
                };
        
                markerSymbol = {
                    type: "simple-marker", 
                    // color: [226, 119, 40],
                    color: [0, 255, 255, 1],
                    outline: null,
                    // outline: {
                    //   color: [255, 255, 255],
                    //   width: 0.5,                  
                    // },
                    size: 5
                };
        
                pointGraphic = new esriModules.Graphic({
                    geometry: point,
                    symbol: markerSymbol
                });
                trajectoryLayer.add(pointGraphic);
            }
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
        const { classes, esriModules, cruiseTrajectory, globeUIRef } = this.props;

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
            </div>            
        )
    }
}

export default withStyles(styles)(MapContainer);