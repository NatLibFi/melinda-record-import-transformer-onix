import {getFirstValueInContext, hasAttribute} from '../../../utils/data-utils.js';
import {isSimplifiedLanguageEdition} from '../../product-utils.js';
import {getContributors, getRecordMainLangs, translateContributorRoleCode, translateLanguageCode} from '../../record-utils.js';

/**
 * Generates 100 field for print and electronical records from contributor with ContributorRole A01
 * and SequenceNumber of 1 that is selected to be main author by getAuthorInformation function.
 * Requires contributor declared as main author to have PersonNameInverted attribute.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 100
 */
export function generate100Common(_onixConversionConfiguration, valueInterface) {
  const {mainAuthor} = getContributors(valueInterface);

  if (!mainAuthor || !mainAuthor.personNameInverted) {
    return [];
  }
  const {personName, personNameInverted, roleCodes} = mainAuthor;
  const inversionIsTrue = personNameInverted.includes(',') && personName !== personNameInverted;

  const ind1 = inversionIsTrue ? '1' : '0';

  const roles = roleCodes.map(translateContributorRoleCode).filter(v => v !== null);
  const roleSubfields = roles.map((role, idx) => {
    const isLastEntry = idx === roles.length - 1;
    const punctuation = isLastEntry ? '.' : ',';

    return {code: 'e', value: `${role}${punctuation}`};
  });

  const subfieldAPunctuation = roleSubfields.length > 0 ? ',' : '.';

  return [{
    tag: '100',
    ind1,
    subfields: [
      {code: 'a', value: `${personNameInverted}${subfieldAPunctuation}`},
      ...roleSubfields
    ]
  }];
}

/**
 * Generates 110 field for print and electronical records from contributor with ContributorRole A01
 * and SequenceNumber of 1 that is selected to be main author by getAuthorInformation function.
 * Requires contributor declared as main author to have CorporateName attribute but no PersonNameInverted attribute.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 110
 */
export function generate110Common(_onixConversionConfiguration, valueInterface) {
  const {mainAuthor} = getContributors(valueInterface);

  // In case main author has personNameInverted defined, do not create f110 as f100 will be created
  if (!mainAuthor || !mainAuthor.corporateName || mainAuthor.personNameInverted) {
    return [];
  }
  const {corporateName, roleCodes} = mainAuthor;

  const roles = roleCodes.map(translateContributorRoleCode).filter(v => v !== null);
  const roleSubfields = roles.map((role, idx) => {
    const isLastEntry = idx === roles.length - 1;
    const punctuation = isLastEntry ? '.' : ',';

    return {code: 'e', value: `${role}${punctuation}`};
  });

  const subfieldAPunctuation = roleSubfields.length > 0 ? ',' : '.';

  return [{
    tag: '110',
    ind1: '2', // CorporateName is expected to never have inverted order
    subfields: [
      {code: 'a', value: `${corporateName}${subfieldAPunctuation}`},
      ...roleSubfields
    ]
  }];
}

/**
 * Generates 130 field for print and electronical records if Title with TitleType value of 03 is found.
 * Field is not generated for simplified language editions or if main author is defined.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 130
 */
export function generate130Common(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 15: TitleType
  https://ns.editeur.org/onix/en/15

  03 | Title in original language
  */

  const {preventUniformTitleGeneration, languageSanityCheck} = onixConversionConfiguration;
  const {mainAuthor} = getContributors(valueInterface);

  if (preventUniformTitleGeneration || mainAuthor !== null) {
    return [];
  }

  const unifiedTitles = valueInterface.getValues('DescriptiveDetail', 'TitleDetail').filter(title => {
    const requiredProperties = ['TitleType', 'TitleElement'];
    const hasRequiredProperties = requiredProperties.every(property => hasAttribute(title, property));

    if (!hasRequiredProperties) {
      return false;
    }

    const hasRequiredTitleType = getFirstValueInContext(title, 'TitleType') === '03';

    if (!hasRequiredTitleType) {
      return false;
    }

    const titleText = getFirstValueInContext(title, 'TitleElement', 'TitleText');
    return typeof titleText === 'string' && titleText.length > 0;
  });

  if (unifiedTitles.length === 0) {
    return [];
  }

  const [unifiedTitle] = unifiedTitles;
  const unifiedTitleText = getFirstValueInContext(unifiedTitle, 'TitleElement', 'TitleText');

  // Generate language subfield only if exactly one language is observed
  const languages = getRecordMainLangs(valueInterface, languageSanityCheck);
  const translatedLanguage = languages.length === 1 ? translateLanguageCode(languages[0]) : null;
  const languageSubfield = translatedLanguage ? [{code: 'l', value: `${translatedLanguage}.`}] : [];

  // For SMP editions, an additional $s is created
  const subfieldS = isSimplifiedLanguageEdition(valueInterface) ? [{code: 's', value: '(selkokieli)'}] : [];

  // Note: ind1 is set by validator

  return [
    {
      tag: '130',
      subfields: [
        {code: 'a', value: `${unifiedTitleText}.`},
        ...languageSubfield,
        ...subfieldS
      ]
    }
  ];
}

