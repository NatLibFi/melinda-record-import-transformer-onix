import {EXTENT_TYPES, EXTENT_UNITS} from '../../../constants.js';
import {getFirstValueInContext} from '../../../utils/data-utils.js';
import {hasIllustrations, isComic, isPrintText} from '../../product-utils.js';

/**
 * Generates field 300 for record with print type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array with field 300 for print record
 */
// eslint-disable-next-line max-lines-per-function
export function generate300Print(_onixConversionConfiguration, valueInterface) {
  const extentFields = valueInterface.getValues('DescriptiveDetail', 'Extent');
  const measureFields = valueInterface.getValues('DescriptiveDetail', 'Measure');

  const printText = isPrintText(valueInterface);
  const illustrations = hasIllustrations(valueInterface);

  if (!printText) {
    return [];
  }

  // Generate subfields
  const subfieldC = measureFields.map(generateSubfieldC).filter(f => f);
  const hasSubfieldC = subfieldC.length > 0;

  const subfieldA = extentFields.map(extent => generateSubfieldA(extent, illustrations, hasSubfieldC)).filter(f => f);
  const hasSubfieldA = subfieldA.length > 0;

  const subfieldB = illustrations ? generateSubfieldB(hasSubfieldA, hasSubfieldC) : [];

  const subfields = subfieldA.concat(subfieldB, subfieldC);
  const hasSubfields = subfields.length > 0;

  return hasSubfields ? [{tag: '300', subfields}] : [];


  /**
   * Generate f300 $a for print item
   * @param {Object} extent - DescriptiveDetail.Extent entry retrieved using valueInterface.getValues
   * @param {boolean} generateIllustrationSubfield - Whether $b is generated for the field (true if product contains illustrations)
   * @param {boolean} hasSubfieldC - Whether $c is generated for the field
   * @returns {{code: string, value: string} | null}
   */
  function generateSubfieldA(extent, generateIllustrationSubfield, hasSubfieldC) {
    const extType = getFirstValueInContext(extent, 'ExtentType');
    const extValue = getFirstValueInContext(extent, 'ExtentValue');
    const extUnit = getFirstValueInContext(extent, 'ExtentUnit');

    const extTypeIsPageCount = extType === EXTENT_TYPES.MAIN_CONTENT_PAGE_COUNT;
    const extUnitIsPages = extUnit === EXTENT_UNITS.PAGES;

    if (extTypeIsPageCount && extUnitIsPages) {
      const punctuation = getEndingPunctuation(generateIllustrationSubfield, hasSubfieldC);
      return {code: 'a', value: `${extValue} sivua${punctuation}`};
    }

    return null;


    function getEndingPunctuation(hasSubfieldB, hasSubfieldC) {
      if (hasSubfieldB) {
        return ' :';
      }

      if (hasSubfieldC) {
        return ' ;';
      }

      return '';
    }
  }

  /**
   * Generate f300 $b for print item
   * @param {boolean} hasSubfieldA - whether field contains $a
   * @param {boolean} hasSubfieldC - whether field contains $c
   * @returns {{code: string, value: string}[]}
   */
  function generateSubfieldB(hasSubfieldA, hasSubfieldC) {
    if (!hasSubfieldA) {
      return [];
    }

    const value = hasSubfieldC ? 'kuvitettu ;' : 'kuvitettu';
    return [{code: 'b', value}];
  }

  /**
   * Generate f300 $c for print item
   * @param {Object} measureInfo - DescriptiveDetail.Measure entry retrieved using valueInterface.getValues
   * @returns {{code: string, value: string} | null}
   */
  function generateSubfieldC(measureInfo) {
    /*
    Onix Codelists: List 48: Measure type
    https://ns.editeur.org/onix/en/48

    01 | Height


    Onix Codelists: List 50: Measure unit
    https://ns.editeur.org/onix/en/50

    mm | Millimeters
    */
    const measurement = getFirstValueInContext(measureInfo, 'Measurement');
    const measureType = getFirstValueInContext(measureInfo, 'MeasureType');
    const measureUnitCode = getFirstValueInContext(measureInfo, 'MeasureUnitCode');

    const measureTypeIsHeight = measureType === '01';
    const measureUnitCodeIsMm = measureUnitCode === 'mm';

    if (!measureTypeIsHeight || !measureUnitCodeIsMm) {
      return null;
    }

    const measurementAsInt = parseInt(measurement, 10);
    const measurementNotNumber = isNaN(measurementAsInt);

    if (measurementNotNumber) {
      return null;
    }

    // Value conversion; mm to cm with ceiling the resulting integer
    const measurementAsCm = Math.ceil(measurementAsInt / 10).toString();
    return {code: 'c', value: `${measurementAsCm} cm`};
  }
}

/**
 * Generates 336 for record with print type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array with field(s) 336
 */
export function generate336Print(_onixConversionConfiguration, valueInterface) {
  const baseField = {
    tag: '336',
    subfields: [
      {code: 'a', value: 'teksti'},
      {code: 'b', value: 'txt'},
      {code: '2', value: 'rdacontent'}
    ]
  };

  const stillPictureField = {
    tag: '336',
    subfields: [
      {code: 'a', value: 'stillkuva'},
      {code: 'b', value: 'sti'},
      {code: '2', value: 'rdacontent'}
    ]
  };

  const comic = isComic(valueInterface);
  return comic ? [baseField, stillPictureField] : [baseField];
}

/**
 * Generates 337 for record with print type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array with field 337
 */
// eslint-disable-next-line no-unused-vars
export function generate337Print(_onixConversionConfiguration, _valueInterface) {
  return [
    {
      tag: '337',
      subfields: [
        {code: 'a', value: 'käytettävissä ilman laitetta'},
        {code: 'b', value: 'n'},
        {code: '2', value: 'rdamedia'}
      ]
    }
  ];
}

/**
 * Generates 338 for record with print type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array with field 338
 */
// eslint-disable-next-line no-unused-vars
export function generate338Print(_onixConversionConfiguration, _valueInterface) {
  return [
    {
      tag: '338',
      subfields: [
        {code: 'a', value: 'nide'},
        {code: 'b', value: 'nc'},
        {code: '2', value: 'rdacarrier'}
      ]
    }
  ];
}

/**
 * Generate Field 341 for record of print type. DEPRECATED.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array with field 341
 */
/* This function was deprecated 2026-02-11
export function generate341Print(_onixConversionConfiguration, valueInterface) {
  const simplifiedLanguageEdition = isSimplifiedLanguageEdition(valueInterface);

  if (simplifiedLanguageEdition) {
    return [
      {
        tag: '341',
        subfields: [
          {code: 'b', value: 'selkokielinen'},
          {code: '2', value: 'mts/fin'}
        ]
      }
    ];
  }

  return [];
}
*/