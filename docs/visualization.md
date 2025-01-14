# Visualization Pages

Contents
1. Caveats
2. How Charts Work
   - Data Flow
   - Control Panel
   - Date Handling
   - Param Lock
   - Chart Controls
   - Plotly
3. How Cruise Trajectories Work

Visualization pages are responsible for the globe model, plotly charts, and trajectory plots.

Additionally, users can download data for any chart.

Finally, cruise detail pages are linked through the cruise trajectory interface, and those detail pages are currently the only access to the bulk-download feature.

The component entry point for visualization pages is `Visualization.js`. It includes its own router, switching between three components: a modal module selector (`ModuleSelector.js`), the main entry point for Charts and Plots (`VizControlPanel.js`), and the Cruise Explorer (`CruiseSelector.js`).

## Caveats

Be aware, when working with code in `/src/Components/Visualization/`, that some adaptations have been made in order to place visualizations on the dataset detail and program detail pages.

## How Charts Work

In brief, the charts page allows users to pick a variable to visualize, specify contraints and choose a visualization type, then requests the data and processes the data in order to provide it in the necessary format & with the necessary options to plotly.

### Data Flow

1. origination

Visualization is cicked off by the `VizControlPanel.js` component. The control panel's `handleVisualize` method dispatches one of two actions, depending on the type of data, ether a request for sparse data or a stored procedure.

2. saga calls api

The sagas responsible for fetching the data are `storedProcedureRequest` or `sparseDataQuerySend`  in `/src/Redux/sagas/index.js`.

3. response data is processed by data class

The data is processed by instantiating the approprate data model (defined in `/src/api/`), according to what the type of visualization is -- this mapping is implemented in the api wrapper in `/src/api/visualizationRequests.js` and is as follows: the stored procedure can be 1 of 4 types (see `/enums/storedProcedures`): `sectionMap`, `timeSeries`, `spaceTime`, and `depthProfile`. Note that  `spaceTime` has a subType `Sparse`. Thus, when the response is complete, the model is instantiated and returned from the api wrapper to the calling saga.

4. processed data is provided to redux

The saga finally places the processed data on the store under the `charts` key

5. chart render

The Charts component responds to the array of charts from redux and renders each chart.

Specifically, the component tree for chart rendering:

- Visualization `/src/Components/Visualization/Visualization.js`
  - Charts `/src/Components/Visualization/Charts/Charts.js`
    - ChartWrapper `/src/Components/Visualization/Charts/ChartWrapper.js`
      - SparseMap | Histogram | SpaceTimeChart | TimeSeriesChart | DepthProfileChart | SectionMapChart; all in ``/src/Components/Visualization/Charts/`
        - ChartTemplate `/src/Components/Visualization/Charts/ChartTemplate.js`

Notes on the responsibilities of these components:

- `Visualization` contains both charts and cruise trajectories and manages routing between them; it also renders the ARCGIS globe
- `Charts` pulls data from redux and provides the data to the ChartWrapper
- `ChartWrapper` decides which type of chart component should be used and renders it
- The various chart type components modify the basic plotly configuration object according to their specific needs and pass it to the ChartTemplate; they also instantiate the appropriate controls and pass an array of controls to the ChartTempalet
- `ChartTemplate` handles a number of things:
  1. renders both the standard and the injected controls; among the standard controls are the ability for the user to download the chart data as CSV
  2. hands the configuration to the plotly component (note that some charts have controls that allow the user to "split" the chart into multpile charts, according to date or depth, therefore the ChartTemplate also detects this and maps over the potentially multiple plotly config objects)
  3. implements the "hints" feature
  4. handles the "tabs" feature for space time plots, in which multiple charts are organized into preset tabs; it also persists which tab is selected, so that the same tab remains open across render cycles

### Control Panel

The control panel (`/src/Components/Visualization/VizControlPanel.js`) is responsible for allowing the user to (1) select a variable to visualize, (2) select spatio-temporal constraints for the visualization, (3) select the type of visualization.

Variable selection involves querying the variable catalog with various possible filters.

Selecting constraints is *not* straightforword, due first of all to differences in parameters across datasets (especially time: climatology datasets have the month as their time parameter, while not-climatology datasets have datetimes; also, some datasets have depth and others do not); secondly due to the param-lock feature which allows the user to "lock" the current constraints in place, with the idea that it will aid in the ability to render charts for several variables all with the same coverage; and thirdly because as constraints are set, queries are sent to the API to check if the comibanation of constraint and variable will result in too-large a query.

Note that if the user is not logged in, the Guest visualization feature will limit the number of visualizations allowed. The counter is implemented in the passport middleware.

#### Date Handling

Date handling in the Control Panel is somewhat fragile. Variables may be part of a monthly climatology dataset, which have month values as dates (0 - 11), or a non-climatology dataset with date times. There are two sets of form fields controlling these values, one is rendered for variable with monthly values, the other with variables with date times. The component state determining the start and end time *switches* type depending on the variable. It could be a '1' or it could be an ISO String.

See the use of `generateVariableSampleRangeParams.js`.

When the Param Lock feature is enabled, or when it has just been disabled, converting between two date types is necessary. See especially the `handleChangeInputValue` method on the class component. This implements the update to the field value by splitting the date time into parts and isolating the part that needs to change. This process uses defaults when there is a lack of data, and handles cases where the component state is not yet set.

After trouble with bugs, a package date picker is now used for selecting date and time in the Control Panel. It does not handle timezone, so it always displays in the user's system time. In order to counteract the conversion that happens (all dates are stored as UTC in CMAP), we detect the date and make an offset. See `shiftMinMaxDate` in `/src/Components/Visualization/ControlPanel/handleChangeFormInput.js`.

#### Param Lock

The Control Panel has a feature called "Param Lock" that allows the user to lock the spatio-temporal constraints selected in the the panel across different variable selections.

The toggle state of paramLock is persisted in redux as `viz.chart.controls.paramLock`.

When `paramLock` is enabled, it changes the default behavior upon variable selection. The form fields determining the constraints (e.g., Start Date, End Date, Start Lat, etc.) are controlled fields, that is: their value is provided by the components--in this case the values are persisted with component state (note that `VisControlPanel` is still a class component); when a variable is selected its min and max values for each extent are taken from its metadata and set in component state. The Param Lock prevents this, and does so at the level of the `setState` call in `componentDidUpdate`. When `paramLock` is enabled it also *disables* the form fields.

One of the design drawbacks, and the source of various bugs, is that the way state is persisted prevents the component from analyzing where current constraints came from: whether they are from the current variable or the previous.

### Chart Controls

Chart Controls are the custom buttons that appear on the top of rendered charts. They include the control for removing a chart, downloading a CSV of the data in the chart, and several visual options.

The chart control components are defined in `/src/Components/Visualization/Charts/ChartControls/`, they are imported as needed into to the various Chart type components, and then provided as a list of controls to the `ChartTemplate`, which finally provides them to the `ChartControlPanel`, where they are rendered.

Each chart control component should use the `ControlButtonTemplate`, which handles the style (active and inactive) for each button, as well as the tooltip.

Additionally, each chart control at generally requires its parent to pass it some sort of state and setState property, which its parent (a chart) can use to alter the appearance of the chart. An exception to this general rule is the DownloadCSV button, which just requires the data to put into the CSV blob.

In order to streamline the creation and instantiation of chart control buttons, we have a `GenericToggleControl` component (and further, a `makeGenericToggleControl` function, which uses partial application to allow for certain parameters to be passed provided in advance, leaving only the essential `state` and `setState` params to be provided in the chart component itself).

### Plotly

One caveat about the use of plotly is that we have had bugs trying to get the sizing of the charts to work correctly when the window is resized; manual tests should be done when updating charts to ensure there isn't a regression.

## How Cruise Trajectories Work

The component structure for Cruise Trajectories is not top-down. The `Visualization` component will render the `CruiseSelector` if the route is `/visualization/cruises`; that component only handles selection.

For the actual drawing of trajectories onto the globe, `Visualization` renders `MapContainer` which in turn renders the `TrajectoryController`, which is responsible for drawing trajectories onto the esri globe.

The Legend is rendered by the `CruiseSelector`, and is only visible when trajectories have been selected.

These components communicate via redux; the legend and the trajectories only render if there is trajectory data in redux. The trajectories are stored at `state.cruiseList`.

When trajectories are first rendered, the first one is used to orient the map, or "zoom". The Legend allows the user to select a trajectory and center the map on it. This is accomplished by dispatching a

### Esri

The esri package is licensed, but the domain restriction must me managed elsewhere, because unlike ag-grid there is no api that the App calls to register its use.

The esri package is a react wrapper around the arcgis core, and there have been many issues getting a correct reference to the globe instance via react refs--or perhaps the esri documentation is misleading, it can be hard to tell. Two refs are created in `Visualization`, a `globeUIRef` and a `mapContainerRef`.

The `golbeUIRef` is provided to the `TrajectoryController`, but its use there has been commented out as innefective. It is also provided to `UiComponents` but is not used. Instead the `view` instance, and the `trajectoryLayer` instance is the operative reference to the globe api.

The `mapContainerRef` is used by the `VizControlPanel`.

### Downsampling

The resolution of trajectory data varies, and trajectory data can be very large. It can also be insignificant, for example in the case where a ship is maintaining its position over a long period of time.

In order to render multiple trajectories without taking too many resources, the `TrajectoryController` downsamples the data, based on the number of longitude values. This is implemented in the `renderTrajectory` function in the `TrajectoryController`.
