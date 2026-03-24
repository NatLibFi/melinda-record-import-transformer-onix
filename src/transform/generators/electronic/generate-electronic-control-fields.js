import {DateTime} from 'luxon';

import {getPublishingDates, hasIllustrations, isAudio, isComic, isText} from '../../product-utils.js';
import {getF008AudioGenre, getF008BookGenre, getF008Language, getF008PublicationCountry, getF008TargetAudience} from '../../record-utils.js';

/**
 * Generate Leader field for record of electronical type.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string} fLDR string
 */
export function generateLeaderElectronic(onixConversionConfiguration, valueInterface) {
  const audio = isAudio(valueInterface);
  const text = isText(valueInterface);

  if (!audio && !text) {
    throw new Error('[generateLeaderElectronic]: cannot generate field for record that is not audio or text');
  }

  const type = audio ? 'i' : 'a';
  const encodingLevel = onixConversionConfiguration.isLegalDeposit ? '2' : '8';

  return `00000n${type}m a2200000${encodingLevel}i 4500`;
}

/**
 * Generate 006 field for record of electronical type.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').ControlField[]} controlfield f006 within an array
 */
export function generate006Electronic(_onixConversionConfiguration, valueInterface) {
  const audio = isAudio(valueInterface);
  const text = isText(valueInterface);

  if (!audio && !text) {
    throw new Error('[generate006Electronic]: cannot generate field for record that is not audio or text');
  }

  const fileType = audio ? 'h' : 'd';

  return [{tag: '006', value: `m|||||o||${fileType}||||||||`}];
}

/**
 * Generate 007 field for record of electronical type.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').ControlField[]} controlfield(s) f007 within an array
 */
export function generate007Electronic(_onixConversionConfiguration, valueInterface) {
  const audio = isAudio(valueInterface);
  const text = isText(valueInterface);

  if (!audio && !text) {
    throw new Error('[generate007Electronic]: cannot generate field for record that is not audio or text');
  }

  if (audio) {
    return [
      {tag: '007', value: 'sr|uunnnnnuneu'},
      {tag: '007', value: 'cr|nnannnuuuuu'}
    ];
  }

  return [{tag: '007', value: 'cr||||||||||||'}];
}

/**
 * Generate 008 for record of electronical type.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').ControlField[]} controlfield f008 within an array
 */
export function generate008Electronic(onixConversionConfiguration, valueInterface) {
  const text = isText(valueInterface);
  const audio = isAudio(valueInterface);

  // Shared for BK/MU
  const date = DateTime.now().toFormat('yyMMdd'); // 00-05
  const publicationDateType = 's'; // 06
  const [earliestPublishingDate = {year: '||||'}] = getPublishingDates(valueInterface); // 07-10
  const publicationYear2 = '    '; // 11-14
  const publicationCountry = getF008PublicationCountry(valueInterface); // 15-17
  const targetAudience = getF008TargetAudience(valueInterface); // 22
  const typeOfPublication = 'o'; // 23
  const language = getF008Language(valueInterface, onixConversionConfiguration.languageSanityCheck); // 35-37

  // Requires some type of getters based on format
  const illustrations = text && hasIllustrations(valueInterface) ? 'a   ' : '||||'; // 18-21
  const content = isComic(valueInterface) ? '6   ' : '||||'; // 24-27
  const bkSubjectSchemeName = text ? getF008BookGenre(valueInterface) : '|'; // 33
  const audioSubjectSchemeName = audio ? getF008AudioGenre(valueInterface) : '||'; // 30-31

  const value = `${date}${publicationDateType}${earliestPublishingDate.year}${publicationYear2}${publicationCountry} ${illustrations}${targetAudience}${typeOfPublication}${content}||${audioSubjectSchemeName}|${bkSubjectSchemeName}|${language}||`;

  return [{tag: '008', value}];
}
