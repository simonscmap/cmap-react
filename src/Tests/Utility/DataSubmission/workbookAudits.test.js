import workbookAudits from '../../../Components/DataSubmission/Helpers/workbookAudits';
import createTestWorkbook from '../../TestUtils/createTestWorkbook';

describe('Workbook level validations correctly identify errors', () => {
  test('Missing sheets check works', () => {
    let wb = createTestWorkbook.missingSheets();
    let { errors } = workbookAudits({workbook: wb});
    // the wb is missing more than one sheet
    // if it were only missing one, the title would be "Workbook is missing worksheet"
    let containsMissingSheetError = errors.some (e =>
      e && e.title === 'Workbook is missing worksheets');
    expect(containsMissingSheetError).toBeTruthy();
  })
})
