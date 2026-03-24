import {startOnixTransformerPipelineProcess} from './app.js';
import {logLevel, runtimeConfiguration} from './config.js';

import packageJson from '../package.json' with {type: 'json'};
import {createApplicationLogger} from './utils/logging.js';

run(); // Starts the process

export async function run(test = false) {
  const logger = createApplicationLogger(logLevel);
  registerInterruptionHandlers();

  if (test) {
    return runtimeConfiguration;
  };

  logger.info(`Starting onix-transfomer v${packageJson.version}`);
  try {
    await startOnixTransformerPipelineProcess(runtimeConfiguration);
  } catch (error) {
    logger.error(error);
  }
}

function registerInterruptionHandlers() {
  process
    .on('SIGTERM', (signal) => {
      logger.warn(`Received signal: ${signal}. Exiting.`);
      process.exit(128 + signal);
    })
    .on('SIGINT', (signal) => {
      logger.warn(`Received signal: ${signal}. Exiting.`);
      process.exit(128 + signal);
    })
    .on('uncaughtException', (err) => {
      logger.error(`Process was interrupted by uncaught exception: ${err}`);
      process.exit(1);
    })
    .on('unhandledRejection', () => process.exit(1));
}
