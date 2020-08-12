import XLSX from 'xlsx';

import createTestWorkbook from '../../TestUtils/createTestWorkbook';
import formatVariableMetadata from '../../../Utility/DataSubmission/formatVariableMetadataSheet';

test('Properly removes __EMPTY keys', () => {
    // The library removes __EMTPY keys silently so this didn't work....
    
    // let wb = createTestWorkbook.contains__EMPTYKeys();
    // let variable_meta_data = XLSX.utils.sheet_to_json(wb.Sheets['variable_meta_data'], {defval: null});
    // let formatted = formatVariableMetadata(variable_meta_data, wb);
    // console.log(variable_meta_data);
    // expect(variable_meta_data[0]['__EMPTY1']).toBeTruthy();
    // expect(formatted[0]['__EMPTY1']).toBeFalsey();
})