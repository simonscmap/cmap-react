import workbookAudits, {
  checkNoDuplicateRows
} from '../../../Components/DataSubmission/Helpers/workbookAudits';
import createTestWorkbook from '../../TestUtils/createTestWorkbook';

const generateRandomizedString = () => {
  return (Math.random() + 1).toString(36).substring(7);
}

const generateRandomizedRow = (keys) => {
  return Object.fromEntries (keys.map ((k) => ([k, generateRandomizedString ()])));
}

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
});

describe ('Check No Duplicate Rows', () => {
  test('works as expected', () => {
    const mockSheet = [
      { one: 1, two: 2, three: 3},
      { one: 1, two: 2, three: 3},
      { one: 1, two: 2, three: 3},
      { one: 1, two: 2, three: 3},
    ];

    const { result } = checkNoDuplicateRows (mockSheet);
    expect (result[0][1]).toEqual([1, 2, 3]);
    expect (result[1][1]).toEqual([0, 2, 3]);
    expect (result[2][1]).toEqual([0, 1, 3]);
  });

  test('works as expected', () => {
    const mockSheet = [
      { one: 1, two: 2, three: 3},
      { one: null, two: null, three: null},
      { one: undefined, two: undefined, three: undefined},
      { one: 0, two: 0, three: 0},
    ];

    const { result } = checkNoDuplicateRows (mockSheet);
    expect (result[0]).toEqual(undefined);  // No rows are identical
  });

  test('works on lots of data', () => {
    const mockSheet = [];
    for (let k = 0; k < 10000; k++) {
      mockSheet.push (generateRandomizedRow (['one', 'two', 'three', 'four', 'five', 'six', 'seven']));
    }

    const { result } = checkNoDuplicateRows (mockSheet);
    expect (result).toBeTruthy();  // No rows are identical
  });

});
