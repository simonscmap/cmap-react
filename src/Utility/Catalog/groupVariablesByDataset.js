const groupVariablesByDataset = (variables) => {
  let datasetObject = variables.reduce((acc, cur) => {
    if (!acc[cur.Dataset_Name]) {
      acc[cur.Dataset_Name] = {
        Dataset_Name: cur.Dataset_Name,
        variables: [],
      };
    }

    acc[cur.Dataset_Name].variables.push(cur);

    return acc;
  }, {});

  return Object.values(datasetObject).sort((opt1, opt2) => {
    return opt1.Dataset_Name < opt2.Dataset_Name ? -1 : 1;
  });
};

export default groupVariablesByDataset;
