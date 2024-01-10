const messages = {
  is1904Error: `The workbook uses Date1904 formatting, a legacy date format that can cause conversion issues. Please update your document and verify dates and times are accurate.`,
  numericDateConversionWarning: 'The submitted file used decimal encoding for datetime values in the "time" field. These values have been converted to string format. Please examine and verify the accuracy of the time values displayed in the data sheet in the next validation step. If the conversion is incorrect, reformat your data sheet and submit again.',
  deletedKeysWarning: 'The validation tool detected and removed empty cells in the data sheet.',
  shortNameIsTaken: (shortName) => {
     return `The dataset /short name/ specified in the uploaded workbook, *\`${shortName}\`*, already exists in the CMAP system. Please change the *\`dataset_short_name\`* in the *\`dataset_meta_data\`* worksheet. `;
  },
  longNameIsTaken: (longName) => {
    return `The dataset /long name/ specified in the uploaded workbook, *\`${longName}\`*, already exists in the CMAP system. Please change the *\`dataset_long_name\`* in the *\`dataset_meta_data\`* worksheet. `;
  }
};

export default messages;
