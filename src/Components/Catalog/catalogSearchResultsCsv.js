import stringify from 'csv-stringify/lib/sync';

export const CATALOG_SEARCH_RESULTS_COLUMNS = [
  'Product_Type',
  'Short_Name',
  'Long_Name',
  'Description',
  'Icon_URL',
  'Dataset_Release_Date',
  'Dataset_History',
  'Dataset_Version',
  'Table_Name',
  'Process_Level',
  'Make',
  'Data_Source',
  'Distributor',
  'Acknowledgement',
  'Dataset_ID',
  'Spatial_Resolution',
  'Temporal_Resolution',
  'Study_Domain',
  'Lat_Min',
  'Lat_Max',
  'Lon_Min',
  'Lon_Max',
  'Depth_Min',
  'Depth_Max',
  'Time_Min',
  'Time_Max',
  'Sensors',
  'Visualize',
  'Row_Count',
  'Regions',
  'References',
  'DataFeatures',
];

const stringifyCatalogSearchResults = (searchResults) =>
  stringify(searchResults, {
    header: true,
    columns: CATALOG_SEARCH_RESULTS_COLUMNS,
  });

export default stringifyCatalogSearchResults;
