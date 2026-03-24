import {getAllValuesInContext, getFirstValueInContext} from '../../../utils/data-utils.js';
import {filterByFirstValue, getImprintNames, getPublisherNames, validateAndParseIsbn} from '../../product-utils.js';
import {getContributors, translateContributorRoleCode} from '../../record-utils.js';

/**
 * Generates 700 field for print and electronical records.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 700
 */
export function generate700Common(_onixConversionConfiguration, valueInterface) {
  const {contributors} = getContributors(valueInterface);
  const personContributors = contributors.filter(contributor => typeof contributor.personNameInverted === 'string');

  if (personContributors.length === 0) {
    return [];
  }

  return personContributors.map(contributor => {
    const {personName, personNameInverted, roleCodes} = contributor;
    const nameInversionIsTrue = personNameInverted.includes(',') && personName !== personNameInverted;

    const roles = roleCodes.map(translateContributorRoleCode).filter(v => v !== null);
    const roleSubfields = roles.map((role, idx) => {
      const isLastEntry = idx === roles.length - 1;
      const punctuation = isLastEntry ? '.' : ',';

      return {code: 'e', value: `${role}${punctuation}`};
    });

    const subfieldAPunctuation = roleSubfields.length > 0 ? ',' : '.';

    return {
      tag: '700',
      ind1: nameInversionIsTrue ? '1' : '0',
      subfields: [
        {code: 'a', value: `${personNameInverted}${subfieldAPunctuation}`},
        ...roleSubfields
      ]
    };
  });
}

/**
 * Generates 710 field for print and electronical records. Uses contributors with CorporateName and publisher information.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 710
 */
export function generate710Common(_onixConversionConfiguration, valueInterface) {
  const {contributors} = getContributors(valueInterface);

  // Prioritize imprint information over publisher information
  // For fields with $e containing publisher role
  const imprintValues = getImprintNames(valueInterface);
  const publisherValues = getPublisherNames(valueInterface);
  const publisherFieldValues = imprintValues.length > 0 ? imprintValues : publisherValues;
  const publisherFields = publisherFieldValues.map(publisherFieldValue => ({
    tag: '710',
    ind1: '2',
    subfields: [
      {code: 'a', value: `${publisherFieldValue},`},
      {code: 'e', value: 'kustantaja.'}
    ]
  }));

  const corporateContributors = contributors.filter(contributor => typeof contributor.corporateName === 'string');
  const corporateContributorFields = corporateContributors.map(contributor => {
    const {corporateName, roleCodes} = contributor;

    const roles = roleCodes.map(translateContributorRoleCode).filter(v => v !== null);
    const roleSubfields = roles.map((role, idx) => {
      const isLastEntry = idx === roles.length - 1;
      const punctuation = isLastEntry ? '.' : ',';

      return {code: 'e', value: `${role}${punctuation}`};
    });

    const subfieldAPunctuation = roleSubfields.length > 0 ? ',' : '.';

    return {
      tag: '710',
      ind1: '2',
      subfields: [
        {code: 'a', value: `${corporateName}${subfieldAPunctuation}`},
        ...roleSubfields
      ]
    };
  });

  return corporateContributorFields.concat(publisherFields);
}

/**
 * Generate f776 for print and electronical records from related product ISBN/GTIN-13 information.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 776
 */
export function generate776Common(_onixConversionConfiguration, valueInterface) {
  /*
  Onix Code Lists:  List 51: Product relation
  https://ns.editeur.org/onix/en/51

  06 | Alternative format
  */

  /*
  Onix Code Lists:  List 5: Product identifier type
  https://ns.editeur.org/onix/en/5

  03 | GTIN-13
  15 | ISBN-13
  */
  const allowedProductIdentifierTypes = ['03', '15'];

  const relatedProducts = valueInterface.getValues('RelatedMaterial', 'RelatedProduct').filter(relatedProduct => filterByFirstValue(relatedProduct, 'ProductRelationCode', ['06']));

  // Iterates over related products
  const relatedProductIsbnValues = relatedProducts.reduce((prev, next) => {
    const productIdentifiers = getAllValuesInContext(next, 'ProductIdentifier');

    // Iterates over each related product identifiers as there may be multiple identifiers available
    // Seeks only valid ISBN identifiers and adds hyphenated format of ISBN-13 to array
    const isbnIdentifiers = productIdentifiers.reduce((foundIsbn, productIdentifier) => {
      const productIdentifierType = getFirstValueInContext(productIdentifier, 'ProductIDType');
      const mayContainIsbn = allowedProductIdentifierTypes.includes(productIdentifierType);
      if (!mayContainIsbn) {
        return foundIsbn;
      }

      const identifier = getFirstValueInContext(productIdentifier, 'IDValue');
      const isbnInformation = validateAndParseIsbn(identifier);
      if (isbnInformation === null) {
        return foundIsbn;
      }

      return [...foundIsbn, isbnInformation.isbn13h];
    }, []);

    return prev.concat(isbnIdentifiers);
  }, []);

  const deduplicatedIsbnValues = relatedProductIsbnValues.reduce((prev, next) => prev.includes(next) ? prev : [...prev, next], []);

  return deduplicatedIsbnValues.map(isbn => ({
    tag: '776',
    ind1: '0',
    subfields: [
      {code: 'z', value: isbn}
    ]
  }));
}