import { getVariableUMFromParams } from './datagridHelpers';

let parseVariableUnstructuredMetadata = (vum) => {
  let parsed;
  try {
    // sql returns comma separated json objects, but we can't simply
    // split that string on commas, because there are commas within the json
    // objects;
    let arrayifiedVum = `[${vum}]`;
    parsed = JSON.parse(arrayifiedVum);
  } catch (e) {
    console.log('could not parse');
    console.log(vum);
  }
  return parsed;
}

export const defaultColumnDef = {
  cellStyle: { fontSize: '12px', lineHeight: '38px' },
  menuTabs: [],
  sortable: true,
  filter: true,
};

const variableFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
};

const unstructuredMetadataFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  textMatcher: (params) => {
    console.log (getVariableUMFromParams (params))
    return true;
  }
};

export const columnDefs = [
  {
    headerName: 'General Information',
    children: [
      {
        headerName: 'Variable Name',
        field: 'Long_Name',
        tooltipField: 'Long_Name',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        filterParams: variableFilterParams,
      },
      { headerName: 'Short Name', field: 'Variable' },
      { headerName: 'Sensor', field: 'Sensor' },
      { headerName: 'Unit', field: 'Unit' },
      {
        headerName: 'Comment',
        field: 'Comment',
        tooltipField: 'Comment',
        cellRenderer: function (params) {
          if (params.data.Comment) {
            return 'View Comment';
          } else {
            return '';
          }
        }
      },
      {
        headerName: 'Unstructured Metadata',
        field: 'Unstructured_Variable_Metadata',
        cellRenderer: function (params) {
          let { data } = params; // this is the row data
          if (data.Unstructured_Variable_Metadata) {
            return 'View Metadata';
          } else {
            return '';
          }
        },
        filter: 'agTextColumnFilter',
        filterParams: unstructuredMetadataFilterParams,
      }
    ],
  },

  {
    headerName: 'Coverage',
    children: [
      { headerName: 'Lat Start', field: 'Lat_Min' },
      { headerName: 'Lat End', field: 'Lat_Max' },
      { headerName: 'Lon Start', field: 'Lon_Min' },
      { headerName: 'Long End', field: 'Lon_Max' },
      { headerName: 'Time Start', field: 'Time_Min' },
      { headerName: 'Time End', field: 'Time_Max' },
      { headerName: 'Depth Start', field: 'Depth_Min' },
      { headername: 'Depth End', field: 'Depth_Max' },
    ],
  },

  {
    headerName: 'Table Statistics',
    children: [
      { headerName: 'Database Row Count', field: 'Variable_Count' },
      { headerName: 'Mean Value', field: 'Variable_Mean' },
      { headerName: 'Min Value', field: 'Variable_Min' },
      { headerName: 'Max Value', field: 'Variable_Max' },
      { headerName: 'STD', field: 'Variable_STD' },
      { headerName: '25th Quantile', field: 'Variable_25th' },
      { headerName: '50th Quantile', field: 'Variable_50th' },
      { headerName: '75th Quantile', field: 'Variable_75th' },
      { headerName: 'Keywords', field: 'Keywords', hide: true },
    ],
  },
];
