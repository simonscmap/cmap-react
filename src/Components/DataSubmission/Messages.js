const messages = {
  is1904Error: `The workbook uses Date1904 formatting, a legacy date format that can cause conversion issues. Please update your document and verify dates and times are accurate.`,
  numericDateConversionWarning: 'The submitted file used decimal encoding for datetime values in the "time" field. These values have been converted to string format. Please examine and verify the accuracy of the time values displayed in the data sheet in the next validation step. If the conversion is incorrect, reformat your data sheet and submit again.',
  deletedKeysWarning: 'The validation tool detected and removed empty cells in the data sheet.',
  nameIsTaken: (checkNameResult) => {
    let message = `The dataset name specified in the uploaded workbook, *\`${checkNameResult.shortName}\`*, already exists in the CMAP system. `;
    if (checkNameResult && checkNameResult.tableExists) {
      message += 'There is already a data table with that name.';
    } else if (checkNameResult && checkNameResult.folderExists) {
      message += 'There is arleady a data submission with that name. ';
    }
    message += `Please change the "*\`dataset_short_name\`*" value in the *\`dataset_meta_data\`* sheet and resubmit the dataset. `;
    return message;
  }
};

export default messages;
