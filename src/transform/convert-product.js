import {RECORD_TYPES} from '../constants.js';
import ConversionError from '../errors/ConversionError.js';
import {getRecordType} from './record-utils.js';

import generatePrintRecord from './generators/print/generate-print-record.js';
import generateElectronicRecord from './generators/electronic/generate-electronic-record.js';

/**
 * Convert ONIX product to MARC record using the given source configuration.
 * @param {import('../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @returns {MarcRecord} MarcRecord object
 */
export default (onixConversionConfiguration) => {
  // Pseudonym must begin with MELINDA if configuration needs to be Melinda compliant
  // Not Melinda compliant configurations are not currently supported
  const {pseudonym} = onixConversionConfiguration;
  const pseudonymIsValid = pseudonym.startsWith('MELINDA', 0);
  if (!pseudonymIsValid) {
    throw new Error(`Error during validating onix conversion configuration: pseudonym value (${pseudonym}) does not start with prefix "MELINDA"`);
  }

  // Return function that converts given product to MARC record using the given configuration
  return async (valueInterface, sentTime, commonErrorPayload) => {
    try {
      // Validate record type with given configuration
      validateOnixConversionConfiguration(onixConversionConfiguration, valueInterface);

      // Generate desired type of record (print or electronical)
      const recordType = getRecordType(valueInterface);
      const recordTypeIsValid = [RECORD_TYPES.PRINT, RECORD_TYPES.ELECTRONIC].includes(recordType);

      if (recordType === null || !recordTypeIsValid) {
        throw new Error('Could not determine supported record type for product: either DescriptiveDetail.ProductForm was not defined or contained value that is not supported by the conversion');
      }

      const recordGenerator = recordType === RECORD_TYPES.PRINT ? generatePrintRecord : generateElectronicRecord;
      return recordGenerator(onixConversionConfiguration, valueInterface, sentTime);
    } catch (error) {
      throw new ConversionError(commonErrorPayload, error.message);
    }
  };
};

/**
 * Validates configuration given for ONIX->MARC21 conversion for given product.
 * @param {import('../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if configuration is valid
 * @throws Error if configuration is not valid
 * @throws ConversionError if configuration cannot be used for Product given the notification type
 */
export function validateOnixConversionConfiguration(onixConversionConfiguration, valueInterface) {
  // Note: prepublication and legal deposit pipeline valid types do share type 03 notification.
  // In prepublication pipeline this is evaluated to be advanced notification.
  const prepublicationNotificationTypes = ['01', '02', '03'];
  const legalDepositNotificationTypes = ['03'];

  const notificationType = valueInterface.getValue('NotificationType');
  const {isLegalDeposit} = onixConversionConfiguration;

  // Legal deposit must be boolean
  if (typeof isLegalDeposit !== 'boolean') {
    throw new Error('Error during validating onix conversion configuration: isLegalDeposit value is not a boolean');
  }

  const isValidLegalDepositNotification = isLegalDeposit && legalDepositNotificationTypes.includes(notificationType);
  const isValidPrepublicationNotification = !isLegalDeposit && prepublicationNotificationTypes.includes(notificationType);

  const notificationIsAccepted = isValidLegalDepositNotification || isValidPrepublicationNotification;
  if (!notificationIsAccepted) {
    throw new Error(`Invalid onix conversion configuration: NotificationType of ${notificationType} is not allowed when isLegalDeposit is ${isLegalDeposit}`);
  }

  return true;
}