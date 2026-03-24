import {ELECTRONIC_AUDIO_FORMATS} from '../../../constants.js';
import {getFirstValueInContext, hasAttribute} from '../../../utils/data-utils.js';
import {filterByFirstValue, getIsbn, getIsmn, getOnlineTextFormat, getProductTitleLanguage, isAudio, isPrintText, isTranslation} from '../../product-utils.js';
import {getForeignLanguageTextbookLanguage, translatePrintProductForm} from '../../record-utils.js';

/**
 * Generates field 020 for record of print and electronic type from valid ISBN-13 or ISBN-10.
 * If ISBN-13 identifiers are available, ISBN-10 identifiers are not included to the result.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array with field 020
 */
export function generate020Common(_onixConversionConfiguration, valueInterface) {
  const {isbn13, isbn10} = getIsbn(valueInterface);
  let subfieldQ = getSubfieldQValue(valueInterface);

  const generatorIsbnValues = isbn13.length > 0 ? isbn13 : isbn10;

  return generatorIsbnValues.map(isbn => {
    if (subfieldQ) {
      return {tag: '020', subfields: [{code: 'a', value: isbn}, {code: 'q', value: subfieldQ}]};
    }

    return {tag: '020', subfields: [{code: 'a', value: isbn}]};
  });


  /**
   * Getter for f020 $q that is based on item type
   * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
   * @returns {string|null}
   */
  function getSubfieldQValue(valueInterface) {
    if (isAudio(valueInterface)) {
      return ELECTRONIC_AUDIO_FORMATS.MP3;
    }

    if (isPrintText(valueInterface)) {
      return translatePrintProductForm(valueInterface);
    }

    return getOnlineTextFormat(valueInterface);
  }
}

/**
 * Generates field 024 for record of print and electronic type from valid ISMN identifier.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Empty array or array with field 024
 */
export function generate024Common(_onixConversionConfiguration, valueInterface) {
  const {ismn10, ismn13} = getIsmn(valueInterface);
  let subfieldQ = getSubfieldQValue(valueInterface);

  const generatorIsmnValues = ismn13.length > 0 ? ismn13 : ismn10;

  return generatorIsmnValues.map(ismn => {
    if (subfieldQ) {
      return {tag: '024', ind1: '2', subfields: [{code: 'a', value: ismn}, {code: 'q', value: subfieldQ}]};
    }

    return {tag: '024', ind1: '2', subfields: [{code: 'a', value: ismn}]};
  });

  /**
   * Getter for f024 $q that is based on item type
   * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
   * @returns {string|null}
   */
  function getSubfieldQValue(valueInterface) {
    if (isAudio(valueInterface)) {
      return ELECTRONIC_AUDIO_FORMATS.MP3;
    }

    if (isPrintText(valueInterface)) {
      return translatePrintProductForm(valueInterface);
    }

    return getOnlineTextFormat(valueInterface);
  }
}

/**
 * Generates 040 field for print and electronical records with values appropriate for National Library of Finland.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 040
 */
// eslint-disable-next-line no-unused-vars
export function generate040Common(onixConversionConfiguration, _valueInterface) {
  const {isLegalDeposit, isilIdentifier} = onixConversionConfiguration;
  const commonSubfields = [
    {code: 'b', value: 'fin'},
    {code: 'e', value: 'rda'},
    {code: 'd', value: 'FI-NL'}
  ];

  // $a is generated only for material that is not legal deposit if isil identifier is available
  const subfields = isLegalDeposit || !isilIdentifier ? commonSubfields : [{code: 'a', value: isilIdentifier}, ...commonSubfields];

  return [
    {
      tag: '040',
      subfields
    }
  ];
}

/**
 * Generates 041 field for print and electronical records.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 041
 */

export function generate041Common(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 22: Language role code
  https://ns.editeur.org/onix/en/22

  01 | Language of text
  02 | Original language of a translated text
  */

  const {languageSanityCheck} = onixConversionConfiguration;
  const detectedTitleLanguage = getProductTitleLanguage(valueInterface);

  const languageInformation = valueInterface.getValues('DescriptiveDetail', 'Language');

  // Filter fields with LanguageRole 01 and 02 separately
  // LanguageRole01 values are filtered based on language sanity check if it's enabled
  const languageRole01Language = languageInformation
    .filter(languageInformation => filterByFirstValue(languageInformation, 'LanguageRole', ['01']) && hasAttribute(languageInformation, 'LanguageCode'))
    .map(languageInformation => getFirstValueInContext(languageInformation, 'LanguageCode'))
    .filter(language => !languageSanityCheck || languageIsSane(language, detectedTitleLanguage));

  const languageRole02Language = languageInformation
    .filter(languageInformation => filterByFirstValue(languageInformation, 'LanguageRole', ['02']) && hasAttribute(languageInformation, 'LanguageCode'))
    .map(languageInformation => getFirstValueInContext(languageInformation, 'LanguageCode'));

  const ind1 = isTranslation(valueInterface) ? '1' : '0';

  // Foreign language textbooks include target language
  const languageTextbookTargetLang = getForeignLanguageTextbookLanguage(valueInterface);

  // Subfield generation
  const mainLangSubfieldCode = isAudio(valueInterface) ? 'd' : 'a';

  const mainLanguageSubfields = languageRole01Language.map(language => ({code: mainLangSubfieldCode, value: language}));
  const targetLangSubfields = languageTextbookTargetLang ? [{code: mainLangSubfieldCode, value: languageTextbookTargetLang}] : [];
  const originalLanguageSubfields = languageRole02Language.map(language => ({code: 'h', value: language}));

  const subfields = [...targetLangSubfields, ...mainLanguageSubfields, ...originalLanguageSubfields];

  return subfields.length > 0 ? [{tag: '041', ind1, subfields}] : [];


  /**
   * Validate observed language against language detected from title.
   * If either of the values is falsy, return false as value should not be used.
   * @param {string|null|undefined} language - language code from language information with LanguageRole of 01
   * @param {string|null|undefined} detectedLanguage - language detected from title
   * @returns {boolean} true if given language matches detected language while both values are available for comparison
   */
  function languageIsSane(language, detectedLanguage) {
    if (!language || !detectedLanguage) {
      return false;
    }

    return language === detectedLanguage;
  }
}

/**
 * Generates static 042 field for print and electronical records.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 042
 */
// eslint-disable-next-line no-unused-vars
export function generate042Common(_onixConversionConfiguration, _valueInterface) {
  return [
    {
      tag: '042',
      subfields: [{code: 'a', value: 'finb'}]
    }
  ];
}

/**
 * Generates 084 for print and electronical records.
 * Field with subfield $a is generated from subjects with SubjectSchemeIdentifier of 66.
 * Field with subfield $b is generated from subjects with SubjectSchemeIdentifier of 80.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 084
  */
export function generate084Common(onixConversionConfiguration, valueInterface) {
  /*
  Onix codelist: List 27: Subject scheme identifier
  https://ns.editeur.org/onix/en/27

  66 | YKL | Finnish Public Libraries Classification System (Finnish: Yleisten kirjastojen luokitusjärjestelmä). See https://finto.fi/ykl/fi/ (in Finnish), https://finto.fi/ykl/sv/ (in Swedish), https://finto.fi/ykl/en/ (in English)
  80 | Fiktiivisen aineiston lisäluokitus | Finnish fiction genre classification. See https://finto.fi/ykl/fi/page/fiktioluokka (in Finnish), https://finto.fi/ykl/sv/page/fiktioluokka (in Swedish), https://finto.fi/ykl/en/page/fiktioluokka (in English)
  */

  const yklFields = valueInterface.getValues('DescriptiveDetail', 'Subject')
    .filter(subjectInformation => filterByFirstValue(subjectInformation, 'SubjectSchemeIdentifier', ['66']) && hasAttribute(subjectInformation, 'SubjectCode'))
    .map(subjectInformation => getFirstValueInContext(subjectInformation, 'SubjectCode'))
    .map(generateYklField);

  const fictionGenreFields = valueInterface.getValues('DescriptiveDetail', 'Subject')
    .filter(subjectInformation => filterByFirstValue(subjectInformation, 'SubjectSchemeIdentifier', ['80']) && hasAttribute(subjectInformation, 'SubjectHeadingText'))
    .map(subjectInformation => getFirstValueInContext(subjectInformation, 'SubjectHeadingText'))
    .filter(subject => subject.length > 1) // Required for value to be able to be capitalized
    .map(generateFictionGenreField);

  const fields = [...yklFields, ...fictionGenreFields];

  // For entries that legal deposit material subfield $7 needs to be removed
  // For pre-publications fields are now ok
  if (!onixConversionConfiguration.isLegalDeposit) {
    return fields;
  }

  fields.forEach(field => {
    field.subfields = field.subfields.filter(subfield => subfield.code !== '7');
  });

  return fields;


  /**
   * Generate f084 with $a subfield from YKL subject
   * @param {string} subject - YKL subject
   * @returns {import('../../../types.js').DataField} Datafield
   */
  function generateYklField(subject) {
    return {
      tag: '084',
      subfields: [
        {code: 'a', value: subject},
        {code: '2', value: 'ykl'},
        {code: '7', value: 'Ennakkotieto'}
      ]
    };
  };

  /**
   * Generate f084 with $a subfield from Finnish fiction genre classification subject
   * @param {string} subject - Finnish fiction genre classification subject
   * @returns {import('../../../types.js').DataField} Datafield
   */
  function generateFictionGenreField(subject) {
    return {
      tag: '084',
      ind1: '9',
      subfields: [
        {code: 'a', value: subject.charAt(0).toUpperCase() + subject.slice(1)}, // Capitalize value
        {code: '2', value: 'ykl'},
        {code: '7', value: 'Ennakkotieto'}
      ]
    };
  }
}
