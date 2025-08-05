# API

The API module exports a thin wrapper around calls to the cmap-node API. It exports named categories of api calls:

- catalog
- community
- data
- dataSubmission
- user
- visualization
- news
- notifications
- highlights
- bulkDownload

In some cases, for example visualizations, the response is parsed before returning to the caller. Most calls are straightforward fetches, and error handling and subsequest behavior is handled in redux sagas.

Note: catching thrown errors is especially important in this web app, because redux saga will cease operation if a thrown error is not caught within one of its sagas. Most `await fetch...` calls have been wrapped in try/catch, but there mays still be some that are not, and when discovered they should be rendered safe.

## Visualizations

As mentioned above, the api calls that provide data to visualizations behave differently. As rows are streamed back from the database, specific data classes (defined in `src/api`, for example `src/api/SectionMapData.js`) are instantited. These data classes also do some processing. Careful attention is required when making changes to these classes. For example, different kinds of data have differently ordered columns in their responses (see the variance between monthly climatology data and non-climatology data; alse the difference between datasets without depth and those with depth).

## Error Handling

There is not a standard procedure for error handling, as mentioned above. However, several of the sub modules in `/src/api` use a utility to automatically wrap each function in a try/catch block; see `/src/api/safeApi.js`.

## Consistency

Needs of various api calls differ, so there is not consistency across these fetch wrappers. For example, some of the wrappers in `/src/api/catalogRequests.js` just return the awaited fetch (see `datasetNames` as an example). But others get the response and resolve the json or text content of the response and return that (see `getDatasetFeatures` as an example).

The `/src/api/visualizationRequests.js` have the most customized handling; they pipe the body (with `body.getReader` into `CSVParser` which feeds parsed lines of response to the data model constructor. See for example `variableSampleVisRequest`, which powers the sample visualizations. The `cruiseTrajectoryRequest` api wrapper in the same module also has custom data processing implemented there in the wrapper.
