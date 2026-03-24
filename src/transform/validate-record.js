import validateFactory from '@natlibfi/marc-record-validate';
import {
  IsbnIssn,
  IndicatorFixes,
  FieldExclusion,
  Urn,
  AccessRights,
  EndingPunctuation,
  Punctuation,
  RemoveDuplicateDataFields
} from '@natlibfi/marc-record-validators-melinda';

import ValidationError from '../errors/ValidationError.js';

/**
 * Generate validation pipeline for MARC-records produced by ONIX transformation based on the given configuration.
 * @param {import('../types.js').MarcRecordValidatorConfiguration} marcRecordValidatorConfiguration - NARC record validation configuration
 * @returns {Function} Async function taking MARC record as input
*/
export default (marcRecordValidatorConfiguration) => {
  validateMarcRecordValidatorConfiguration(marcRecordValidatorConfiguration);
  const {isLegalDeposit, fix, validateFixes} = marcRecordValidatorConfiguration;

  const validators = [
    IsbnIssn({hyphenateISBN: true}),
    IndicatorFixes(),
    FieldExclusion([
      {
        tag: /^520$/u
      }
    ]),
    EndingPunctuation(),
    Punctuation(),
    RemoveDuplicateDataFields()
  ];

  // Add URN and access rights validation for legal deposit entries
  if (isLegalDeposit) {
    validators.push(Urn(true));
    validators.push(AccessRights());
  }

  // Initialize validation function here and return wrapper that uses this function
  const validatorFunction = validateFactory(validators);

  return async (record, commonErrorPayload) => {
    const result = await validatorFunction(record, {fix, validateFixes});

    if (result.valid === false) {
      const failMessages = result.report.filter(report => report.state === 'invalid').map(report => report.description);
      throw new ValidationError(commonErrorPayload, `Validating transformed record failed with following messages: ${JSON.stringify(failMessages)}`);
    }

    return result.record.toObject();
  };
};

/**
 * Validate configuration given to MARC record validation in order to avoid problems regarding undefined behavior.
 * @param {import('../types.js').MarcRecordValidatorConfiguration} marcRecordValidatorConfiguration - NARC record validation configuration
 * @returns {boolean} true if configuration is valid, otherwise will throw an Error
 */
export function validateMarcRecordValidatorConfiguration(marcRecordValidatorConfiguration) {
  const {isLegalDeposit, fix, validateFixes} = marcRecordValidatorConfiguration;

  if (typeof isLegalDeposit !== 'boolean') {
    throw new Error('marcRecordValidatorConfiguration.isLegalDeposit does not have boolean value available which is mandatory');
  }

  if (typeof fix !== 'boolean') {
    throw new Error('marcRecordValidatorConfiguration.fix does not have boolean value available which is mandatory');
  }

  if (typeof validateFixes !== 'boolean') {
    throw new Error('marcRecordValidatorConfiguration.validateFixes does not have boolean value available which is mandatory');
  }

  return true;
}