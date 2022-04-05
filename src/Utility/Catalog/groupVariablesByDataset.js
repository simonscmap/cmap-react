const groupVariablesByDataset = (variables, cart) => {
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
    if (cart[opt1.Dataset_Name] && cart[opt2.Dataset_Name]) {
      return opt1.Dataset_Name < opt2.Dataset_Name ? -1 : 1;
    } else if (cart[opt1.Dataset_Name]) {
      return -1;
    } else if (cart[opt2.Dataset_Name]) {
      return 1;
    } else {
      return opt1.Dataset_Name < opt2.Dataset_Name ? -1 : 1;
    }
  });
};

export default groupVariablesByDataset;
