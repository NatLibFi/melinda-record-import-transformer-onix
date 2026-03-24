import {getGTIN, getIsbn, getIsmn} from '../../product-utils.js';

/**
 * Generate field 024 for record of electronic type using GTIN information.
 * Generated only if ISBN/ISMN for the product cannot be found.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns Empty array or array with field 041 with subfield $a or $d
 */
export function generate024Electronic(_onixConversionConfiguration, valueInterface) {
  const {isbn10, isbn13} = getIsbn(valueInterface);
  const containsIsbn = isbn10.length > 0 || isbn13.length > 0;

  const {ismn10, ismn13} = getIsmn(valueInterface);
  const containsIsmn = ismn10.length > 0 || ismn13.length > 0;

  if (containsIsbn || containsIsmn) {
    return [];
  }

  const gtins = getGTIN(valueInterface);
  return gtins.map(gtin => ({tag: '024', ind1: '8', subfields: [{code: 'a', value: gtin}]}));
}