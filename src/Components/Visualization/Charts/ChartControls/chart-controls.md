# Chart Controls /src/Components/Visualization/Charts/ChartControls

Chart Controls are the custom buttons that appear on the top of rendered charts. They include the control for removing a chart, downloading a CSV of the data in the chart, and several visual options.

The chart control components defined in this directory are included pulled in to chart components, and handed off as a list of controls to the `ChartTemplate`, which provides them to the `ChartControlPanel`, where they are rendered.

Each chart control component should use the `ControlButtonTemplate`, which handles the style (active and inactive) for each button, as well as the tooltip.

Additionally, each chart control at generally requires its parent to pass it some sort of state and setState property, which its parent (a chart) can use to alter the appearance of the chart. An exception to this general rule is the DownloadCSV button, which just requires the data to put into the CSV blob.

In order to streamline the creation and instantiation of chart control buttons, we have a `GenericToggleControl` component (and further, a `makeGenericToggleControl` function, which uses partial application to allow for certain parameters to be passed provided in advance, leaving only the essential `state` and `setState` params to be provided in the chart component itself).
