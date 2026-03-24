import {getAllValuesInContext, getFirstValueInContext, hasAttribute} from '../../../utils/data-utils.js';
import {getIsbn} from '../../product-utils.js';
import {getTitle} from '../../record-utils.js';

/**
 * Generates 903 field for print and electronical records. Field contains information about publications containing ISBN that does not contain Finnish country code.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 903
 */
export function generate903Common(_onixConversionConfiguration, valueInterface) {
  const {isbn10, isbn13} = getIsbn(valueInterface);
  const containsNoIsbn = isbn10.length === 0 && isbn13.length === 0;

  if (containsNoIsbn) {
    return [];
  }

  const finnishIsbn10 = isbn10.filter(isbn => isbn.startsWith('951') || isbn.startsWith('952'));
  const finnishIsbn13 = isbn13.filter(isbn => isbn.startsWith('978-951') || isbn.startsWith('978-952'));
  const finnishIsbn = finnishIsbn10.concat(finnishIsbn13);
  const hasFinnishIsbn = finnishIsbn.length > 0;

  const nonFinnishIsbn10 = isbn10.filter(isbn => !isbn.startsWith('951') && !isbn.startsWith('952'));
  const nonFinnishIsbn13 = isbn13.filter(isbn => !isbn.startsWith('978-951') && !isbn.startsWith('978-952'));
  const nonFinnishIsbn = nonFinnishIsbn10.concat(nonFinnishIsbn13);
  const hasNonFinnishIsbn = nonFinnishIsbn.length > 0;

  if (!hasNonFinnishIsbn || hasFinnishIsbn) {
    return [];
  }

  return [
    {
      tag: '903',
      subfields: [
        {code: 'a', value: 'c'},
        {code: '5', value: 'FENNI'}
      ]
    }
  ];
}

/**
 * Generates 946 field for print and electronical records. Field contains ONIX title and subtitle in original form.
 * This field is used for record deduplication in Melinda merge.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 946
 */
export function generate946Common(_onixConversionConfiguration, valueInterface) {
  const {title, subtitle} = getTitle(valueInterface, false);

  if (!title) {
    return [];
  }

  // Subfields are constructed like this to have proper order
  const subfields = [
    {code: 'i', value: 'Nimeke Onixissa:'},
    {code: 'a', value: title}
  ];

  if (subtitle) {
    subfields.push({code: 'b', value: subtitle});
  }

  subfields.push({code: '5', value: 'MELINDA'});

  return [{
    tag: '946',
    subfields
  }];
}

/**
 * Generates 974 field for print and electronical records that are not legal deposit records.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 974
 */
export function generate974Common(onixConversionConfiguration, valueInterface) {
  const {isLegalDeposit, relatedWorkReferenceName} = onixConversionConfiguration;

  // Do not generate for legal deposit material
  if (isLegalDeposit || !relatedWorkReferenceName) {
    return [];
  }

  const relatedWorkIdentifiers = valueInterface
    .getValues('RelatedMaterial', 'RelatedWork')
    .reduce((prev, next) => {
      // Find all related work identifiers and add to result if result does not yet contain said identifier
      const workIdentifiers = getAllValuesInContext(next, 'WorkIdentifier')
        .filter(workIdentifier => hasAttribute(workIdentifier, 'IDValue'))
        .map(workIdentifier => getFirstValueInContext(workIdentifier, 'IDValue'))
        .filter(workIdentifier => !prev.includes(workIdentifier));

      return prev.concat(workIdentifiers);
    }, []);

  return relatedWorkIdentifiers.map(relatedWorkIdentifier => ({
    tag: '974',
    subfields: [
      {code: 'a', value: relatedWorkReferenceName},
      {code: 'b', value: relatedWorkIdentifier},
      {code: '5', value: 'FENNI'}
    ]
  }));
}

/**
 * Generastes 984 field that includes control directive for handling the record during Melinda merge.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 984
 */
// eslint-disable-next-line no-unused-vars
export function generate984Common(onixConversionConfiguration, _valueInterface) {
  const validDirectiveTypes = ['ALWAYS-PREFER-IN-MERGE', 'NEVER-PREFER-IN-MERGE'];
  const {f984Directives = []} = onixConversionConfiguration;

  const validDirectives = f984Directives.filter(directive => validDirectiveTypes.includes(directive));
  if (validDirectives.length === 0) {
    return [];
  }

  const subfieldAs = validDirectives.map(controlDirective => ({code: 'a', value: controlDirective}));

  return [{
    tag: '984',
    subfields: [
      ...subfieldAs,
      {code: '5', value: 'MELINDA'}
    ]
  }];
}