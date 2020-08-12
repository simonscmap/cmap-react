import workbookAudits from '../../../Utility/DataSubmission/workbookAudits';
import createTestWorkbook from '../../TestUtils/createTestWorkbook';

describe('Workbook level validations correctly identify errors', () => {
    test('Missing sheets check works', () => {
        let wb = createTestWorkbook.missingSheets();
        let { errors } = workbookAudits({workbook:wb});
        let boolArray = errors.map(e => e.includes('missing required sheet'));
        expect(boolArray).toContain(true);
    })
})