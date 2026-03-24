import {DateTime} from 'luxon';

import {getPublishingDates, hasIllustrations, isComic, isText} from '../../product-utils.js';
import {getF008BookGenre, getF008Language, getF008PublicationCountry, getF008TargetAudience} from '../../record-utils.js';

/**
 * Generate Leader field for record with print type. Note the field is static.
 * @returns {string} fLDR string
 */
export function generateLeaderPrint() {
  return '00000nam a22000008i 4500';
}


/**
 * Generate 008 for record with print type.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} f008 datafield(s)
 */
export function generate008Print(onixConversionConfiguration, valueInterface) {
  const text = isText(valueInterface);

  // Shared between formats
  const date = DateTime.now().toFormat('yyMMdd'); // 00-05
  const publicationDateType = 's'; // 06
  const [earliestPublishingDate = {year: '||||'}] = getPublishingDates(valueInterface); // 07-10
  const publicationYear2 = '    '; // 11-14
  const publicationCountry = getF008PublicationCountry(valueInterface); // 15-17
  const language = getF008Language(valueInterface, onixConversionConfiguration.languageSanityCheck); // 35-37

  // BK specific
  const illustrations = text && hasIllustrations(valueInterface) ? 'a   ' : '||||'; // 18-21
  const targetAudience = getF008TargetAudience(valueInterface); // 22
  const content = isComic(valueInterface) ? '6   ' : '||||'; // 24-27
  const subjectSchemeName = text ? getF008BookGenre(valueInterface) : '|'; // 33

  const value = `${date}${publicationDateType}${earliestPublishingDate.year}${publicationYear2}${publicationCountry} ${illustrations}${targetAudience}|${content}|||||${subjectSchemeName}|${language}||`;

  return [{tag: '008', value}];
}
