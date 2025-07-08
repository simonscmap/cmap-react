import { flattenErrors } from '../../../Components/DataSubmission/Helpers/audit';

describe('flattenErrors', () => {
  test('returns flattened array', () => {
    const auditReport = {
      data: [],
      dataset_meta_data: [],
    };

    auditReport.data[15] = {
      "time": [
        "Value is required",
        "Value is not a valid date."
      ]
    };

    auditReport.dataset_meta_data[0] = {
      "dataset_short_name": [
        "Value is required"
      ],
      "dataset_make": [
        "Value is required",
        "Must be one of the above options."
      ]
    };

    const dataResult = flattenErrors(auditReport.data);

    expect (dataResult.length).toEqual(1);

    expect (dataResult[0].row).toEqual(15);
    expect (dataResult[0].col).toEqual('time');

    const metaDataResult = flattenErrors(auditReport.dataset_meta_data);

    expect (metaDataResult.length).toEqual(2);

    expect (metaDataResult[0].row).toEqual(0);
    expect (metaDataResult[0].col).toEqual('dataset_short_name');

    expect (metaDataResult[1].row).toEqual(0);
    expect (metaDataResult[1].col).toEqual('dataset_make');

  });

});
