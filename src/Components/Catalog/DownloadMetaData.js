import XLSX from 'xlsx';
import datasetMetadataToDownloadFormat from '../../Utility/Catalog/datasetMetadataToDownloadFormat';

export const downloadMetadata = (shortName, datasetFullPageData) => {
  let fullPageData = datasetMetadataToDownloadFormat(datasetFullPageData);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(fullPageData.datasetRows),
    'Dataset Metadata',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(fullPageData.variableRows),
    'Variable Metadata',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(fullPageData.summaryStatisticsRows),
    'Variable Summary Statistics',
  );
  XLSX.writeFile(workbook, `${shortName}_Metadata'.xlsx`);
};
