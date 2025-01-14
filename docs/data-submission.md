# Data Submission

Data Submission pages include the Submission Guide, the Submission Portal, The Submission Dashboard, and a form to nominate new datasets for inclusion in CMAP.

This document covers the Submission Portal, also know internally as the Validator.

See `/src/Components/DataSubmission/`

## Overview

The Validator's root component is `/src/Components/DataSubmission/ValidationTool.js`.

The Validator flow has the following steps

1. Upload
2. Validation Summary
3. Sheet Editor
4. Submission

The components governing these steps are:
- [Chooser](../src/Components/DataSubmission/Chooser.js)
- [Step1](../src/Components/DataSubmission/ValidationToolStep1.js)
- [Step2](../src/Components/DataSubmission/ValidationToolStep2.js)
- [Step3](../src/Components/DataSubmission/SubmitDataset.js)

### 1. Upload

The user can continue an existing submission, in which case the files are loaded from Dropbox. Or the user can start a new submission.

Existing, in-process submissions are listed here, based on records in the database. The most recent version of a submission will be taken from its corresponding dropbox folder. -- Note that the Dropbox client used here is different from the client used for Direct Download.

A drag and drop area is provided for new uploads; this is implemented in the `FileUploadArea` component (`/src/Components/DataSubmission/ChooserComponents/FileUploadArea.js`), and rendered in the first step's component, the `Chooser` (`/src/Components/DataSubmission/Chooser.js`).

Restriction on the file type provided is handled first by the `input` element, which has `.xlsx` specified in its `accept` attribute. When a file is selected it is dispatched via `checkSubmissionOptionsAndStoreFile`, which is then handled in the saga of the same name in `/src/Redux/Sagas/index.js` (Note: this should be moved in with the `dataSubmission.js` sagas).


### 2. Validation

When a submission file is selected or uploaded, the `ValidationTool` runs its *audit* (it detects the change in `componentDidUpdate`).

There are 3 separate parts of the audit: `auditCell`, `auditWorkbook` and `auditRows` are each methods on the `ValidationTool` class.

When an audit is needed, the following happens:

A set of audit functions are generated in `/src/Components/DataSubmission/Helpers/generateAudits.js`. These are customized to the submission options object it is provided. For example, one generated audit checks whether a the temporal resolution is valid. The result is an object mapping column names as object keys to appropriate audit functions. These are used by the `auditCell` method.

Then the main audit is orchestrated by the ValidationTool's `performAudit` method, which gathers a series of args and passes them to `workbookAudits.js`, which imports separate audits and runs them, generating a report (and logging how long each separate audit function took to run, to assist in performance debugging).

Note: the ability for the Validator to process a dataset is limited by system resources; sometimes a submission file is too large, and the process hangs. A potential solution to this is to use web workers. As it is, there is no clear line on how big a file is too big.

The result of the audit is persisted in redux. The result is structured, divided into 3 parts according to the three required sheets in the xlsx workbook.

Note: several attempts have been made to create a date-format check, but this has not been successful. Complicating factors are the different formats that issue from excel files. Some older files use the 1904 date format. The vestigial result is `workbookAuditLib/time.js`, which now is only used to detect the format.

In this Validation step, the results are displayed with different levels of severity: Error, Warning, and Info.

Among these are warnings if the submission name has a conflict with an existing submission, or, in the case that the submission is an update to a pre-existing submission by this user, it will warn if the submission name will change. These warnings are intended to avoid a situation where a user accidentally uploads the wrong workbook and overwrites a submission with an unrelated submission. These warnings depend on an API call to check the submission name. In the background this API refers to existing files in Dropbox and existing records of submissions in the database. The response is detailed and describes a number of cases. For example, the following response indicates that the file uploaded contains a short name and long name that cannot be used because it conflicts with another submission.

```
{
  "shortNameIsAlreadyInUse": false,
  "shortNameUpdateConflict": true,
  "folderExists": true,
  "longNameIsAlreadyInUse": false,
  "longNameUpdateConflict": true,
  "errors": [],
  "shortName": "Short_name_case_test",
  "longName": "Short Name Case Test"
}
```

### 3. Editor

The editor allows the user to alter the content of the uploaded file. The editor is an instance of AgGrid with various customizations. The layout is tabular, allowing the user to move between the 3 sheets of the xlsx workbook separately.

Some fields are not writeable, such as the date field in the Data sheet.

Changes to any sheet trigger a re-run of the audit. For large datasets, where the run time of the audit is long, this can lead to poor UX. In the future it would be worthwhile to narrow what part of the audit is run, based on what is modified. However, this is not straightforward because a number of the most resource-costly audits are ones that, for example, check for duplicate data, and must run through the entire sheet to render a result.

In addition, some edits trigger API calls: namely changes to the short name or long name. It is routine for the user to be presented with a naming conflict in the Validation step, and then edit the name in this Editor step. But after the user changes either name, the `checkname` API must be consulted with the new value.

### 4. Submit

The last step displays a summary of any changes made, that is powered by the change log: a bit of ValidationTool component state that is updated with every change event. The "Submit" button is disabled if there are any validation errors.

The `handleUploadSubmission` method creates a new XLSX workbook with the edited data and creates a file blob, named with the submission's short name. It dispatches this file, along with some metadata to the saga which handles the upload to the API.

The `uploadSubmission` saga in `/src/Redux/sagas/index.js` first checks to make sure that the audit report on the submission data is present and reports no errors; then it executes a final name check; thin it then implements the upload of a varying number of files: a new submission will upload both the validated file and the original raw file, both of which require an upload session id.

The `uploadSubmission` saga proceeds in three parts:
1. it creates an upload session for each file it is uploading, calling the `/api/datasubmission/beginuploadsession` API.
2. it calls `uploadFileParts` on each of the files, which handles chunking the file data and sending them to the `/api/datasubmission/uploadfilepart` API in sequence; this generator function alse handles retries with a limit of 3. The API call requires the session id, the part data, and an offset -- so looping through the chunked data also needs to track the offset it bits. The default chunk size is `5 * 1024 * 1024`, but it can be overridden. The retry is not overly sophisticated; it waits 2 seconds between tries and does not employ exponential backoff.
3. if the preceeding steps are successufl, the final step is committing the upload by calling `/api/datasubmission/commitupload`. This payload includes metadata about the submission, both the session ids and offsets so that the API can validate the commit, and semantic metadata such as the dataset name and submission type.


## Bugs

Noting past bugs may help identify aspects of the system that are fragile.

During the last overhaul of the Validator there were a series of bugs surrounding back-to-back submissions; various state form the prior submission interfered with the correct processing of the next submission. Note that now there are specific class methods the handle resetting the Validator state: `resetSubmissionFile`, `resetAudit`, and `resetLocalState`; these are called in sequence by `handleResetState`.

Another area where bugs have appeared is correctly switching between steps. There is a class method which controls this: `handleChangeValidationStep`.

The editor step has a number of quirks. One of them is handling edits; for this process see the method `handleCellValueChanged`, which receives change events from AgGrid. Getting validation issues to change Cell styles in the grid, and displaying the validation message correctly as a tooltip have been subject to a number of bugs. Additionally, edit events are not dispatched by AgGrid until the cell loses focus (e.g. until after click-away), which can be a frustrating UX.
