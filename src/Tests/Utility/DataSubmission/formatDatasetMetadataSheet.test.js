import XLSX from 'xlsx';

import createTestWorkbook from '../../TestUtils/createTestWorkbook';
import formatDatasetMetadata from '../../../Components/DataSubmission/Helpers/formatDatasetMetadataSheet';

describe('Correctly formats dates', () => {
    test('Handle excel date serialization formats', () => {
        let wb = createTestWorkbook.excelDate();
        let metadata = XLSX.utils.sheet_to_json(wb.Sheets['dataset_meta_data'], {defval: null});
        let formatted = formatDatasetMetadata(metadata, wb);

        expect(formatted[0].dataset_release_date).toMatch(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/);
    });

    test('Handle valid dates with alternate formats', () => {
        let wb = createTestWorkbook.alternateDateFormat();
        let metadata = XLSX.utils.sheet_to_json(wb.Sheets['dataset_meta_data'], {defval: null});
        let formatted = formatDatasetMetadata(metadata, wb);

        expect(formatted[0].dataset_release_date).toMatch(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/);
    });
});
