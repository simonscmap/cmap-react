import { env } from '../Services/env';
import { ENV } from '../constants';
import Sanctuary from 'sanctuary';
import logInit from '../Services/log-service';

const log = logInit('sanctuary');

// const { env } = require('fluture-sanctuary-types');

// only check types in development
// consider checking types in staging as well
const S = Sanctuary.create({
  checkTypes: env === ENV.development,
  // env: Sanctuary.env.concat(env),
  env: Sanctuary.env,
});

log.info("creating sanctuary env", { S });

export default S;
