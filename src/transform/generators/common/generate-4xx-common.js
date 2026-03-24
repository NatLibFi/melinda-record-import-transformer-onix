import {getCollectionInformation} from '../../product-utils.js';

/**
 * Generates 490 field for print and electronical records if collection information is found.
 * For collections that are not publisher collections only $x is generated.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 490
 */
export function generate490Common(_onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 148: Collection type
  https://ns.editeur.org/onix/en/148

  10 | Publisher collection
  */

  const collectionsInformation = getCollectionInformation(valueInterface);
  const fields = collectionsInformation.map(collectionInformation => {
    const {
      type,
      title,
      partNumber,
      issnIdentifiers,
      sequenceNumbers,
    } = collectionInformation;

    const hasSequence = sequenceNumbers.length > 0;
    const hasPartNumber = Boolean(partNumber);

    const subfieldAPunctuation = hasSequence || hasPartNumber ? ' ;' : '';
    const subfieldAValue = title ? `${title}${subfieldAPunctuation}` : null;

    const subfieldA = subfieldAValue ? [{code: 'a', value: subfieldAValue}] : [];
    const subfieldsX = issnIdentifiers.map(issn => ({code: 'x', value: issn}));

    // All sequence numbers and part number will produce $v
    // Deduplicate values so that same subfield is not generated twice
    const subfieldVValues = [partNumber, ...sequenceNumbers].reduce((prev, next) => next && !prev.includes(next) ? prev.concat(next) : prev, []);
    const subfieldsV = subfieldVValues.map(v => ({code: 'v', value: v}));

    // For publisher collections allow all subfields to be generated, otherwise generate only $x
    // Disallow generating other than $x if collection title is not defined
    const isPublisherCollection = type === '10';
    const subfields = isPublisherCollection && title ? [...subfieldA, ...subfieldsX, ...subfieldsV] : [...subfieldsX];

    return {
      tag: '490',
      ind1: '0',
      subfields
    };
  });

  // Only return fields that contain subfield $a or $x
  return fields
    .filter(field => {
      const containsMandatorySubfield = field.subfields.some(subfield => ['a', 'x'].includes(subfield.code));
      return containsMandatorySubfield;
    });
}
