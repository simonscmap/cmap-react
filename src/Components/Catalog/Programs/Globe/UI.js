import React, { Component } from 'react';

import { polygonSymbol, polylineSymbol } from './invariants';

// UI Components
class UIComponents extends Component {
  constructor(props) {
    super(props);
    this.sketchModel = new props.esriModules.SketchViewModel({
      layer: props.regionLayer,
      view: props.view,
      polygonSymbol,
      polylineSymbol,
      defaultUpdateOptions: {
        toggleToolOnClick: false,
        tool: 'transform',
      },
    });
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

export default UIComponents;
