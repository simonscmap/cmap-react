import XLSX from 'xlsx';

import createTestWorkbook from '../../TestUtils/createTestWorkbook';
import formatDataSheet from '../../../Utility/DataSubmission/formatDataSheet';

describe('Correctly formats dates', () => {
    test('Handle excel date serialization formats', () => {
        let wb = createTestWorkbook.excelDate();
        let data = XLSX.utils.sheet_to_json(wb.Sheets['data'], {defval: null});
        let formatted = formatDataSheet(data, wb);

        expect(formatted[0].time).toMatch(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/);

    });

    test('Handle valid dates with alternate formats', () => {
        let wb = createTestWorkbook.alternateDateFormat();
        let data = XLSX.utils.sheet_to_json(wb.Sheets['data'], {defval: null});
        let formatted = formatDataSheet(data, wb);
        expect(formatted[0].time).toMatch(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/);
    });
});