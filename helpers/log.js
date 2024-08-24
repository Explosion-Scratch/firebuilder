const log = {
  debug: (...args) => console.log("\x1b[36m[DEBUG]\x1b[0m", ...args),
  error: (...args) => console.error("\x1b[31m[ERROR]\x1b[0m", ...args),
  info: (...args) => console.info("\x1b[34m[INFO]\x1b[0m", ...args),
  warn: (...args) => console.warn("\x1b[33m[WARN]\x1b[0m", ...args),
};

export default log;
