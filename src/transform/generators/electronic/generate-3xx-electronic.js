/* eslint-disable max-lines */
import {EXTENT_TYPES, EXTENT_TYPES_PAGE_COUNT, EXTENT_UNITS} from '../../../constants.js';
import {getFirstValueInContext, hasAttribute} from '../../../utils/data-utils.js';
import {getExtentInformation, getOnlineTextFormat, getPublisherNames, hasIllustrations, isAudio, isComic, isDownloadableMp3, isOnlineText, isText} from '../../product-utils.js';
import {constructDurationString} from '../../record-utils.js';

/**
 * Generate Field 300 for record of electronic type containing information about extent for audio-based products.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array with field 300
 */
export function generate300Electronic(_onixConversionConfiguration, valueInterface) {
  const audio = isAudio(valueInterface);
  const illustrations = !audio && hasIllustrations(valueInterface);
  const extentInformation = getExtentInformation(valueInterface);

  const illustrationSubfields = illustrations ? [{code: 'b', value: 'kuvitettu'}] : [];

  // Constructs array containing subfield $a definitions. E.g., [{code: 'a', value: '...'}]
  const subfieldsA = extentInformation.reduce((prev, next) => {
    const {extType, extUnit, extValue} = next;

    const usesPageUnit = extUnit === EXTENT_UNITS.PAGES;
    const usesPageType = EXTENT_TYPES_PAGE_COUNT.includes(extType);
    const definePageCount = !audio && usesPageUnit && usesPageType;

    if (definePageCount) {
      const pagecountSubfieldValue = illustrations ? `1 verkkoaineisto (${extValue} sivua) :` : `1 verkkoaineisto (${extValue} sivua)`;
      const pageCountSubfield = {code: 'a', value: pagecountSubfieldValue};
      return prev.concat(pageCountSubfield);
    }

    // Rest of the logic considers only audio products that contain duration information
    const extendIsDuration = extType === EXTENT_TYPES.DURATION;
    const supportedUnits = [EXTENT_UNITS.HOURS_MINUTES, EXTENT_UNITS.HOURS_MINUTES_SECONDS];
    const unitIsSupported = supportedUnits.includes(extUnit);

    const defineAudioExtend = !illustrations && audio && extendIsDuration && unitIsSupported;

    if (!defineAudioExtend) {
      return prev;
    }

    const secondsDefined = extUnit === EXTENT_UNITS.HOURS_MINUTES_SECONDS;
    const satisfiedMinlength = secondsDefined ? extValue.length > 6 : extValue.length > 4;

    // Gracefully manage values that do not represent what they state they represent
    if (!satisfiedMinlength) {
      return prev;
    }

    const hours = extValue.slice(0, 3).replace(/^0{0,2}/gu, '');
    const minutes = extValue.slice(3, 5).replace(/^0{0,2}/gu, '');
    const seconds = secondsDefined ? extValue.slice(5, 7).replace(/^0{0,2}/gu, '') : '';
    const durationString = constructDurationString(hours, minutes, seconds);

    const durationSubfield = {code: 'a', value: `1 verkkoaineisto (${durationString})`};
    return prev.concat(durationSubfield);
  }, []);

  // If no subfield A could be constructed, return a field with a generic subfield with illustarion subfield if available
  if (subfieldsA.length === 0) {
    const genericSubfieldAValue = illustrations ? '1 verkkoaineisto :' : '1 verkkoaineisto';
    const genericSubfieldA = {code: 'a', value: genericSubfieldAValue};

    return [
      {
        tag: '300',
        subfields: [genericSubfieldA].concat(illustrationSubfields)
      }
    ];
  }

  // Each subfield A will generate its own field per specification
  return subfieldsA.map(subfieldA => ({
    tag: '300',
    subfields: [subfieldA].concat(illustrationSubfields)
  }));
}

/**
 * Generate Field 306 for electronic records that are of audio format.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array with field 306
 */
export function generate306Electronic(_onixConversionConfiguration, valueInterface) {
  const audio = isAudio(valueInterface);

  if (!audio) {
    return [];
  }

  const extentInformation = getExtentInformation(valueInterface);

  const subfieldAValues = extentInformation.map(({extType, extUnit, extValue}) => {
    const extendIsDuration = extType === EXTENT_TYPES.DURATION;
    const supportedUnits = [EXTENT_UNITS.HOURS_MINUTES, EXTENT_UNITS.HOURS_MINUTES_SECONDS];
    const unitIsSupported = supportedUnits.includes(extUnit);

    if (!extendIsDuration || !unitIsSupported) {
      return undefined;
    }

    const secondsDefined = extUnit === EXTENT_UNITS.HOURS_MINUTES_SECONDS;
    const hours = extValue.slice(1, 3);
    const minutes = extValue.slice(3, 5);
    const seconds = secondsDefined ? extValue.slice(5, 7) : '00';

    // MARC f306 $a disallows three digit hours value.
    // In this case where field value cannot be represented in valid MARC21, do not generate field
    const hourHundreds = extValue.slice(0, 1);
    if (hourHundreds !== '0') {
      return undefined;
    }

    return `${hours}${minutes}${seconds}`;
  });

  return subfieldAValues
    .filter(v => v !== undefined)
    .map(v => ({
      tag: '306',
      subfields: [{code: 'a', value: v}]
    }));
}

/**
 * Generate Field 336 for record of electronic type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array with field 336
 */
export function generate336Electronic(_onixConversionConfiguration, valueInterface) {
  const audio = isAudio(valueInterface);
  const text = isText(valueInterface);
  const comic = isComic(valueInterface);

  // Available fields
  const audioField = {
    tag: '336',
    subfields: [
      {code: 'a', value: 'puhe'},
      {code: 'b', value: 'spw'},
      {code: '2', value: 'rdacontent'}
    ]
  };

  const textField = {
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

  // Construction logic
  if (audio && text) {
    throw new Error('Cannot generate f336 if isAudio and isText are both true');
  }

  if (!audio && !text) {
    return [];
  }

  if (audio) {
    return [audioField];
  }

  return comic ? [textField, stillPictureField] : [textField];
}

/**
 * Generate Field 337 for record of electronic type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 337
 */
// eslint-disable-next-line no-unused-vars
export function generate337Electronic(_onixConversionConfiguration, _valueInterface) {
  return [
    {
      tag: '337',
      subfields: [
        {code: 'a', value: 'tietokonekäyttöinen'},
        {code: 'b', value: 'c'},
        {code: '2', value: 'rdamedia'}
      ]
    }
  ];
}

/**
 * Generate Field 338 for record of electronic type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 338
 */
// eslint-disable-next-line no-unused-vars
export function generate338Electronic(_onixConversionConfiguration, _valueInterface) {
  return [
    {
      tag: '338',
      subfields: [
        {code: 'a', value: 'verkkoaineisto'},
        {code: 'b', value: 'cr'},
        {code: '2', value: 'rdacarrier'}
      ]
    }
  ];
}

/**
 * Generate Field 341 for record of electronic type
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array containing field(s) 341
 */
// eslint-disable-next-line max-lines-per-function
export function generate341Electronic(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 79: Product form feature type
  https://ns.editeur.org/onix/en/79

  09 | E-publication accessibility detail
  */

  // Do not allow ProductFormFeatureValues generated fields for blacklisted publishers
  // Gracefully manage situations where config is not provided as it was not required by generator previously
  const accessibilityBlacklist = onixConversionConfiguration?.accessibilityBlacklist || [];
  const publisherNames = getPublisherNames(valueInterface);
  const publisherIsBlacklisted = accessibilityBlacklist.some(accessibilityBlacklistEntry => publisherNames.includes(accessibilityBlacklistEntry));

  // Form feature fields are produced only for selected notification type
  const notificationType = valueInterface.getValue('NotificationType');
  const notificationTypeAllowsFeatures = notificationType === '03';

  const produceFeatureFields = !publisherIsBlacklisted && notificationTypeAllowsFeatures;

  // Get ProductFormFeatureValues from product
  const productFormFeatureValues = valueInterface
    .getValues('DescriptiveDetail', 'ProductFormFeature')
    .filter(v => getFirstValueInContext(v, 'ProductFormFeatureType') === '09' && hasAttribute(v, 'ProductFormFeatureValue'))
    .map(v => getFirstValueInContext(v, 'ProductFormFeatureValue'));

  // Construct all fields using product information
  const audioField = isAudio(valueInterface) ? getAudioField() : [];
  const productFormFeatureFields = produceFeatureFields ? productFormFeatureValues.map(mapFormFeatureToField).filter(v => v !== null) : [];
  const onlineTextField = isOnlineText(valueInterface) && productFormFeatureFields.length === 0 ? getOnlineTextField() : [];

  // Deduplicate fields: if fields share ind1, ind2 and subfield $a, subfields $b-$e may be added to same field
  const rawFields = audioField.concat(onlineTextField, productFormFeatureFields);

  const deduplicatedFields = rawFields.reduce((prev, next) => {
    // Find field where $b may be combined to
    const matchingField = prev.find(field => {
      const matchingIndicators = field.ind1 === next.ind1 && field.ind2 === next.ind2;
      if (!matchingIndicators) {
        return false;
      }

      const subfieldA1 = field.subfields.find(sf => sf.code === 'a');
      const subfieldA2 = next.subfields.find(sf => sf.code === 'a');

      if (!subfieldA1 || !subfieldA2) {
        return false;
      }

      return subfieldA1.value === subfieldA2.value;
    });

    if (matchingField) {
      // Currently support only $b
      const acceptedSubfieldCodes = 'b'.split('');

      // Disallow duplicate $b
      const nextAcceptedSubfields = next.subfields.filter(sf => {
        const isAccepted = acceptedSubfieldCodes.includes(sf.code);
        const alreadyDefined = matchingField.subfields.some(subfield => subfield.code === sf.code && subfield.value === sf.value);
        return isAccepted && !alreadyDefined;
      });

      matchingField.subfields = matchingField.subfields.concat(nextAcceptedSubfields);

      // Supports $a, $b, and $2 currently
      matchingField.subfields.sort((a, b) => {
        if (a.code === 'a' || b.code === 'a') {
          return a.code === 'a' ? -1 : 1;
        }

        if (a.code === 'b' || b.code === 'b') {
          return a.code === 'b' ? -1 : 1;
        }

        if (a.code === '2') {
          return 1;
        }

        if (b.code === '2') {
          return -1;
        }

        return 0;
      });

      return prev;
    }

    return prev.concat(next);
  }, []);

  return deduplicatedFields;


  function getAudioField() {
    return [{
      tag: '341',
      subfields: [
        {code: 'a', value: 'auditory'},
        {code: '2', value: 'sapdv'}
      ]
    }];
  }

  function getOnlineTextField() {
    return [{
      tag: '341',
      subfields: [
        {code: 'a', value: 'textual'},
        {code: '2', value: 'sapdv'}
      ]
    }];
  }

  // eslint-disable-next-line max-lines-per-function
  function mapFormFeatureToField(productFormFeatureValue) {
    /*
    Onix Codelists: List 196: E-publication Accessibility Details
    https://ns.editeur.org/onix/en/196

    05 | PDF/UA-1
    11 | Table of contents navigation
    12 | Index navigation
    13 | Single logical reading order
    14 | Short alternative textual descriptions
    15 | Full alternative textual descriptions
    16 | Visualized data also available as non-graphical data
    17 | Accessible math content as MathML
    18 | Accessible chemistry content as ChemML
    22 | Language tagging provided
    26 | Use of high contrast between text and background color
    27 | Use of hihg contrast between foreground and background audio
    29 | Next / Previous structural navigation
    36 | Appearance of all textual content can be modified
   */

    const acceptedFeatureValues = ['05', '11', '12', '13', '14', '15', '16', '17', '18', '22', '26', '27', '29', '36'];
    const isAcceptedFeatureValue = acceptedFeatureValues.includes(productFormFeatureValue);

    if (!isAcceptedFeatureValue) {
      return null;
    }

    // This is the base case that is edited as needed
    const field = {tag: '341', ind1: '0', subfields: []};

    if (productFormFeatureValue === '05') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'taggedPDF'},
      ]);
    }

    if (productFormFeatureValue === '11') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'tableofContents'},
      ]);
    }

    if (productFormFeatureValue === '12') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'index'},
      ]);
    }

    if (productFormFeatureValue === '13') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'readingOrder'},
      ]);
    }

    if (productFormFeatureValue === '14') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'visual'},
        {code: 'b', value: 'alternativeText'},
      ]);
    }

    if (['15', '16'].includes(productFormFeatureValue)) {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'visual'},
        {code: 'b', value: 'longDescription'},
      ]);
    }

    if (productFormFeatureValue === '17') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'visual'},
        {code: 'b', value: 'MathML'},
      ]);
    }

    if (productFormFeatureValue === '18') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'visual'},
        {code: 'b', value: 'ChemML'},
      ]);
    }

    if (productFormFeatureValue === '22') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'ttsMarkup'},
      ]);
    }


    if (productFormFeatureValue === '26') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'highContrastDisplay'},
      ]);
    }

    if (productFormFeatureValue === '27') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'auditory'},
        {code: 'b', value: 'highContrastAudio'},
      ]);
    }

    if (productFormFeatureValue === '29') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'structuralNavigation'},
      ]);
    }

    if (productFormFeatureValue === '36') {
      field.subfields = field.subfields.concat([
        {code: 'a', value: 'textual'},
        {code: 'b', value: 'displayTransformability'},
      ]);
    }

    // Sanity check - do not construct field if there are no subfields at this point
    const noSubfields = field.subfields.length === 0;
    if (noSubfields) {
      return null;
    }

    // $2 should always be last
    field.subfields = field.subfields.concat([{code: '2', value: 'sapdv'}]);

    return field;
  }
}

/**
 * Generates 344 field for electronic audio products.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array containing field(s) 344
 */
export function generate344Electronic(_onixConversionConfiguration, valueInterface) {
  const audio = isAudio(valueInterface);

  if (audio) {
    return [{
      tag: '344',
      subfields: [{code: 'a', value: 'digitaalinen'}]
    }];
  }

  return [];
}

/**
 * Generate Field 347 for record of electronic type
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array containing field(s) 347
 */
export function generate347Electronic(_onixConversionConfiguration, valueInterface) {
  const mp3 = isDownloadableMp3(valueInterface);
  const onlineTextFormat = getOnlineTextFormat(valueInterface);

  if (mp3) {
    return [
      {
        tag: '347', subfields: [
          {code: 'a', value: 'äänitiedosto'},
          {code: 'b', value: 'MP3'}
        ]
      }
    ];
  }

  if (onlineTextFormat) {
    return [
      {
        tag: '347',
        subfields: [
          {code: 'a', value: 'tekstitiedosto'},
          {code: 'b', value: onlineTextFormat}
        ]
      }
    ];
  }

  return [];
}

