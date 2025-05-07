const countErrors = (auditReport) => {
  if (!auditReport) {
    return;
  }

  let counts = {
    workbook: auditReport.workbook.errors.length || 0,
    data: 0,
    dataset_meta_data: 0,
    vars_meta_data: 0,
  };

  auditReport['data'].forEach((e) => {
    if (e) {
      counts.data += Object.keys(e).length || 0;
    }
  });

  auditReport['dataset_meta_data'].forEach((e) => {
    if (e) {
      counts.dataset_meta_data += Object.keys(e).length || 0;
    }
  });

  auditReport['vars_meta_data'].forEach((e) => {
    if (e) {
      counts.vars_meta_data += Object.keys(e).length || 0;
    }
  });

  const errorSum = Object.keys(counts).reduce((acc, curr) => {
    return acc + counts[curr];
  }, 0);

  counts.sum = errorSum;

  return counts;
};

export const amendReportWithErrorCount = (auditReport) => {
  return Object.assign(auditReport, {
    errorCount: countErrors(auditReport),
  });
};

export default countErrors;
