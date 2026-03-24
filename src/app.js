import amqplib from 'amqplib';
import createDebugLogger from 'debug';

import {transformerBlobLogic, createMongoBlobsOperator, createAmqpOperator} from '@natlibfi/melinda-record-import-commons';

import createTransformPipeline from './transform/transform-pipeline.js';
import {getApplicationLogger} from './utils/logging.js';

/**
 * Start pipeline which processes ONIX transformer pipeline within Melinda Record Import environment per the given configuration.
 * @param {import('./types.js').ProcessRuntimeConfiguration} runtimeConfiguration - runtime configuration for the processing loop
 */
export async function startOnixTransformerPipelineProcess(runtimeConfiguration) {
  const logger = getApplicationLogger('debug');
  const debug = createDebugLogger('@natlibfi/melinda-record-import-transformer-onix');
  const {recordImportConfiguration, onixConversionConfiguration, filterConfiguration} = runtimeConfiguration;

  // In automated pipeline (src/app.js) always fix and validate fixes during record validation phase
  // This effectively makes marcRecordValidatorConfiguration static with the exception of using isLegalDeposit from onixConversionConfiguration
  const marcRecordValidatorConfiguration = {
    isLegalDeposit: onixConversionConfiguration.isLegalDeposit,
    fix: true,
    validateFixes: true
  };

  // See last parameter of https://github.com/NatLibFi/melinda-record-import-commons-js/blob/213eb32dc39b4e7b104013c1a54e097f5c559a7c/src/transformer/index.js#L10C77-L10C83

  // Based on code investigation, following are available parameters as of 2026-01-14
  // - abortOnInvalidRecords
  // - nextQueueStatus
  // - polltime
  // - profileIds
  // - readFrom

  const blobHandlerConfiguration = {
    abortOnInvalidRecords: recordImportConfiguration.abortOnInvalidRecords,
    nextQueueStatus: recordImportConfiguration.nextQueueStatus,
    polltime: recordImportConfiguration.polltime,
    profileIds: recordImportConfiguration.profileIds
  };

  try {
    debug(runtimeConfiguration.mongoUrl);
    const mongoOperator = await createMongoBlobsOperator(recordImportConfiguration.mongoUrl);
    logger.debug('Mongo connection OK');
    const amqpOperator = await createAmqpOperator(amqplib, recordImportConfiguration.amqpUrl);
    logger.debug('AMQP connection OK');
    const onixTransformerPipeline = createTransformPipeline({filterConfiguration, onixConversionConfiguration, marcRecordValidatorConfiguration});

    logger.info(`Starting melinda record import transformer onix profile: ${recordImportConfiguration.profileIds}`);

    await transformerBlobLogic(mongoOperator, amqpOperator, onixTransformerPipeline, blobHandlerConfiguration);
  } catch (error) {
    logger.error(error);
  } finally {
    await amqpOperator.closeChannel();
    await amqpOperator.closeConnection();
    await mongoOperator.closeClient();
  }
}
