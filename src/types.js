// As of current date: this project uses JSDoc instructions for typing instead of TypeScript per Melinda Record Import ecosystem guidelines

/**
* @typedef {Object} FilterConfiguration
* @description Configuration for ONIX-tranformation pipeline filtering phase.
* @property {string[]} applyFilters - List of filter names to be applied
* @property {Object} settings - Settings for each filter to be applied. Object key should be filter name and it may contain keys described for selected filter.
*/

/**
* @typedef {Object} OnixConversionConfiguration
* @description Configuration for ONIX-tranformation pipeline transformer phase.
* @property {boolean} isLegalDeposit - Whether to use legal deposit transformation configuration or pre-publication transformation configuration
* @property {string} source - Source name from ONIX-field: ONIXMessage.Header.Sender.SenderName
* @property {string} pseudonym - Pseudonym for the source. Affects f884 generation.
* @property {string|undefined} relatedWorkReferenceName - relatedWorkReferenceName for the source. Affects f974 generation.
* @property {string|undefined} isilIdentifier - Source ISIL-identifier. Affects f040 $a generation.
* @property {string|undefined} notificationName - Source name to use for f500/f594 pre-publication notifications. Has no effect if using isLegalDeposit=true.
* @property {string|undefined} systemIdentifier - Source system identifier to use. Affects fSID generation.
* @property {string[]} f984Directives - Directives to include in f984 $a. These are instructions for Melinda merge operation.
* @property {boolean} languageSanityCheck - Whether to use additional verification of record language using language detection from title.
* @property {boolean} preventUniformTitleGeneration - Whether to prevent generation of unified title. Affects f130/f240 generation.
* @property {string[]} accessibilityBlacklist - List of publisher name entries for which to not generate f341 from ProductFormFeatures
*/

/**
* @typedef {Object} MarcRecordValidatorConfiguration
* @description Configuration for ONIX-tranformation pipeline record validation phase.
* @property {boolean} isLegalDeposit - Whether to use legal deposit transformation configuration or pre-publication transformation configuration
* @property {boolean} fix - Whether to attempt fixing validation pipeline issues. See: https://github.com/NatLibFi/marc-record-validate/blob/ccc5bbe3383d081a7fcf013838b46d197384eeed/src/index.js#L36C56-L36C73
* @property {boolean} validateFixes - Whether to validate fixes done during MARC record validation. See: https://github.com/NatLibFi/marc-record-validate/blob/ccc5bbe3383d081a7fcf013838b46d197384eeed/src/index.js#L36C56-L36C73
*/

/**
* @typedef {Object} OnixTransformationPipelineConfiguration
* @description Configuration for ONIX-tranformation pipeline including filter, transformer and validator.
* @property {FilterConfiguration} filterConfiguration - Configuration defining filtering options regarding ONIX-XML that should not be transformed
* @property {OnixConversionConfiguration} onixConversionConfiguration - Configuration defining how to transform ONIX-XML to Marc record
* @property {MarcRecordValidatorConfiguration} marcRecordValidatorConfiguration - Configuration defining options to use for marc record validation pipeline
*/

/**
* @typedef {Object} RecordImportConfiguration
* @description Configuration for Record Import variables for ONIX-tranformation pipeline.
* @property {boolean} abortOnInvalidRecords - Whether blob should be failed if even one record fails
* @property {string} amqpUrl - AMQP service URL.
* @property {string} mongoUrl - MongoDB service URL.
* @property {string} nextQueueStatus - Status to define for blob after it has completed ONIX transformation successfully.
* @property {string[]} profileIds - Which profiles should be processed by the ONIX-transformation process.
* @property {string} readFrom - From which status to read blobs from. Note that 'blobContent' status maps to initial XML content.
*/

/**
* @typedef {Object} ProcessRuntimeConfiguration
* @description Configuration for the runtime process which combines Melinda Record Import pipeline configuration with Onix Transformer pipeline configuration.
* @property {RecordImportConfiguration} recordImportConfiguration - Configuration defining options to use for Melinda Record Import environment
* @property {FilterConfiguration} filterConfiguration - Configuration defining filtering options regarding ONIX-XML that should not be transformed
* @property {OnixConversionConfiguration} onixConversionConfiguration - Configuration defining how to transform ONIX-XML to Marc record
*/

/**
* @typedef {Object} ValueInterface
* @description Interface for basic getters to read the ONIX Product values.
* @property {Function} getRecord - Debug function for getting stringified record of value interface
* @property {Function} getValue - Function for getting first value within the product for the path given as parameter
* @property {Function} getValues - Function for getting all values within the product for the path given as parameter
*/

/**
* @typedef {Object} CommonErrorPayload
* @description Shared error payload type between different phases of processing. Structure of this is determined by Melinda Record Import system.
* @property {string|undefined} title - First value of ONIX product DescriptiveDetail.TitleDetail.TitleElement.TitleText
* @property {string[]} standardIdentifiers - Values from following ONIX product fields: Product.RecordReference, ProducIdentifier with ProductIDType of 02 or 15.
*/

/**
* @typedef {Object} ControlField
* @description MARC21 record control field. These do contain values and no subfields.
* @property {string} tag - Tag of the field
* @property {string} value - Value of the field
*/

/**
* @typedef {Object} Subfield
* @description MARC21 record subfield.
* @property {string} code - Code of the subfield
* @property {string} value - Value of the subfield
*/

/**
* @typedef {Object} DataField
* @description MARC21 record data field that contains subfields.
* @property {string} tag - Tag of the field
* @property {string|undefined} ind1 - Indicator 1 value
* @property {string|undefined} ind2 - Indicator 2 value
* @property {Subfield[]} subfields - List of subfields
*/

/**
* @typedef {Object} ProductPublishingDateInfo
* @description Information object describing product publishing date
* @property {string} role - Code for publishing date role (https://ns.editeur.org/onix/en/163)
* @property {string} rawValue - Unprocessed value of the XML field PublishingDetail.PublishingDate.Date
* @property {string} year - Year parsed from the unprocessed value
*/

/**
 * @typedef {Object} Contributor
 * @description Author or contributor information
 * @property {string|null|undefined} personName - Contributor person name
 * @property {string|null|undefined} personNameInverted - Contributor person name in inverted format
 * @property {string|null|undefined} corporateName - Contributor corporate name
 * @property {Role[]} roleCodes - All role codes of author/contributor
 * @property {boolean} isTranslator - Whether person is translator or not based on role codes
 * @property {number|null} sequenceNumber - SequenceNumber mapping
 */

/**
 * @typedef {Object} ValidatedContributor
 * @description Validated contributor information
 * @property {string|null|undefined} personName - Contributor person name
 * @property {string|null|undefined} personNameInverted - Contributor person name in inverted format
 * @property {string|null|undefined} corporateName - Contributor corporate name
 * @property {Role[]} roleCodes - All role codes of author/contributor
 * @property {boolean} isTranslator - Whether person is translator or not based on role codes
 * @property {number|null} sequenceNumber - SequenceNumber mapping
 * @property {boolean} isAiAuthor - Whether contributor had role code of A01 and unnamed person information of 09 (and thus is by definition identified as AI)
 */

/**
 * @typedef {Object} ItemContributors
 * @description Item contributor information
 * @property {ValidatedContributor[]} contributors - Item contributors excluding main author
 * @property {ValidatedContributor|null} mainAuthor - Item main author
*/

exports.unused = {};
