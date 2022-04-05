# Visualization Pages

Visualization pages are responsible for the globe model, as well as the charts and plots graphics.

The component entry point for visualization pages is `Visualization.js`. It includes its own router, switching between three components: a modal module selector (`ModuleSelector.js`), the main entry point for Charts and Plots (`VizControlPanel.js`), and the Cruise Explorer (`CruiseSelector.js`).


## Charts

What components are responsible for what parts of Charts?

The options located at the top of a plot or chart, and arranged in a horizontal row which includes the download button, is defined in the `ChartControlPanel.js` module. Each distinct chart type imports the Chart Control Panel and includes it in its render.

The "Mode Bar" is a feature of Plotly, and its contents are mostly automatic (based on the plot type), but can be configured in the main config object for the Plot.

# [Up to Components](../components-doc.md)
