import createDebugLogger from 'debug';

import {getRecordType} from '../record-utils.js';
import {RECORD_TYPES} from '../../constants.js';

import FilterError from '../../errors/FilterError.js';

/**
 * Filter ONIX products which either do not have valid DescriptiveDetail.ProductForm value or would be transformed into the type of record
 * that is not wished to be processed within the given pipeline.
 * @param {import('../../types.js').ValueInterface} valueInterface - ValueInterface containing getValue/getValues functions
 * @param {{allowRecordTypes: string[]}} settings - product form filter settings describin allowed record types
 * @param {import('../../types.js').CommonErrorPayload} commonErrorPayload - payload to use for errors extending TransformationPipelineError
 * @returns {boolean} true if filter passes
 * @throws FilterError if filter configuration is valid, but Product should not pass filter
 * @throws Error if filter configuration is invalid
 */
export default function (valueInterface, settings, commonErrorPayload) {
  const debug = createDebugLogger('@natlibfi/melinda-record-import/transformer-onix:transform:filters:product-form');

  const {allowRecordTypes} = settings;
  const configurationIsNotValid = !allowRecordTypes || !Array.isArray(allowRecordTypes) || allowRecordTypes.length === 0;

  if (configurationIsNotValid) {
    debug(`allowRecordTypes: ${allowRecordTypes}`);
    throw new Error('Required configuration for product-form filter is not valid: allowRecordTypes setting is not an array of valid string values.');
  }

  const validRecordTypes = Object.values(RECORD_TYPES);
  const configurationValuesNotValid = allowRecordTypes.some(recordType => !validRecordTypes.includes(recordType));

  if (configurationValuesNotValid) {
    debug(`allowRecordTypes: ${allowRecordTypes}`);
    throw new Error(`Configuration values for product-form filter are not valid. Requested: ${JSON.stringify(allowRecordTypes)}, Available: ${JSON.stringify(validRecordTypes)}.`);
  }

  const recordType = getRecordType(valueInterface);
  if (!recordType) {
    const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
    throw new FilterError(commonErrorPayload, `[product-form-filter] Record type could not be determined for product form value of "${productForm}"`);
  }

  const recordTypeIsValid = allowRecordTypes.includes(recordType);

  if (recordTypeIsValid) {
    return true;
  }

  throw new FilterError(commonErrorPayload, `[product-form-filter] Record type (${recordType}) is not in allowed record types (${JSON.stringify(allowRecordTypes)})`);
}
