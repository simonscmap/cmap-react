import * as dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(LocalizedFormat);

const numberParser = (ev) => {
  const { newValue } = ev;
  return isNaN(newValue) ? null : Number(newValue);
};

const dateParser = (ev) => {
  const { newValue } = ev;
  if (dayjs.utc(newValue).isValid()) {
    return dayjs.utc(newValue).format('YYYY-MM-DD');
  }
  return newValue;
};

const columnDefinitions = {
  data: [
    {
      headerName: 'time',
      field: 'time',
      editable: false,
      // tooltipValueGetter: (...args) => {
      //   console.log ('args', args);
      //  return 'time';
      // }
    },
    {
      headerName: 'lat',
      field: 'lat',
      valueParser: numberParser,
      // type: 'number',
    },
    {
      headerName: 'lon',
      field: 'lon',
      valueParser: numberParser,
      // type: 'number',
    },
    {
      headerName: 'depth',
      field: 'depth',
      valueParser: numberParser,
      // type: 'number',
    },
  ],

  dataset_meta_data: [
    {
      headerName: 'dataset_short_name',
      field: 'dataset_short_name',
      autoHeight: true,
      // tooltipField: 'dataset_short_name',
    },

    {
      headerName: 'dataset_long_name',
      field: 'dataset_long_name',
      autoHeight: true,
      // tooltipField: 'dataset_long_name',
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'dataset_version',
      field: 'dataset_version',
      autoHeight: true,
    },

    {
      headerName: 'dataset_release_date',
      field: 'dataset_release_date',
      autoHeight: true,
      valueParser: dateParser,
    },

    {
      headerName: 'dataset_make',
      field: 'dataset_make',
      autoHeight: true,
      cellEditor: 'DSCellEditorSelect',
      cellRenderer: 'DSCellRenderWithDelete',
    },

    {
      headerName: 'dataset_source',
      field: 'dataset_source',
      autoHeight: true,
    },

    {
      headerName: 'dataset_distributor',
      field: 'dataset_distributor',
      autoHeight: true,
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'dataset_acknowledgement',
      field: 'dataset_acknowledgement',
      autoHeight: true,
      // tooltipField: 'dataset_acknowledgement',
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'dataset_history',
      field: 'dataset_history',
      autoHeight: true,
      // tooltipField: 'dataset_history',
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'Description',
      field: 'dataset_description',
      autoHeight: true,
      tooltipField: 'dataset_description',
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'dataset_references',
      field: 'dataset_references',
      autoHeight: true,
      tooltipField: 'dataset_references',
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'climatology',
      field: 'climatology',
      valueParser: numberParser,
      cellEditor: 'DSCellEditorSelect',
      cellRenderer: 'DSCellRenderWithDelete',
    },

    {
      headerName: 'cruise_names',
      field: 'cruise_names',
      autoHeight: true,
      tooltipField: 'cruise_names',
      cellEditor: 'DSCellEditorTextArea',
    },
  ],

  vars_meta_data: [
    {
      headerName: 'var_short_name',
      field: 'var_short_name',
      autoHeight: true,
      tooltipField: 'var_short_name',
    },

    {
      headerName: 'var_long_name',
      field: 'var_long_name',
      autoHeight: true,
      tooltipField: 'var_long_name',
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'var_sensor',
      field: 'var_sensor',
      autoHeight: true,
      cellEditor: 'DSCellEditorSelect',
    },

    {
      headerName: 'var_unit',
      field: 'var_unit',
      autoHeight: true,
    },

    {
      headerName: 'var_spatial_res',
      field: 'var_spatial_res',
      autoHeight: true,
      cellEditor: 'DSCellEditorSelect',
    },

    {
      headerName: 'var_temporal_res',
      field: 'var_temporal_res',
      autoHeight: true,
      cellEditor: 'DSCellEditorSelect',
    },

    {
      headerName: 'var_discipline',
      field: 'var_discipline',
      autoHeight: true,
      cellEditor: 'DSCellEditorSelect',
    },

    {
      headerName: 'visualize',
      field: 'visualize',
      autoHeight: true,
      cellEditor: 'DSCellEditorSelect',
    },

    {
      headerName: 'var_keywords',
      field: 'var_keywords',
      autoHeight: true,
      tooltipField: 'var_keywords',
      cellEditor: 'DSCellEditorTextArea',
    },

    {
      headerName: 'var_comment',
      field: 'var_comment',
      tooltipField: 'var_comment',
      autoHeight: true,
      cellEditor: 'DSCellEditorTextArea',
    },
  ],
};

export default columnDefinitions;
