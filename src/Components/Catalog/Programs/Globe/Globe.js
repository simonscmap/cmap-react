// Container for ArcGIS globe. The "scene" component injects control props into its children
import React, { Component, useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Scene } from '@esri/react-arcgis';
import { loadModules } from 'esri-loader';
import Globe from './Scene';

// Globe Container (Load Modules, instantiate Scene)
const loadEsriModules = async (done) => {
  const moduleNames = [
    'AreaMeasurement3D',
    'Search',
    'GraphicsLayer',
    'SketchViewModel',
    'Utils',
    'Graphic',
    'FeatureLayer'
  ];

  const moduleLoadPaths = [
    'esri/widgets/AreaMeasurement3D',
    'esri/widgets/Search',
    'esri/layers/GraphicsLayer',
    'esri/widgets/Sketch/SketchViewModel',
    'esri/geometry/support/webMercatorUtils',
    'esri/Graphic',
    'esri/layers/FeatureLayer',
  ];

  const loadedModules = await loadModules(moduleLoadPaths, { version: '4.14' });

  // create map of { moduleName: loadedModule }
  const esriModules = moduleNames.reduce((acc, curr, index) => {
    acc[curr] = loadedModules[index];
    return acc;
  }, {});

  done (esriModules);
};

const GlobeContainer = (props) => {
  const globeUIRef = React.createRef();
  const mapContainerRef = React.createRef();

  const [esriModules, setEsriModules] = useState(null);

  useEffect (() => {
    loadEsriModules(setEsriModules);
  }, []);

  if (!esriModules) {
    return '';
  } else {
    return (
      <Globe
        globeUIRef={globeUIRef}
        // updateDomainFromGraphicExtent={
        //   this.updateDomainFromGraphicExtent
        // }
        esriModules={esriModules}
        // spParams={this.state.spParams}
        // showCruiseControl={this.state.showCruiseControl}
        // chartControlPanelRef={this.chartControlPanelRef}
        ref={mapContainerRef} // used by the VizControlPanel
      />
    );
  }
}

export default GlobeContainer;
