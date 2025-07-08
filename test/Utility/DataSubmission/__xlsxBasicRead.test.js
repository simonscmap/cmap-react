import XLSX from 'xlsx';

import createTestWorkbook from '../../TestUtils/createTestWorkbook';

test('Correctly reads a valid workbook into arrays of JSON', () => {
    let wb = createTestWorkbook.standard();

    let data = XLSX.utils.sheet_to_json(wb.Sheets['data'], {defval: null});
    let dataset_meta_data = XLSX.utils.sheet_to_json(wb.Sheets['dataset_meta_data'], {defval: null});
    let vars_meta_data = XLSX.utils.sheet_to_json(wb.Sheets['vars_meta_data'], {defval: null});

    expect(data.length).toBeTruthy();
    expect(dataset_meta_data.length).toBeTruthy();
    expect(vars_meta_data.length).toBeTruthy();

    expect(Object.keys(data[0]).length).toBeTruthy();
    expect(Object.keys(dataset_meta_data[0]).length).toBeTruthy();
    expect(Object.keys(vars_meta_data[0]).length).toBeTruthy();
});