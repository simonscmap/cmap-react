import dataSubmissionReducer from '../../../src/Redux/Reducers/dataSubmission.js';
import states from '../../../src/enums/asyncRequestStates.js';
import {
  STORE_SUBMISSIONS,
  SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE,
  STORE_SUBMISSION_COMMENTS,
  STORE_SUBMISSION_FILE,
  SET_UPLOAD_STATE,
  DATA_SUBMISSION_SELECT_OPTION_STORE,
  SET_CHECK_SUBM_NAME_REQUEST_STATUS,
  CHECK_SUBM_NAME_RESPONSE_STORE,
  SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS,
  SET_SUBM_ID,
  SET_SUBM_TYPE,
  SET_AUDIT,
  SET_WORKBOOK_AUDIT,
  SET_SHEET_AUDIT,
  CLEAR_SUBMISSION_FILE,
  SET_SUBMISSION_STEP,
} from '../../../src/Redux/actionTypes/dataSubmission.js';

describe('dataSubmission reducer', () => {
  // Mock initial state that matches the expected dataSubmission state shape
  const mockInitialState = {
    // Data Submission state pieces from initialState in index.js
    dataSubmissions: [],
    retrieveUserDataSubmsissionsRequestStatus: states.notTried,
    submissionStep: 0, // start at 0
    submissionType: 'new', // 'new' | 'update'
    submissionToUpdate: null, // Id
    submissionComments: [],
    submissionCommentHistoryRetrievalState: states.succeeded,
    submissionFile: null,
    submissionUploadState: null,
    dataSubmissionSelectOptions: null,
    auditReport: null,
    checkSubmissionNameRequestStatus: states.notTried,
    checkSubmissionNameResult: null,
    checkSubmissionNameResponseText: null,
    lastSuccessfulSubmission: null,
    // Other state properties that exist in full state
    otherStateProperty: 'preserved',
  };

  describe('Submission Step Actions', () => {
    it('should handle SET_SUBMISSION_STEP', () => {
      const step = 3;
      const action = {
        type: SET_SUBMISSION_STEP,
        payload: { step }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionStep).toBe(step);
      expect(result.dataSubmissions).toBe(mockInitialState.dataSubmissions); // Other state preserved
      expect(result.otherStateProperty).toBe(mockInitialState.otherStateProperty); // Full state structure preserved
    });
  });

  describe('Submissions Management Actions', () => {
    it('should handle STORE_SUBMISSIONS', () => {
      const submissions = [
        { id: 1, name: 'Test Submission 1', status: 'pending' },
        { id: 2, name: 'Test Submission 2', status: 'approved' }
      ];
      const action = {
        type: STORE_SUBMISSIONS,
        payload: { submissions }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.dataSubmissions).toEqual(submissions);
      expect(result.retrieveUserDataSubmsissionsRequestStatus).toBe(states.succeeded);
      expect(result.submissionStep).toBe(mockInitialState.submissionStep); // Other state preserved
    });

    it('should handle SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS', () => {
      const requestStatus = states.inProgress;
      const action = {
        type: SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS,
        payload: requestStatus
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.retrieveUserDataSubmsissionsRequestStatus).toBe(requestStatus);
      expect(result.dataSubmissions).toBe(mockInitialState.dataSubmissions); // Other state preserved
    });

    it('should handle SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS with different states', () => {
      const testStates = [states.notTried, states.inProgress, states.succeeded, states.failed];
      
      testStates.forEach(status => {
        const action = {
          type: SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS,
          payload: status
        };
        const result = dataSubmissionReducer(mockInitialState, action);
        
        expect(result.retrieveUserDataSubmsissionsRequestStatus).toBe(status);
      });
    });
  });

  describe('Submission Comments Actions', () => {
    it('should handle SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE', () => {
      const state = states.inProgress;
      const action = {
        type: SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE,
        payload: { state }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionCommentHistoryRetrievalState).toBe(state);
      expect(result.submissionComments).toBe(mockInitialState.submissionComments); // Other state preserved
    });

    it('should handle STORE_SUBMISSION_COMMENTS with new comments', () => {
      const submissionID = 5;
      const comments = [
        { id: 1, text: 'First comment', author: 'admin' },
        { id: 2, text: 'Second comment', author: 'user' }
      ];
      const action = {
        type: STORE_SUBMISSION_COMMENTS,
        payload: { submissionID, comments }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionComments[submissionID]).toEqual(comments);
      expect(result.submissionCommentHistoryRetrievalState).toBe(mockInitialState.submissionCommentHistoryRetrievalState); // Other state preserved
    });

    it('should handle STORE_SUBMISSION_COMMENTS with existing comments array', () => {
      const existingComments = [];
      existingComments[3] = [{ id: 1, text: 'Existing comment' }];
      const stateWithComments = {
        ...mockInitialState,
        submissionComments: existingComments
      };
      
      const submissionID = 7;
      const comments = [{ id: 2, text: 'New comment' }];
      const action = {
        type: STORE_SUBMISSION_COMMENTS,
        payload: { submissionID, comments }
      };
      const result = dataSubmissionReducer(stateWithComments, action);
      
      expect(result.submissionComments[submissionID]).toEqual(comments);
      expect(result.submissionComments[3]).toEqual(existingComments[3]); // Existing comments preserved
    });

    it('should handle STORE_SUBMISSION_COMMENTS with array copying', () => {
      const originalComments = [];
      originalComments[1] = [{ id: 1, text: 'Original' }];
      const stateWithComments = {
        ...mockInitialState,
        submissionComments: originalComments
      };
      
      const action = {
        type: STORE_SUBMISSION_COMMENTS,
        payload: { submissionID: 2, comments: [{ id: 2, text: 'New' }] }
      };
      const result = dataSubmissionReducer(stateWithComments, action);
      
      // Verify array is copied, not mutated
      expect(result.submissionComments).not.toBe(stateWithComments.submissionComments);
      expect(result.submissionComments[1]).toEqual(originalComments[1]);
    });
  });

  describe('Submission File Management Actions', () => {
    it('should handle STORE_SUBMISSION_FILE for new submission', () => {
      const file = { name: 'test.xlsx', size: 12345, data: 'file-data' };
      const action = {
        type: STORE_SUBMISSION_FILE,
        payload: { file, submissionId: null }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionFile).toEqual(file);
      expect(result.submissionType).toBe('new');
      expect(result.submissionToUpdate).toBe(null);
      expect(result.submissionUploadState).toBe(states.notTried);
      expect(result.otherStateProperty).toBe(mockInitialState.otherStateProperty); // Full state preserved
    });

    it('should handle STORE_SUBMISSION_FILE for update submission', () => {
      const file = { name: 'update.xlsx', size: 67890, data: 'update-data' };
      const submissionId = '42';
      const action = {
        type: STORE_SUBMISSION_FILE,
        payload: { file, submissionId }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionFile).toEqual(file);
      expect(result.submissionType).toBe('update');
      expect(result.submissionToUpdate).toBe(42); // Should be parsed as integer
      expect(result.submissionUploadState).toBe(states.notTried);
    });

    it('should handle STORE_SUBMISSION_FILE with string submissionId conversion', () => {
      const action = {
        type: STORE_SUBMISSION_FILE,
        payload: { file: {}, submissionId: '123' }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionToUpdate).toBe(123);
      expect(typeof result.submissionToUpdate).toBe('number');
    });

    it('should handle CLEAR_SUBMISSION_FILE', () => {
      const stateWithFile = {
        ...mockInitialState,
        submissionFile: { name: 'test.xlsx' },
        submissionType: 'update',
        submissionToUpdate: 5,
        checkSubmissionNameRequestStatus: states.succeeded,
        checkSubmissionNameResponseText: 'valid name',
        checkSubmissionNameResult: { valid: true }
      };
      
      const action = { type: CLEAR_SUBMISSION_FILE };
      const result = dataSubmissionReducer(stateWithFile, action);
      
      expect(result.submissionFile).toBe(null);
      expect(result.submissionType).toBe('new');
      expect(result.submissionToUpdate).toBe(null);
      expect(result.checkSubmissionNameRequestStatus).toBe(states.notTried);
      expect(result.checkSubmissionNameResponseText).toBe(null);
      expect(result.checkSubmissionNameResult).toBe(null);
      // Note: submissionUploadState should not be reset according to commented line in reducer
      expect(result.submissionUploadState).toBe(stateWithFile.submissionUploadState);
    });
  });

  describe('Upload State Actions', () => {
    it('should handle SET_UPLOAD_STATE with shortName', () => {
      const state = states.succeeded;
      const shortName = 'test-dataset-v1';
      const action = {
        type: SET_UPLOAD_STATE,
        payload: { state, shortName }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionUploadState).toBe(state);
      expect(result.lastSuccessfulSubmission).toBe(shortName);
      expect(result.submissionFile).toBe(mockInitialState.submissionFile); // Other state preserved
    });

    it('should handle SET_UPLOAD_STATE without shortName', () => {
      const state = states.failed;
      const action = {
        type: SET_UPLOAD_STATE,
        payload: { state }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionUploadState).toBe(state);
      expect(result.lastSuccessfulSubmission).toBeUndefined(); // TODO comment suggests this is not always set
    });

    it('should handle SET_UPLOAD_STATE with different states', () => {
      const testStates = [states.notTried, states.inProgress, states.succeeded, states.failed];
      
      testStates.forEach(state => {
        const action = {
          type: SET_UPLOAD_STATE,
          payload: { state, shortName: `test-${state}` }
        };
        const result = dataSubmissionReducer(mockInitialState, action);
        
        expect(result.submissionUploadState).toBe(state);
        expect(result.lastSuccessfulSubmission).toBe(`test-${state}`);
      });
    });
  });

  describe('Submission Options Actions', () => {
    it('should handle DATA_SUBMISSION_SELECT_OPTION_STORE', () => {
      const dataSubmissionSelectOptions = {
        cruises: ['HOT-282', 'HOT-283'],
        sensors: ['CTD', 'ADCP'],
        variables: ['temperature', 'salinity']
      };
      const action = {
        type: DATA_SUBMISSION_SELECT_OPTION_STORE,
        payload: { dataSubmissionSelectOptions }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.dataSubmissionSelectOptions).toEqual(dataSubmissionSelectOptions);
      expect(result.submissionStep).toBe(mockInitialState.submissionStep); // Other state preserved
    });

    it('should handle DATA_SUBMISSION_SELECT_OPTION_STORE with complex nested options', () => {
      const dataSubmissionSelectOptions = {
        regions: [
          { id: 1, name: 'North Pacific', bounds: { north: 60, south: 0, east: -120, west: 180 } },
          { id: 2, name: 'South Pacific', bounds: { north: 0, south: -60, east: -120, west: 180 } }
        ],
        timeRanges: {
          available: ['daily', 'weekly', 'monthly'],
          default: 'daily'
        }
      };
      const action = {
        type: DATA_SUBMISSION_SELECT_OPTION_STORE,
        payload: { dataSubmissionSelectOptions }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.dataSubmissionSelectOptions).toEqual(dataSubmissionSelectOptions);
      expect(result.dataSubmissionSelectOptions.regions[0].bounds.north).toBe(60);
    });
  });

  describe('Submission Name Checking Actions', () => {
    it('should handle SET_CHECK_SUBM_NAME_REQUEST_STATUS with valid status', () => {
      const status = 'succeeded';
      const responseText = 'Name is available';
      const action = {
        type: SET_CHECK_SUBM_NAME_REQUEST_STATUS,
        payload: { status, responseText }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.checkSubmissionNameRequestStatus).toBe(states.succeeded);
      expect(result.checkSubmissionNameResponseText).toBe(responseText);
      expect(result.submissionFile).toBe(mockInitialState.submissionFile); // Other state preserved
    });

    it('should handle SET_CHECK_SUBM_NAME_REQUEST_STATUS with different statuses', () => {
      const testCases = [
        { status: 'notTried', expected: states.notTried },
        { status: 'inProgress', expected: states.inProgress },
        { status: 'succeeded', expected: states.succeeded },
        { status: 'failed', expected: states.failed }
      ];
      
      testCases.forEach(({ status, expected }) => {
        const action = {
          type: SET_CHECK_SUBM_NAME_REQUEST_STATUS,
          payload: { status, responseText: `Response for ${status}` }
        };
        const result = dataSubmissionReducer(mockInitialState, action);
        
        expect(result.checkSubmissionNameRequestStatus).toBe(expected);
        expect(result.checkSubmissionNameResponseText).toBe(`Response for ${status}`);
      });
    });

    it('should handle CHECK_SUBM_NAME_RESPONSE_STORE', () => {
      const checkResult = {
        isValid: true,
        suggestions: [],
        message: 'Name is available'
      };
      const action = {
        type: CHECK_SUBM_NAME_RESPONSE_STORE,
        payload: checkResult
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.checkSubmissionNameResult).toEqual(checkResult);
      expect(result.checkSubmissionNameRequestStatus).toBe(mockInitialState.checkSubmissionNameRequestStatus); // Other state preserved
    });

    it('should handle CHECK_SUBM_NAME_RESPONSE_STORE with complex result', () => {
      const checkResult = {
        isValid: false,
        conflicts: [
          { name: 'similar-dataset-1', id: 123 },
          { name: 'similar-dataset-2', id: 456 }
        ],
        suggestions: ['my-unique-dataset-v1', 'my-unique-dataset-v2'],
        message: 'Name conflicts with existing datasets'
      };
      const action = {
        type: CHECK_SUBM_NAME_RESPONSE_STORE,
        payload: checkResult
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.checkSubmissionNameResult).toEqual(checkResult);
      expect(result.checkSubmissionNameResult.conflicts).toHaveLength(2);
      expect(result.checkSubmissionNameResult.suggestions).toHaveLength(2);
    });
  });

  describe('Submission Type and ID Management Actions', () => {
    it('should handle SET_SUBM_TYPE to new', () => {
      const stateWithUpdate = {
        ...mockInitialState,
        submissionType: 'update',
        submissionToUpdate: 42
      };
      
      const action = {
        type: SET_SUBM_TYPE,
        payload: 'new'
      };
      const result = dataSubmissionReducer(stateWithUpdate, action);
      
      expect(result.submissionType).toBe('new');
      expect(result.submissionToUpdate).toBe(null); // Should be cleared when switching to new
    });

    it('should handle SET_SUBM_TYPE to update', () => {
      const stateWithNew = {
        ...mockInitialState,
        submissionType: 'new',
        submissionToUpdate: null
      };
      
      const action = {
        type: SET_SUBM_TYPE,
        payload: 'update'
      };
      const result = dataSubmissionReducer(stateWithNew, action);
      
      expect(result.submissionType).toBe('update');
      expect(result.submissionToUpdate).toBe(null); // Should preserve existing submissionToUpdate value
    });

    it('should handle SET_SUBM_TYPE preserving submissionToUpdate for update type', () => {
      const stateWithUpdateId = {
        ...mockInitialState,
        submissionType: 'update',
        submissionToUpdate: 123
      };
      
      const action = {
        type: SET_SUBM_TYPE,
        payload: 'update'
      };
      const result = dataSubmissionReducer(stateWithUpdateId, action);
      
      expect(result.submissionType).toBe('update');
      expect(result.submissionToUpdate).toBe(123); // Should preserve existing value
    });

    it('should handle SET_SUBM_ID', () => {
      const submissionId = 789;
      const action = {
        type: SET_SUBM_ID,
        payload: submissionId
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionToUpdate).toBe(submissionId);
      expect(result.submissionType).toBe(mockInitialState.submissionType); // Other state preserved
    });
  });

  describe('Audit Report Actions', () => {
    it('should handle SET_AUDIT', () => {
      const auditReport = {
        errors: 2,
        warnings: 5,
        info: 10,
        details: ['Missing required column', 'Invalid date format']
      };
      const action = {
        type: SET_AUDIT,
        payload: auditReport
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.auditReport).toEqual(auditReport);
      expect(result.submissionFile).toBe(mockInitialState.submissionFile); // Other state preserved
    });

    it('should handle SET_WORKBOOK_AUDIT with no existing audit', () => {
      // Create initial state with required audit structure
      const stateWithEmptyAudit = {
        ...mockInitialState,
        auditReport: {
          workbook: { errors: [] },
          data: [],
          dataset_meta_data: [],
          vars_meta_data: []
        }
      };
      
      const workbookAudit = {
        sheetCount: 3,
        validSheets: ['Data', 'Metadata', 'Variables'],
        errors: ['Sheet names must match template']
      };
      const action = {
        type: SET_WORKBOOK_AUDIT,
        payload: workbookAudit
      };
      const result = dataSubmissionReducer(stateWithEmptyAudit, action);
      
      expect(result.auditReport.workbook).toEqual(workbookAudit);
      // Note: amendReportWithErrorCount should add error count
      expect(result.auditReport).toHaveProperty('workbook');
      expect(result.auditReport).toHaveProperty('errorCount');
    });

    it('should handle SET_WORKBOOK_AUDIT with existing audit', () => {
      const existingAudit = {
        previousData: 'preserved',
        workbook: { errors: [] },
        data: [],
        dataset_meta_data: [],
        vars_meta_data: []
      };
      const stateWithAudit = {
        ...mockInitialState,
        auditReport: existingAudit
      };
      
      const workbookAudit = {
        sheetCount: 2,
        validSheets: ['Data', 'Metadata'],
        errors: ['Missing sheet']
      };
      const action = {
        type: SET_WORKBOOK_AUDIT,
        payload: workbookAudit
      };
      const result = dataSubmissionReducer(stateWithAudit, action);
      
      expect(result.auditReport.workbook).toEqual(workbookAudit);
      expect(result.auditReport.previousData).toBe('preserved'); // Existing audit data preserved
      expect(result.auditReport).toHaveProperty('errorCount');
    });

    it('should handle SET_SHEET_AUDIT', () => {
      // Create initial state with required audit structure
      const stateWithEmptyAudit = {
        ...mockInitialState,
        auditReport: {
          workbook: { errors: [] },
          data: [],
          dataset_meta_data: [],
          vars_meta_data: []
        }
      };
      
      const sheetAudit = {
        rowCount: 1000,
        columnCount: 15,
        errors: ['Missing data in column B'],
        warnings: ['Unusual values in column C']
      };
      const sheetName = 'DataSheet';
      const action = {
        type: SET_SHEET_AUDIT,
        payload: { sheetName, sheetAudit }
      };
      const result = dataSubmissionReducer(stateWithEmptyAudit, action);
      
      expect(result.auditReport[sheetName]).toEqual(sheetAudit);
      expect(result.auditReport).toHaveProperty('errorCount');
    });

    it('should handle SET_SHEET_AUDIT with existing audit report', () => {
      const existingAudit = {
        workbook: { sheetCount: 3, errors: [] },
        data: [],
        dataset_meta_data: [],
        vars_meta_data: [],
        DataSheet: { oldData: 'preserved' }
      };
      const stateWithAudit = {
        ...mockInitialState,
        auditReport: existingAudit
      };
      
      const sheetAudit = {
        rowCount: 500,
        errors: ['New error']
      };
      const sheetName = 'MetadataSheet';
      const action = {
        type: SET_SHEET_AUDIT,
        payload: { sheetName, sheetAudit }
      };
      const result = dataSubmissionReducer(stateWithAudit, action);
      
      expect(result.auditReport[sheetName]).toEqual(sheetAudit);
      expect(result.auditReport.workbook).toEqual(existingAudit.workbook); // Existing audit preserved
      expect(result.auditReport.DataSheet).toEqual(existingAudit.DataSheet); // Other sheets preserved
      expect(result.auditReport).toHaveProperty('errorCount');
    });

    it('should handle SET_SHEET_AUDIT with multiple sheets', () => {
      const stateWithExistingSheet = {
        ...mockInitialState,
        auditReport: {
          workbook: { errors: [] },
          data: [],
          dataset_meta_data: [],
          vars_meta_data: [],
          Sheet1: { errors: ['Error 1'] }
        }
      };
      
      const sheetAudit = { errors: ['Error 2'] };
      const action = {
        type: SET_SHEET_AUDIT,
        payload: { sheetName: 'Sheet2', sheetAudit }
      };
      const result = dataSubmissionReducer(stateWithExistingSheet, action);
      
      expect(result.auditReport.Sheet1).toEqual({ errors: ['Error 1'] });
      expect(result.auditReport.Sheet2).toEqual(sheetAudit);
      expect(result.auditReport).toHaveProperty('errorCount');
    });
  });

  describe('Complex State Transformations', () => {
    it('should handle STORE_SUBMISSION_FILE with complex file object', () => {
      const complexFile = {
        name: 'complex-dataset.xlsx',
        size: 2048576,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        lastModified: 1627845600000,
        webkitRelativePath: '',
        stream: () => new ReadableStream(),
        text: () => Promise.resolve('file content'),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(2048576))
      };
      
      const action = {
        type: STORE_SUBMISSION_FILE,
        payload: { file: complexFile, submissionId: null }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionFile).toEqual(complexFile);
      expect(result.submissionFile.size).toBe(2048576);
      expect(typeof result.submissionFile.stream).toBe('function');
    });

    it('should handle nested audit report updates preserving structure', () => {
      const complexAuditState = {
        ...mockInitialState,
        auditReport: {
          workbook: {
            sheetNames: ['Data', 'Metadata', 'Variables'],
            totalErrors: 5,
            errors: []
          },
          data: [],
          dataset_meta_data: [],
          vars_meta_data: [],
          Data: {
            rowCount: 1000,
            columnValidation: {
              latitude: { valid: true },
              longitude: { valid: false, errors: ['Out of range'] }
            }
          },
          Metadata: {
            required: ['dataset_name', 'PI', 'contact'],
            missing: ['contact']
          }
        }
      };
      
      const newSheetAudit = {
        rowCount: 50,
        validColumns: ['var_name', 'var_unit', 'var_comment'],
        errors: ['Missing variable descriptions']
      };
      
      const action = {
        type: SET_SHEET_AUDIT,
        payload: { sheetName: 'Variables', sheetAudit: newSheetAudit }
      };
      const result = dataSubmissionReducer(complexAuditState, action);
      
      expect(result.auditReport.Variables).toEqual(newSheetAudit);
      expect(result.auditReport.workbook).toEqual(complexAuditState.auditReport.workbook);
      expect(result.auditReport.Data).toEqual(complexAuditState.auditReport.Data);
      expect(result.auditReport.Metadata).toEqual(complexAuditState.auditReport.Metadata);
      expect(result.auditReport).toHaveProperty('errorCount');
    });

    it('should preserve complex submission comments array structure', () => {
      const complexCommentsState = {
        ...mockInitialState,
        submissionComments: []
      };
      // Sparse array with comments at specific indices
      complexCommentsState.submissionComments[5] = [
        { id: 1, author: 'admin', timestamp: '2023-01-01', text: 'Approved' },
        { id: 2, author: 'user', timestamp: '2023-01-02', text: 'Thank you' }
      ];
      complexCommentsState.submissionComments[12] = [
        { id: 3, author: 'reviewer', timestamp: '2023-01-03', text: 'Needs revision' }
      ];
      
      const newComments = [
        { id: 4, author: 'admin', timestamp: '2023-01-04', text: 'Final approval' }
      ];
      
      const action = {
        type: STORE_SUBMISSION_COMMENTS,
        payload: { submissionID: 8, comments: newComments }
      };
      const result = dataSubmissionReducer(complexCommentsState, action);
      
      expect(result.submissionComments[8]).toEqual(newComments);
      expect(result.submissionComments[5]).toEqual(complexCommentsState.submissionComments[5]);
      expect(result.submissionComments[12]).toEqual(complexCommentsState.submissionComments[12]);
      expect(result.submissionComments).not.toBe(complexCommentsState.submissionComments); // Array should be copied
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined state (initial state scenario)', () => {
      const action = { type: SET_SUBMISSION_STEP, payload: { step: 1 } };
      const result = dataSubmissionReducer(undefined, action);
      
      expect(result.submissionStep).toBe(1);
      // In full-state mode, undefined state would typically cause issues
      // This test documents current behavior when migrating to slice pattern
    });

    it('should handle STORE_SUBMISSION_FILE with null submissionId', () => {
      const file = { name: 'test.xlsx' };
      const action = {
        type: STORE_SUBMISSION_FILE,
        payload: { file, submissionId: null }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionType).toBe('new');
      expect(result.submissionToUpdate).toBe(null);
    });

    it('should handle STORE_SUBMISSION_FILE with undefined submissionId', () => {
      const file = { name: 'test.xlsx' };
      const action = {
        type: STORE_SUBMISSION_FILE,
        payload: { file, submissionId: undefined }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionType).toBe('new');
      expect(result.submissionToUpdate).toBe(null);
    });

    it('should handle STORE_SUBMISSION_FILE with non-numeric submissionId string', () => {
      const file = { name: 'test.xlsx' };
      const action = {
        type: STORE_SUBMISSION_FILE,
        payload: { file, submissionId: 'invalid-id' }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.submissionType).toBe('update');
      expect(result.submissionToUpdate).toBe(NaN); // parseInt('invalid-id', 10) returns NaN
    });

    it('should handle SET_CHECK_SUBM_NAME_REQUEST_STATUS with invalid status', () => {
      const action = {
        type: SET_CHECK_SUBM_NAME_REQUEST_STATUS,
        payload: { status: 'invalidStatus', responseText: 'test' }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.checkSubmissionNameRequestStatus).toBeUndefined(); // states['invalidStatus'] is undefined
      expect(result.checkSubmissionNameResponseText).toBe('test');
    });

    it('should handle actions with missing payload properties', () => {
      const action = {
        type: STORE_SUBMISSIONS,
        payload: {} // Missing submissions property
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result.dataSubmissions).toBeUndefined();
      expect(result.retrieveUserDataSubmsissionsRequestStatus).toBe(states.succeeded);
    });

    it('should handle SET_WORKBOOK_AUDIT with null existing auditReport', () => {
      const stateWithNullAudit = {
        ...mockInitialState,
        auditReport: null
      };
      
      const workbookAudit = { errors: ['test error'] };
      const action = {
        type: SET_WORKBOOK_AUDIT,
        payload: workbookAudit
      };
      
      // This should throw because amendReportWithErrorCount expects a proper audit structure
      expect(() => dataSubmissionReducer(stateWithNullAudit, action)).toThrow();
    });

    it('should handle SET_SHEET_AUDIT with null existing auditReport', () => {
      const stateWithNullAudit = {
        ...mockInitialState,
        auditReport: null
      };
      
      const sheetAudit = { errors: ['sheet error'] };
      const action = {
        type: SET_SHEET_AUDIT,
        payload: { sheetName: 'TestSheet', sheetAudit }
      };
      
      // This should throw because amendReportWithErrorCount expects a proper audit structure
      expect(() => dataSubmissionReducer(stateWithNullAudit, action)).toThrow();
    });
  });

  describe('Default Case Behavior', () => {
    it('should return unchanged state for unknown actions', () => {
      const action = { type: 'UNKNOWN_DATA_SUBMISSION_ACTION' };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result).toBe(mockInitialState); // Should return exact same reference
    });

    it('should return unchanged state for actions without type', () => {
      const action = {}; // No type property
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result).toBe(mockInitialState);
    });

    it('should handle null action gracefully', () => {
      // This will throw because reducer tries to access action.type
      expect(() => dataSubmissionReducer(mockInitialState, null)).toThrow();
    });
  });

  describe('State Shape Preservation', () => {
    it('should maintain state structure after complex sequence of actions', () => {
      const actions = [
        { type: SET_SUBMISSION_STEP, payload: { step: 1 } },
        { type: STORE_SUBMISSIONS, payload: { submissions: [{ id: 1 }] } },
        { type: STORE_SUBMISSION_FILE, payload: { file: { name: 'test.xlsx' }, submissionId: null } },
        { type: SET_UPLOAD_STATE, payload: { state: states.succeeded, shortName: 'test' } },
        { type: SET_AUDIT, payload: { errors: 0, warnings: 1 } }
      ];
      
      let currentState = mockInitialState;
      actions.forEach(action => {
        currentState = dataSubmissionReducer(currentState, action);
      });
      
      // Verify all expected properties exist
      expect(currentState.submissionStep).toBeDefined();
      expect(currentState.dataSubmissions).toBeDefined();
      expect(currentState.submissionFile).toBeDefined();
      expect(currentState.submissionUploadState).toBeDefined();
      expect(currentState.auditReport).toBeDefined();
      
      // Verify non-data-submission state is preserved
      expect(currentState.otherStateProperty).toBe(mockInitialState.otherStateProperty);
      
      // Verify final values
      expect(currentState.submissionStep).toBe(1);
      expect(currentState.dataSubmissions).toHaveLength(1);
      expect(currentState.submissionFile.name).toBe('test.xlsx');
      expect(currentState.submissionUploadState).toBe(states.succeeded);
      expect(currentState.auditReport.errors).toBe(0);
    });

    it('should preserve object references for unchanged properties', () => {
      const action = { type: SET_SUBMISSION_STEP, payload: { step: 2 } };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      // Changed property should be new value
      expect(result.submissionStep).toBe(2);
      
      // Unchanged properties should maintain reference equality
      expect(result.dataSubmissions).toBe(mockInitialState.dataSubmissions);
      expect(result.submissionComments).toBe(mockInitialState.submissionComments);
      expect(result.submissionFile).toBe(mockInitialState.submissionFile);
    });
  });

  describe('Performance Considerations', () => {
    it('should return same reference for state when no changes occur', () => {
      const action = { type: 'UNKNOWN_ACTION' };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result).toBe(mockInitialState); // Same reference for performance
    });

    it('should create new state object only when changes occur', () => {
      const action = { type: SET_SUBMISSION_STEP, payload: { step: 3 } };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      expect(result).not.toBe(mockInitialState); // New state object
      expect(result.submissionStep).toBe(3); // Changed property
      // Unchanged properties should maintain references where possible
    });
  });

  describe('Integration with amendReportWithErrorCount Helper', () => {
    it('should call amendReportWithErrorCount for SET_WORKBOOK_AUDIT', () => {
      // Create a proper audit structure that amendReportWithErrorCount expects
      const stateWithValidAudit = {
        ...mockInitialState,
        auditReport: {
          workbook: { errors: [] },
          data: [],
          dataset_meta_data: [],
          vars_meta_data: []
        }
      };
      
      const workbookAudit = {
        errors: [
          { type: 'critical', message: 'Missing required sheet' },
          { type: 'warning', message: 'Unexpected sheet found' }
        ]
      };
      
      const action = {
        type: SET_WORKBOOK_AUDIT,
        payload: workbookAudit
      };
      const result = dataSubmissionReducer(stateWithValidAudit, action);
      
      expect(result.auditReport.workbook).toEqual(workbookAudit);
      expect(result.auditReport).toHaveProperty('errorCount');
      // The amendReportWithErrorCount function should add error counts
    });

    it('should call amendReportWithErrorCount for SET_SHEET_AUDIT', () => {
      // Create a proper audit structure that amendReportWithErrorCount expects
      const stateWithValidAudit = {
        ...mockInitialState,
        auditReport: {
          workbook: { errors: [] },
          data: [],
          dataset_meta_data: [],
          vars_meta_data: []
        }
      };
      
      const sheetAudit = {
        errors: [
          { row: 1, column: 'A', message: 'Invalid value' },
          { row: 5, column: 'B', message: 'Missing data' }
        ],
        warnings: [
          { row: 10, column: 'C', message: 'Unusual value' }
        ]
      };
      
      const action = {
        type: SET_SHEET_AUDIT,
        payload: { sheetName: 'DataSheet', sheetAudit }
      };
      const result = dataSubmissionReducer(stateWithValidAudit, action);
      
      expect(result.auditReport.DataSheet).toEqual(sheetAudit);
      expect(result.auditReport).toHaveProperty('errorCount');
      // The amendReportWithErrorCount function should process the error arrays
    });
  });

  describe('QA Enhancement Tests - Missing Coverage', () => {
    it('should handle amendReportWithErrorCount edge case - empty audit structure', () => {
      const stateWithMinimalAudit = {
        ...mockInitialState,
        auditReport: {
          workbook: { errors: [] },
          data: [],
          dataset_meta_data: [],
          vars_meta_data: []
        }
      };
      
      const workbookAudit = { errors: [] }; // Empty errors array
      const action = {
        type: SET_WORKBOOK_AUDIT,
        payload: workbookAudit
      };
      const result = dataSubmissionReducer(stateWithMinimalAudit, action);
      
      expect(result.auditReport.errorCount).toBeDefined();
      expect(result.auditReport.errorCount.workbook).toBe(0);
      expect(result.auditReport.errorCount.sum).toBe(0);
    });

    it('should verify exact state shape compatibility for slice migration', () => {
      const action = { type: SET_SUBMISSION_STEP, payload: { step: 1 } };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      // Verify all expected dataSubmission properties exist
      const expectedProperties = [
        'dataSubmissions', 'retrieveUserDataSubmsissionsRequestStatus', 'submissionStep',
        'submissionType', 'submissionToUpdate', 'submissionComments', 
        'submissionCommentHistoryRetrievalState', 'submissionFile', 'submissionUploadState',
        'dataSubmissionSelectOptions', 'auditReport', 'checkSubmissionNameRequestStatus',
        'checkSubmissionNameResult', 'checkSubmissionNameResponseText', 'lastSuccessfulSubmission'
      ];
      
      expectedProperties.forEach(prop => {
        expect(result).toHaveProperty(prop);
      });
      
      // Verify non-dataSubmission properties are preserved (full-state behavior)
      expect(result.otherStateProperty).toBe(mockInitialState.otherStateProperty);
    });

    it('should handle large payload performance - STORE_SUBMISSIONS with many items', () => {
      const startTime = performance.now();
      
      // Create large submissions array
      const largeSubmissions = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Submission ${i}`,
        status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'approved' : 'rejected',
        metadata: {
          author: `user${i}`,
          created: new Date().toISOString(),
          size: Math.random() * 1000000
        }
      }));
      
      const action = {
        type: STORE_SUBMISSIONS,
        payload: { submissions: largeSubmissions }
      };
      const result = dataSubmissionReducer(mockInitialState, action);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(result.dataSubmissions).toHaveLength(1000);
      expect(executionTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle complex nested audit report with performance validation', () => {
      const startTime = performance.now();
      
      // Create complex audit structure with many errors
      const complexAuditReport = {
        workbook: { 
          errors: Array.from({ length: 50 }, (_, i) => ({ 
            id: i, 
            message: `Error ${i}`, 
            severity: 'high' 
          }))
        },
        data: Array.from({ length: 100 }, () => ({})),
        dataset_meta_data: Array.from({ length: 25 }, () => ({})),
        vars_meta_data: Array.from({ length: 75 }, () => ({}))
      };
      
      const stateWithComplexAudit = {
        ...mockInitialState,
        auditReport: complexAuditReport
      };
      
      const sheetAudit = {
        errors: Array.from({ length: 200 }, (_, i) => ({
          row: i + 1,
          column: String.fromCharCode(65 + (i % 26)),
          message: `Sheet error ${i}`
        }))
      };
      
      const action = {
        type: SET_SHEET_AUDIT,
        payload: { sheetName: 'LargeDataSheet', sheetAudit }
      };
      const result = dataSubmissionReducer(stateWithComplexAudit, action);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(result.auditReport.LargeDataSheet.errors).toHaveLength(200);
      expect(result.auditReport.errorCount).toBeDefined();
      expect(executionTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});