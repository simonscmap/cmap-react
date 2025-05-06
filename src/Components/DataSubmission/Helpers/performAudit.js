const performAudit = (args) => {
  const { data, dataset_meta_data, vars_meta_data } = args;
  let workbookAudit = this.auditWorkbook(args);

  if (workbookAudit.errors.length) {
    return {
      workbook: workbookAudit,
      data: [],
      dataset_meta_data: [],
      vars_meta_data: [],
    };
  }

  let report = {
    workbook: workbookAudit,
    data: this.auditRows(data, 'data'),
    dataset_meta_data: this.auditRows(dataset_meta_data, 'dataset_meta_data'),
    vars_meta_data: this.auditRows(vars_meta_data, 'vars_meta_data'),
  };

  return report;
};
