import { versions } from './get-versions';
import { isProduction } from '../env';
import threshold from './threshold';
import { safePath } from '../../Utility/objectUtils';

const tagInfo = {
  versions: {
    web: versions.web,
  },
  userAgent: navigator.userAgent,
};

const logLevel = {
  trace: 5,
  debug: 4,
  info: 3,
  warn: 2,
  error: 1,
  fatal: 0,
};

function log(level, tags, context, message, isError, data) {
  // 0. exit if over the log threshhold

  if ((isProduction && level > 3) || threshold < level) {
    return;
  }

  // 1. ensure that log will have full context

  if (typeof level !== 'number') {
    console.error('missing arg "level" in logger:');
    console.log(level);
    return;
  }

  if (!tags) {
    console.error('missing arg "tags" in logger:');
    console.log(tags);
    return;
  }

  if (!context) {
    console.error('missing arg "context" in logger:');
    console.log(context);
    return;
  }

  if (!message) {
    console.error('missing arg "message" in logger:');
    console.log(message);
    return;
  }

  // 3. prepare log
  let payload = {
    level,
    message,
  };

  // only log time and tags in production
  if (isProduction) {
    payload.time = Date.now();
  }

  if (tags) {
    payload.tags = tags;
  }

  if (context) {
    payload.context = context;
  }

  if (isError) {
    payload.error = true;
  }

  if (data) {
    payload.data = data;
  }

  /* console.log(
   *   ...Object.entries(payload).reduce((acc, [key, value]) => {
   *     if (typeof value === 'object') {
   *       return [...acc, `\n${key}:`, value];
   *     } else {
   *       return [...acc, `\n${key}: ${value}`];
   *     }
   *   }, []),
   * ); */

  let logLevelString = Object.entries(logLevel)
    .filter(([, l]) => level === l)
    .map(([s]) => s);

  let moduleString =
    payload.context && payload.context.module
      ? ` | in ${payload.context.module}`
      : '';

  const version = safePath(['tags', 'versions', 'web'])(payload);

  const versionString = version ? `(v${version})` : '';

  let logContent = [
    `${logLevelString.length ? logLevelString[0].toUpperCase() : '????'} | ${
      payload.message
    } ${moduleString} ${versionString}\n`,
    payload.data,
  ];

  switch (level) {
    case 0:
    case 1:
      console.error(...logContent);
      break;
    case 2:
      console.warn(...logContent);
      break;
    case 3:
      console.info(...logContent);
      break;
    case 4:
      console.debug(...logContent);
      break;
    case 5:
      console.trace(...logContent);
      break;
    default:
      return;
  }
}

function createNewLogger(moduleName, extraContext = {}) {
  let { session, extra, requestId } = extraContext;

  let props = {
    tags: tagInfo,
    context: {
      module: moduleName,
    },
  };

  if (session) {
    props.session = session;
  }

  if (requestId) {
    props.requestId = requestId;
  }

  if (extra && Array.isArray(extra) && extra.length === 2) {
    let [k, v] = extra;
    props[k] = v;
  }

  let logger = Object.assign({}, props);

  // methods to set context info
  logger.setModule = (x) => {
    return createNewLogger(x);
  };
  logger.setSession = (x) => {
    return createNewLogger(moduleName, { session: x, extra });
  };

  logger.setReqId = (rid) => {
    return createNewLogger(moduleName, { ...extraContext, requestId: rid });
  };

  logger.addContext = (ctx) => {
    return createNewLogger(moduleName, { session, extra: ctx });
  };

  Object.keys(logLevel).forEach((level) => {
    logger[level] = (content, additionalData) => {
      logger.level = logLevel[level];
      logger.message = content;
      logger.data = additionalData;
      if (level === 'error' || level === 'fatal') {
        logger.isError = true;
      }
      log(
        logLevel[level],
        logger.tags,
        logger.context,
        logger.message,
        logger.isError,
        logger.data,
      );
    };
  });

  return logger;
}

let infoLogger = createNewLogger('log service');
infoLogger.info('log service initiated', { threshold });

export default createNewLogger;
