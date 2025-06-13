import XLSX from 'xlsx';

// Extracted utility function for downloading workbook

export const downloadWorkbook = ({
  data,
  dataset_meta_data,
  vars_meta_data,
  setLoadingMessage,
  originalWorkbook,
}) => {
  const tag = { tag: 'ValidationTool#handleDownload' };
  setLoadingMessage('Downloading', tag);
  setTimeout(() => {
    window.requestAnimationFrame(() => setLoadingMessage('', tag));
  }, 50);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(data),
    'data',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(dataset_meta_data),
    'dataset_meta_data',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(vars_meta_data),
    'vars_meta_data',
  );
  XLSX.writeFile(workbook, dataset_meta_data[0].dataset_short_name + '.xlsx');
};
