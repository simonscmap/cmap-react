import buildInfo from '../../buildInfo.json';

export const versions = {
  web: buildInfo && buildInfo.version,
  buildTime: buildInfo && buildInfo.buildDate,
};
