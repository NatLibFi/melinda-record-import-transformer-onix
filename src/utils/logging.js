import {DateTime} from 'luxon';
import winston from 'winston';

// Logger is a singleton (see e.g., https://refactoring.guru/design-patterns/singleton)
let APPLICATION_LOGGER;

/**
 * Create application logger
 * @param {string} logLevel - level of logging to apply
 * @returns {Object} instance of winston.Logger
 */
export function createApplicationLogger(logLevel = 'info') {
  APPLICATION_LOGGER = winston.createLogger({...createLoggerOptions(logLevel)});
  return APPLICATION_LOGGER;
}

/**
 * Get application logger
 * @returns {Object} instance of winston.Logger if logger has been created, otherwise throws error
 */
export function getApplicationLogger() {
  if (!APPLICATION_LOGGER) {
    throw new Error('application logger has not been created');
  }

  return APPLICATION_LOGGER;
}

/**
 * Reset application logger to undefined state. Used for tests.
 */
export function resetApplicationLogger() {
  APPLICATION_LOGGER = undefined;
}

/**
 * Create options for Winston logger
 * @param {string} logLevel - log level to apply
 * @returns {Object} object containing winston logger options
 */
function createLoggerOptions(logLevel = 'info') {
  const timestamp = winston.format((info) => ({...info, timestamp: DateTime.now().toISO()}));

  return {
    format: winston.format.combine(timestamp(), winston.format.printf(formatMessage)),
    transports: [
      new winston.transports.Console({
        level: logLevel,
        silent: logLevel === 'silent'
      })
    ]
  };
}

/**
 * Log message formatter function for Winston
 * @param {Object} info - printf info as described in https://github.com/winstonjs/logform?tab=readme-ov-file#printf
 * @returns {string} string formatted to Melinda log convention
 */
function formatMessage(info) {
  return `${info.timestamp} - ${info.level}: ${info.message}`;
}