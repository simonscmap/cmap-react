# Overview of `catalog` contents

The contents of /catalog are responsible for 3 main features

- the catalog search page
- the dataset detail page
- the download dialog (see [Download Dialog](download-dialog.md))

## Catalog Search

The catalog search function is driven a hybrid state model; the (a) queryString stored in the `window.location.search` value, along with (b) the `sumbissionOptions` in redux, and (c) `searchResults` in redux.

The `CatalogSearch.js` component only handles updating the value of `window.location.search`. It DOES NOT dispatch any redux actions.

The `SearchResults.js` component pulls in the state of `searchResults` from the redux store and renders each via the `SearchResult.js` component. It also dispatches the redux action `searchResultsFetch` whenever its `props.location.search` changes; this is done via `useEffect`. This value is provided to the component via `react-router`, and is "usually taken from the current browser URL" (https://v5.reactrouter.com/web/api/Route/location-object).

The `searchResultsFetch` action is handled in the main Saga of the same name. It calls the api with the `queryString` from the `window.location.search` as its only arg. But it also processes the results before dispatching `searchResultsStore`. It returns not only the list of matching datasets, but an updated set of potential options, which are the basis of the UI in the `CatalogSearch.js` component. It does this by scanning the list of results (which are a list of dataset metadata objects), and building up a set of existing properties on the narrowed list of matches; thus only really possible options are displayed in the search UI. This has pros and cons (namely you cannot see unavailable options).

### What is the difference between `searchOptions` and `submissionOptions`?

`submissionOptions` is set by `buildSearchOptionsFromDatasetList` and the catalog reducer `searchResultsStore`. By default it is the result of calling `buildSearchOptionsFromValiableList([])`.

### Search Logic and Search UX

The catalog search query treats filter options as a logical `OR`, e.g. if the user selects two types of Sensor the query will return any datasets matching either Sensor type.

The UX of the web app is mixed in its use of implied logical `OR` vs `AND`. If an option within a set (such as `Make`, `Sensor`, or `Region`) has been selected, that set of options is not narrowed any further (as long as at least one option within the set is selected). But if a set has no selected option, its displayed options will be narrowed by any other set's selections. For example, if a Region is selected then only those Sensors available on datasets matching that Region will be shown. This narrowing will continue until an option within the Set is selected. The UX uses an implied `AND` to narrow options of sets that are unconstrained, but provides an un-narrowed set of options to the user otherwise. All options submitted to the seach query, as mentioned above, are used with logical `OR` in the query.
