const pkg = require('./package.json');

const buildInfo = {
  version: pkg.version,
  buildDate: new Date().toISOString(),
};

console.log(JSON.stringify(buildInfo));
