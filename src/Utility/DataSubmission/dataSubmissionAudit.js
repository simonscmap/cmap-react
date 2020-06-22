import audits from './audits';
import checkCell from './checkCell';

const fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);

const auditWorkbook = ({ data, dataset_meta_data, vars_meta_data }) => {
    // Messages that don't pertain to a particular cell

    // check for correct sheets
    // check for mismatch between vars_meta_data short names and data column headers
    
    // check date format?

    let additionalVariables = Object.keys(data[0]).filter(key => !fixedVariables.has(key));
    let metadataVariables = new Set(vars_meta_data.map(e => e.var_short_name));
}

const auditRows = (rows) => {
    //
    let audit = [];

    rows.forEach((row, i) => {
        let rowAudit = {};

        let columns = Object.keys(row);

        columns.forEach((col) => {
            let cellAudit = checkCell(row[col], col);

            if(cellAudit.length){
                rowAudit[col] = cellAudit;
            }
        });

        if(Object.keys(rowAudit).length){
            audit[i] = rowAudit;
        }
    });

    return audit;
}

// Takes a workbook and returns an audit report
export default (state) => {
    const { data, dataset_meta_data, vars_meta_data } = state;

    let report = {
        workbook: auditWorkbook(state),
        data: auditRows(data),
        dataset_meta_data: auditRows(dataset_meta_data),
        vars_meta_data: auditRows(vars_meta_data),
    };

    return report;
}