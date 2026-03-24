
import {EventEmitter} from 'events';

import xmlFlow from 'xml-flow';

import createFilterPipeline from './filter-product.js';
import createConversion from './convert-product.js';
import createValidatorPipeline from './validate-record.js';

import {createCommonErrorPayload, getProductDataSource} from './product-utils.js';
import {convertXml, createValueInterface, parseSender} from '../utils/data-utils.js';

import TransformPipelineError from '../errors/TransformPipelineError.js';

/**
 * Create ONIX Transformation pipeline with given configuration.
 * @param {import('../types.js').OnixTransformationPipelineConfiguration} transformationPipelineConfig - configuration for the transformer pipeline
 * @returns {Function} Function taking readable stream as parameter and returning new EventEmitter which runs input stream through transformation pipeline and emits following events: error, end, record
*/
// eslint-disable-next-line max-lines-per-function
export default transformationPipelineConfig => readableStream => {
  const {onixConversionConfiguration, marcRecordValidatorConfiguration, filterConfiguration} = transformationPipelineConfig;

  // Initialize validator pipeline functions based on configuration
  // Note: none of these or future initialization function should be asyncronous
  // Functions returned by initialization function may be async (and often will need to be)
  const filterRecord = createFilterPipeline(filterConfiguration);
  const convertProduct = createConversion(onixConversionConfiguration);
  const validateRecord = createValidatorPipeline(marcRecordValidatorConfiguration);

  const emitter = new EventEmitter();
  startTransformerPipeline();

  return emitter;

  async function startTransformerPipeline() {
    // Header informatio is shared between all products in the processed XML file
    let headerSenderInformation;

    // Used for deduplication
    const standardIdentifiersProcessed = [];

    xmlFlow(readableStream, {
      strict: true,
      trim: false,
      normalize: false,
      preserveMarkup: xmlFlow.ALWAYS,
      simplifyNodes: false,
      useArrays: xmlFlow.ALWAYS
    })
      // Note: these errors are XML parsing errors
      // Other errors are either halting which exists the process
      // or non-halting which will emit a failed record and allow continuing processing
      .on('error', xmlParseError => emitter.emit('error', xmlParseError))
      .on('end', () => emitter.emit('end'))
      .on('tag:Header', async xmlElement => {
        try {
          const xmlObject = await convertXml(xmlElement);
          headerSenderInformation = parseSender(xmlObject);
          return;
        } catch (headerParseError) {
          return emitter.emit('error', headerParseError);
        }
      })
      .on('tag:Product', async xmlElement => {
        try {
          const {Product: product} = await convertXml(xmlElement);
          const valueInterface = createValueInterface(product);
          const commonErrorPayload = createCommonErrorPayload(valueInterface);

          // Prioritize using header information regarding sender if it's available
          // Otherwise attempt to parse product data source information
          const dataSource = headerSenderInformation?.name || getProductDataSource(valueInterface);

          // Validate data source is expected for given transformation configuration
          if (!dataSource) {
            throw new Error('Could not determine record source from Header or Product. Refusing to process record without source information.');
          }

          if (dataSource !== onixConversionConfiguration.source) {
            throw new Error(`Not willing to transform file due to mismatch between real data source (${dataSource}) and configured source (${onixConversionConfiguration.source})`);
          }

          // Will throw FilterError if record is not allowed to pass
          filterRecord(valueInterface, commonErrorPayload);

          // Conversion process from ONIX product to MARC record may throw ConversionError
          const marcRecord = await convertProduct(valueInterface, headerSenderInformation?.sentTime, commonErrorPayload);

          // Will throw ValidationError if record is not valid
          const validatedMarcRecord = await validateRecord(marcRecord, commonErrorPayload);

          // Deduplication: Process a given standard identifier only once as otherwise Melinda Record Import API may have duplicate entries in same bulk request
          const alreadyProcessed = standardIdentifiersProcessed.some(value => commonErrorPayload.standardIdentifiers.includes(value));
          if (alreadyProcessed) {
            throw new TransformPipelineError(commonErrorPayload, 'Record has already been processed once within the current process (not allowing duplicates).');
          }

          // Add standard identifiers to processed array
          commonErrorPayload.standardIdentifiers.forEach(identifier => {
            standardIdentifiersProcessed.push(identifier);
          });

          // Processing of record is completed with given pipeline. Emit record.
          // Note: Melinda Record Import expects record-attribute to contain MARC record when emitting record that has not failed during transformation
          return emitter.emit('record', {record: validatedMarcRecord});
        } catch (error) {

          // Managed pipeline errors such as FilterError, ConversionError or ValidationError are all extensions of TransformPipelineError
          // These errors are errors regarding individual items and thus recoverable
          // Instances of recoverable type of errors are emitted as failed records so that
          // Melinda Record Import system may handle them properly
          if (error instanceof TransformPipelineError) {

            // Note: If record failed during transformation gracefully, Melinda Record Import expects emitted record object directly to contain description of the failure
            return emitter.emit('record', {
              failed: true,
              title: error.payload.title,
              standardIdentifiers: error.payload.standardIdentifiers,
              message: error.message
            });
          }

          return emitter.emit('error', error);
        }
      });
  }
};
