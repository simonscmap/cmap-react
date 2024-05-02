import auditFactory from './auditFactory';
import IssueWithList from '../IssueWithList';
import severity from './severity';
// check name
  if (checkNameResult) {
    // 3 scenarios: (1) this is a new submission and one of the 2 names is taken
    // (2) this is an update and the names are the same (3) this is an update and the names are different

    const {
      shortNameIsAlreadyInUse, // short name is used by an ingested dataset
      shortNameUpdateConflict, // short name is in use by a submission
      folderExists,
      longNameIsAlreadyInUse, // long name is used by an ingested dataset
      longNameUpdateConflict, // long name is used by an ingested dataset
      errors: nameCheckErrors,
    } = checkNameResult;

    const shortName = safePath(['0', 'dataset_short_name'])(dataset_meta_data);
    const longName = safePath(['0', 'dataset_long_name'])(dataset_meta_data);

    const newShortNameConflict = (shortNameIsAlreadyInUse || folderExists) && submissionType === 'new';
    const newLongNameConflict =  longNameIsAlreadyInUse && submissionType === 'new';

    if (nameCheckErrors.includes('No short name provided')) {
      errors.push({
        title: 'Dataset Short Name is Missing',
        detail: 'No short name was provided. Please add a name in the *`dataset_short_name`* field in the *`dataset_meta_data`* worksheet.',
      });
    } else if (newShortNameConflict) {
      errors.push({
        title: 'Dataset Short Name is Unavailable',
        detail: `The dataset /short name/ specified in the uploaded workbook, *\`${shortName}\`*, is already in use by annother submission. Please change the *\`dataset_short_name\`* in the *\`dataset_meta_data\`* worksheet. `,
      });
    } else if (shortNameUpdateConflict) {
      console.log ('short name update conflict');
      if (userDataSubmissions && userDataSubmissions.length) {
        const shortNameBelongsToOtherSubmission = userDataSubmissions.find ((sub) => {
          return sub.Dataset === shortName && sub.Submission_ID !== submissionToUpdate;
        });
        const targetDataset = userDataSubmissions.find ((sub) => sub.Submission_ID === submissionToUpdate);
        if (shortNameBelongsToOtherSubmission && targetDataset) {
          first.push ({
            title: 'Did you pick the right file?',
            detail: `In the last step you selected the *\`${targetDataset.Dataset}\`* submission to update, but the file you uploaded has a short name of *\`${shortName}\`*, which already belongs to one of your other data submissions. Please check that you are updating the intended dataset submission with the correct data file.`,
          });
        }
      }
      errors.push({
        title: 'Unable to Update Short Name',
        detail: `The short name provided, *\`${shortName}\`*, already exists in the CMAP system. Please choose another name.`,
      })
    }

    if (nameCheckErrors.includes('No long name provided')) {
      errors.push({
        title: 'Dataset Long Name is Missing',
        detail: 'No long name was provided. Please add a name in the *`dataset_long_name`* field in the *`dataset_meta_data`* worksheet.',
      });
    } else if (newLongNameConflict) {
      errors.push({
        title: 'Dataset Long Name is Unavailable',
        detail: messages.longNameIsTaken(longName),
      })
    } else if (longNameUpdateConflict) {
      errors.push({
        title: 'Unable to Update Long Name',
        detail: `The long name provided, *\`${longName}\`*, is already in use by another dataset submission`,
      })
    }
  }


const orphanedCellsAudit = auditFactory (
  'Orphaned Cells',
  'Checking for orphaned cells',
  orphanedCellsCheck
);

export default orphanedCellsAudit;
