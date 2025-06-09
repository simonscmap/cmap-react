export const defaultColumnDef = {
  cellStyle: { fontSize: '12px', lineHeight: '38px' },
  menuTabs: [],
  sortable: true,
  filter: true,
  resizable: true,
};

const variableFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
};

const unstructuredMetadataFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  textMatcher: () => {
    return true;
  },
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
        colId: 'variableName',
      },
      {
        headerName: 'Short Name',
        field: 'Variable',
        filter: 'agTextColumnFilter',
      },
      { headerName: 'Sensor', field: 'Sensor' },
      { headerName: 'Unit', field: 'Unit' },
      {
        headerName: 'Comment',
        field: 'Comment',
        tooltipField: 'Comment',
        filter: 'agTextColumnFilter',
        cellRenderer: function (params) {
          if (!params.data.Comment) {
            return '';
          }
          return `<div style="cursor: pointer; font-size: 10px; text-decoration: underline; color: rgb(105, 255, 242);">View comment</div>`;
        },
      },
      {
        headerName: 'Additional Metadata',
        field: 'Unstructured_Variable_Metadata',
        cellRenderer: function (params) {
          let { data } = params; // this is the row data
          if (data.Unstructured_Variable_Metadata) {
            return '<a style="cursor: pointer;">View Metadata</a>';
          } else {
            return '';
          }
        },
        filter: 'agTextColumnFilter',
        filterParams: unstructuredMetadataFilterParams,
      },
    ],
  },

  {
    headerName: 'Coverage',
    children: [
      {
        headerName: 'Lat Start',
        field: 'Lat_Min',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Lat End',
        field: 'Lat_Max',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Lon Start',
        field: 'Lon_Min',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Long End',
        field: 'Lon_Max',
        filter: 'agNumberColumnFilter',
      },
      { headerName: 'Time Start', field: 'Time_Min' },
      { headerName: 'Time End', field: 'Time_Max' },
      {
        headerName: 'Depth Start',
        field: 'Depth_Min',
        filter: 'agNumberColumnFilter',
      },
      {
        headername: 'Depth End',
        field: 'Depth_Max',
        filter: 'agNumberColumnFilter',
      },
    ],
  },

  {
    headerName: 'Table Statistics',
    children: [
      {
        headerName: 'Database Row Count',
        field: 'Variable_Count',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Mean Value',
        field: 'Variable_Mean',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Min Value',
        field: 'Variable_Min',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Max Value',
        field: 'Variable_Max',
        filter: 'agNumberColumnFilter',
      },
      { headerName: 'STD', field: 'Variable_STD' },
      { headerName: '25th Quantile', field: 'Variable_25th' },
      { headerName: '50th Quantile', field: 'Variable_50th' },
      { headerName: '75th Quantile', field: 'Variable_75th' },
      { headerName: 'Keywords', field: 'Keywords', hide: true },
    ],
  },
];
