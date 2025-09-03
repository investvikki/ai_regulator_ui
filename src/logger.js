import log from 'loglevel';

// Set default log level (can be changed dynamically)
log.setLevel('info');

const logger = {
  trace: (...args) => log.trace(...args),
  debug: (...args) => log.debug(...args),
  info: (...args) => log.info(...args),
  warn: (...args) => log.warn(...args),
  error: (...args) => log.error(...args),
  setLevel: (level) => log.setLevel(level),
};

export default logger;
