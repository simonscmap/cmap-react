import XLSX from 'xlsx';
import path from 'path';

import formatDataSheet from '../../../Components/DataSubmission/Helpers/formatDataSheet';

describe('Time Column in programatic.xlsx Tests', () => {
    let workbook;
    let rawData;
    let formattedData;

    beforeAll(() => {
        // Load the actual XLSX file from the directory
        const xlsxFilePath = path.join(__dirname, 'bug.xlsx');
        workbook = XLSX.readFile(xlsxFilePath);
        
        // Get the data from the 'data' sheet
        rawData = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval: null});
        const { data } = formatDataSheet(rawData, workbook);
        formattedData = data;
    });

    test('Data sheet contains time column', () => {
        expect(rawData.length).toBeGreaterThan(0);
        expect(rawData[0]).toHaveProperty('time');
    });

    test('All time values are processed correctly', () => {
        // Verify each row has a time value
        formattedData.forEach(row => {
            expect(row).toHaveProperty('time');
            
            // Check that each time is in ISO format or has been properly formatted
            const timeValue = row.time;
            
            if (typeof timeValue === 'string') {
                // ISO format regex
                const isoRegex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})?$/;
                expect(timeValue).toMatch(isoRegex);
            } else if (typeof timeValue === 'number') {
                // If it's still a number, it should be a valid Excel date number
                expect(timeValue).toBeGreaterThan(0);
            }
        });
    });

    test('Inspect time column values in raw data', () => {
        // Log all the time values from the XLSX file for inspection
        console.log('Time column values from programatic.xlsx:');
        rawData.forEach((row, index) => {
            console.log(`Row ${index + 1}: ${row.time} (${typeof row.time})`);
        });
        
        // Check that we have different time formats in the test data
        const timeFormats = rawData.map(row => typeof row.time);
        const uniqueFormats = [...new Set(timeFormats)];
        console.log('Unique time format types:', uniqueFormats);
        
        // At least some values should be numbers (Excel date format)
        const hasNumericDates = rawData.some(row => typeof row.time === 'number');
        expect(hasNumericDates).toBe(true);
    });

    test('Numeric time values are converted to ISO strings', () => {
        // Check that Excel numeric dates were converted to ISO strings
        const numericDates = rawData.filter(row => typeof row.time === 'number');
        
        if (numericDates.length > 0) {
            numericDates.forEach(row => {
                // Find the corresponding formatted row by matching other columns
                const formattedRow = formattedData.find(f => 
                    f.lat === row.lat && f.lon === row.lon && 
                    (f.sample_depth === row.sample_depth || f.Station === row.Station)
                );
                
                expect(formattedRow).toBeDefined();
                expect(typeof formattedRow.time).toBe('string');
                expect(formattedRow.time).toMatch(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])/);
            });
        }
    });
}); 