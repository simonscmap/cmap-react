export default () => ({
    gridContext: {},
    context: {
        getAuditReport: () => ({data: []}),
        column: {
            colId: 'var_temporal_res',
        },
        sheet: 'data',
        textAreaLookup: () => 5,
        selectOptions: {
            var_temporal_res: [],
            var_discipline: [],
            var_sensor: [],
            var_spatial_res: [],
            dataset_make: [],
        },
        auditCell: () => {}
    },
    columnDefs: {},
    column: {
        colId: 'var_temporal_res',
    }
});
