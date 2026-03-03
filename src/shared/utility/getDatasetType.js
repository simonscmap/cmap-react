export const DATASET_TYPES = ['Model', 'Satellite', 'In-Situ', 'Assimilation'];

export const createDataTypesSet = () => new Set(DATASET_TYPES);

export const getDatasetType = (makes = [], sensors = []) => {
  const makesLower = makes.map((make) => make.toLowerCase());
  const sensorsLower = sensors.map((sensor) => sensor.toLowerCase());

  if (makesLower.includes('model')) {
    return 'Model';
  }

  if (makesLower.includes('assimilation')) {
    return 'Assimilation';
  }

  if (
    makesLower.includes('observation') &&
    sensorsLower.includes('satellite')
  ) {
    return 'Satellite';
  }

  return 'In-Situ';
};
