/* eslint-disable max-lines */
import {CONTRIBUTOR_ROLES, MAIN_AUTHOR_ROLES, ONIX_PRODUCT_FORMS, RECORD_TYPES} from '../constants.js';
import {getAllValuesInContext, getFirstValueInContext} from '../utils/data-utils.js';
import {detectTitleLanguage, filterByFirstValue, isSimplifiedLanguageEdition} from './product-utils.js';

/**
 * Determine record type based on first instance of ONIX value DescriptiveDetail.ProductForm.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string|null} string representing record type constant if record type was found, otherwise null
 */
export function getRecordType(valueInterface) {
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
  if (!productForm) {
    return null;
  }

  const isPrint = ONIX_PRODUCT_FORMS.PRINT.includes(productForm);
  if (isPrint) {
    return RECORD_TYPES.PRINT;
  }

  const isElectronic = ONIX_PRODUCT_FORMS.ELECTRONIC.includes(productForm);

  if (isElectronic) {
    return RECORD_TYPES.ELECTRONIC;
  }

  return null;
}

/**
 * Function for translating ONIX ProductForm value to Finnish
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string|null} Finnish language representation of ONIX ProductForm if found from mapping, otherwise null
 */
export function translatePrintProductForm(valueInterface) {
  /*
  Onix Codelists: List 150: Product form
  https://ns.editeur.org/onix/en/150

  Translatations done for:
    BB | Hardback
    BC | Paperback / softback
    BD | Loose-leaf
    BE | Spiral bound
    BF | Pamphlet
    BH | Board book
    BI | Rag book
    BJ | Bath book
    BP | Foam book
  */
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');

  if (['BB', 'BH'].includes(productForm)) {
    return 'kovakantinen';
  }
  if (['BC', 'BI', 'BJ', 'BP'].includes(productForm)) {
    return 'pehmeäkantinen';
  }
  if (['BD'].includes(productForm)) {
    return 'irtolehtiä';
  }
  if (['BE', 'BF'].includes(productForm)) {
    return 'kierreselkä';
  }

  return null;
}

/**
 * Getter for f008 publication country information based on ONIX field PublishingDetail.CountryOfPublication.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string} Two-character string representing the country if value is found, otherwise 'xx'
 */
export function getF008PublicationCountry(valueInterface) {
  const publicationCountry = valueInterface.getValue('PublishingDetail', 'CountryOfPublication');
  return publicationCountry ? publicationCountry.slice(0, 2).toLowerCase() : 'xx';
}

/**
 * Getter for f008 target audience information based on EditionType and Subject information.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string} One character string representing target audience value for f008
 */
export function getF008TargetAudience(valueInterface) {
  const simplifiedLanguageEdition = isSimplifiedLanguageEdition(valueInterface);

  if (simplifiedLanguageEdition) {
    return 'f';
  }

  const subjects = valueInterface.getValues('DescriptiveDetail', 'Subject');

  if (targetAudienceIsJuvenile(subjects)) {
    return 'j';
  }

  const schoolTextbookTargetAudience = getSchoolTextbookTargetAudience(valueInterface);
  return schoolTextbookTargetAudience ?? '|';


  function targetAudienceIsJuvenile(subjects) {
    /*
    Onix Code Lists:  List 27: Subject scheme identifier
    https://ns.editeur.org/onix/en/27

    73 | Suomalainen kirja-alan luokitus | Finnish book trade categorisation

    Subject codes 'L' and 'N' in Finnish book trade categorization represent juvenile target audience
    */
    return subjects.some(subject => {
      const subjectSchemeIdentifier = getFirstValueInContext(subject, 'SubjectSchemeIdentifier');
      const subjectCode = getFirstValueInContext(subject, 'SubjectCode');

      return subjectSchemeIdentifier === '73' && ['L', 'N'].includes(subjectCode);
    });
  }

  function getSchoolTextbookTargetAudience(valueInterface) {
    /*
    Onix Code Lists:  List 29: Audience code type
    https://ns.editeur.org/onix/en/29

    01 | ONIX audience codes


    Onix Code Lists:  List 28: Audience type
    https://ns.editeur.org/onix/en/28

    11 | Pre-primary education
    12 | Primary education
    13 | Lower secondary education
    14 | Upper secondary education
    */
    const audienceCodeMap = {
      '11': 'a',
      '12': 'b',
      '13': 'c',
      '14': 'd'
    };

    const validAudienceInformation = valueInterface.getValues('DescriptiveDetail', 'Audience')
      .filter(audience => filterByFirstValue(audience, 'AudienceCodeType', ['01']))
      .filter(audience => filterByFirstValue(audience, 'AudienceCodeValue', Object.keys(audienceCodeMap)));

    // NB: If there are multiple audience information available something is wrong
    if (validAudienceInformation.length !== 1) {
      return null;
    }

    const firstValidAudienceInfoValue = getFirstValueInContext(validAudienceInformation[0], 'AudienceCodeValue');
    return audienceCodeMap[firstValidAudienceInfoValue];
  }
}

/**
 * Returns languages of record which are defined with LanguageRole 01.
 * Optionally language sanity check is used. This attempts to detect language from title and compare it to Product language information.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @param {boolean} languageSanityCheck Whether to sanity check language information from title
 * @returns {string[]} Array of language codes which are found with LanguageCode 01 and have length of 3, otherwise empty array
 */
export function getRecordMainLangs(valueInterface, languageSanityCheck = false) {
  /*
  Onix Codelists: List 22: Language role code
  https://ns.editeur.org/onix/en/22

  01 | Language of text
  */

  // If language sanity check is enabled
  const titleLanguage = languageSanityCheck ? detectTitleLanguage(valueInterface) : null;

  // Get all language fields
  const languageInfo = valueInterface.getValues('DescriptiveDetail', 'Language');

  // Filter fields with LanguageRole 01 and return LanguageCode found in these fields
  const languageInfoRole01 = languageInfo.filter(v => v.LanguageRole.includes('01'));
  const languageCodes = languageInfoRole01.map(({LanguageCode}) => LanguageCode[0]);
  const validLanguageCodes = languageCodes.filter(language => filterLanguage(language, languageSanityCheck, titleLanguage));

  return validLanguageCodes;


  // Filters language code values which do not match expected length or with detected title language
  // in case language sanity check is enabled
  function filterLanguage(language, languageSanityCheck, detectedLanguage) {
    const languageHasCorrectLength = language.length === 3;
    if (!languageHasCorrectLength) {
      return false;
    }

    // No sanity check needs to be applied
    if (!languageSanityCheck) {
      return true;
    }

    return language === detectedLanguage;
  }
}

/**
 * Returns target language of products which are foreign language textbooks.
 * If product contains subject with SubjectSchemeIdentifier of 77, it is considered to be foreign language textbook.
 * If product contains subject with SubjectSchemeIdentifier of 95, it's value is returned if an mapping from Thema identifier is found from mapping table.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string|null} Three character language string if product is foreign language textbook containing target language found in mapping, otherwise null
 */
export function getForeignLanguageTextbookLanguage(valueInterface) {
  /*
  Onix Codelists: List 27: Subject scheme identifier
  https://ns.editeur.org/onix/en/27

  77 | Suomalainen oppiaineluokitus
  95 | Thema language qualifier
  */

  const containsTextbookSubject = valueInterface.getValues('DescriptiveDetail', 'Subject')
    .filter(subject => filterByFirstValue(subject, 'SubjectSchemeIdentifier', ['77']))
    .length > 0;

  if (!containsTextbookSubject) {
    return null;
  }

  const observedTargetLanguages = valueInterface.getValues('DescriptiveDetail', 'Subject')
    .filter(subject => filterByFirstValue(subject, 'SubjectSchemeIdentifier', ['95']))
    .map(subject => getFirstValueInContext(subject, 'SubjectCode'))
    .map(mapTargetLanguage)
    .filter(v => v !== null);

  // There needs to be exactly one target language that has been found from mapping table
  // For the value to be valid for use
  if (observedTargetLanguages.length !== 1) {
    return null;
  }

  return observedTargetLanguages[0];


  function mapTargetLanguage(subjectCode) {
    const languageMap = {
      '2ACG': 'ger',
      '2ADS': 'spa',
      '2ACB': 'eng',
      '2ADF': 'fre',
      '2ACSW': 'swe',
      '2AGR': 'rus'
    };

    return languageMap[subjectCode] || null;
  }
}

/**
 * Getter for f008 language information.
 * Optionally language sanity check is used. This attempts to detect language from title and compare it to Product language information.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @param {boolean} languageSanityCheck Whether to sanity check language information from title
 * @returns {string} Language as three character string (e.g., "eng") or '|||'
 */
export function getF008Language(valueInterface, languageSanityCheck = false) {
  /*
  Onix Codelists: List 22: Language role code
  https://ns.editeur.org/onix/en/22

  01 | Language of text
  */
  const recordMainLanguages = getRecordMainLangs(valueInterface, languageSanityCheck);
  const recordMainLanguage = recordMainLanguages.length > 0 ? recordMainLanguages[0] : null;
  const languageTextbookTargetLang = getForeignLanguageTextbookLanguage(valueInterface);

  // For foreign language textbooks prioritize using target language over main language
  const f008Language = languageTextbookTargetLang ?? recordMainLanguage;

  return f008Language ? f008Language : '|||'; // Note: getRecordMainLangs returns only language information which has length of 3
}

/**
 * Getter for first YKL subject main class information. Class value is split from first '.' character.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string|null} two first characters of first found Subject with SubjectSchemeIdentifier of '66' if it can be found, otherwise null
 */
export function getFirstYklSubjectMainClass(valueInterface) {
  /*
  Onix Codelists: List 27: Subject scheme identifier
  https://ns.editeur.org/onix/en/27

  66 | YKL
  */
  const yklSubjects = valueInterface.getValues('DescriptiveDetail', 'Subject')
    .filter(subject => filterByFirstValue(subject, 'SubjectSchemeIdentifier', ['66']));

  if (yklSubjects.length === 0) {
    return null;
  }

  const [firstYklSubject] = yklSubjects;
  const subjectCode = getFirstValueInContext(firstYklSubject, 'SubjectCode');

  if (!subjectCode) {
    return null;
  }

  const [mainClass] = subjectCode.split('.');

  if (!mainClass || mainClass.length < 2) {
    return null;
  }

  return mainClass.substring(0, 2);
}

/**
 * Tester for whether YKL subject class considers fiction book.
 * @param {string} classNumber - YKL class number to test
 * @returns {boolean} true if subject considers a fiction book, otherwise false
 */
export function isFictionMainClass(classNumber) {
  // YKL classification for class 8: https://finto.fi/ykl/fi/page/8
  const fictionMainClasses = ['80', '81', '82', '83', '84', '85'];
  return fictionMainClasses.includes(classNumber);
}

/**
 * Getter for f008 genre information. Presumes is run only for products with type of text.
 * Searches subjects for information whether publication is fiction or not (or whether such information cannot be found).
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string} '1' if publication is fiction, '0' if it is not and '|' if unsure
 */
export function getF008BookGenre(valueInterface) {
  const firstYklMainClass = getFirstYklSubjectMainClass(valueInterface);
  if (!firstYklMainClass) {
    return '|';
  }

  if (isFictionMainClass(firstYklMainClass)) {
    return '1';
  }

  return '0';
}

/**
 * Getter for f008 genre information. Presumes is run only for products with type of audio.
 * Searches subjects for information whether publication is fiction or not (or whether such information cannot be found).
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string} 'f ' if publication is fiction, otherwise '||'
 */
export function getF008AudioGenre(valueInterface) {
  const firstYklMainClass = getFirstYklSubjectMainClass(valueInterface);
  if (!firstYklMainClass || !isFictionMainClass(firstYklMainClass)) {
    return '||';
  }

  return 'f ';
}


/**
 * Constructs string that contains describes duration given the parameters
 * @param {string|null} hours - Number of hours as string
 * @param {string|null} minutes - Number of minutes as string
 * @param {string|null} seconds - Number of seconds as string
 * @returns {string} Resulting duration string
 */
export function constructDurationString(hours, minutes, seconds) {
  let result = '';

  if (hours) {
    result += minutes || seconds ? `${hours} h ` : `${hours} h`;
  }

  if (minutes) {
    result += seconds ? `${minutes} min ` : `${minutes} min`;
  }

  if (seconds) {
    result += `${seconds} s`;
  }

  return result;
}

/**
 * Getter for record main author and contributors.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../types.js').ItemContributors} object containing item main author and contributor information
 */
export function getContributors(valueInterface) {
  /*
  Onix Codelists: List 17: Contributor role code
  https://ns.editeur.org/onix/en/17

  A01 | By (author)       | Author of a textual work
  A06 | By (composer)     | Composer of music
  A07 | By (artist)       | Visual artist when named as the primary creator of, eg, a book of reproductions of artworks
  A08 | By (photographer) | Photographer when named as the primary creator of, eg, a book of photographs
  A12 | Illustrated by | Artist when named as the creator of artwork which illustrates a text, or of the artwork of a graphic novel or comic book
  B01 | Edited by |
  B06 | Translated by |
  E07 | Read by |
  */

  const origContributorInformation = valueInterface.getValues('DescriptiveDetail', 'Contributor');
  if (!origContributorInformation || origContributorInformation.length === 0) {
    return {contributors: [], mainAuthor: null};
  }

  const contributors = origContributorInformation.map((contributorInfo, idx) => {
    const personName = getFirstValueInContext(contributorInfo, 'PersonName')?.trim() ?? null;
    const personNameInverted = getFirstValueInContext(contributorInfo, 'PersonNameInverted')?.replace(/(?:ym|et al)\.$/u, '').trim() ?? null;
    const corporateName = getFirstValueInContext(contributorInfo, 'CorporateName')?.trim() ?? null;

    const nameIndicatesEditorRole = (/\s?\(toim\.\)|Toimittanut /u).test(personNameInverted);
    const roleCodes = nameIndicatesEditorRole ? ['B01', ...getAllValuesInContext(contributorInfo, 'ContributorRole')] : getAllValuesInContext(contributorInfo, 'ContributorRole');
    const isTranslator = roleCodes.includes('B06');

    const rolesIncludeAuthor = roleCodes.includes('A01');
    const unnamedPersons = getAllValuesInContext(contributorInfo, 'UnnamedPersons');
    const unnamedAiPerson = unnamedPersons.includes('09');
    const isAiAuthor = rolesIncludeAuthor && unnamedAiPerson;

    const sequenceNumberInfo = getFirstValueInContext(contributorInfo, 'SequenceNumber');
    const sequenceNumber = !sequenceNumberInfo || isNaN(Number(sequenceNumberInfo)) ? null : Number(sequenceNumberInfo);

    return {
      idx, // Useful for removing main author from contributors in later stage
      personName, // Kept only for validating whether inversion is true or not
      personNameInverted,
      corporateName,
      roleCodes,
      isTranslator,
      sequenceNumber,
      isAiAuthor
    };
  });

  // Required for role B05 that is valid only for simplified language editions
  const isSmpEdition = isSimplifiedLanguageEdition(valueInterface);

  const deduplicatedContributors = contributors.reduce(deduplicateAuthors, []);
  const validContributors = deduplicatedContributors.filter(contributor => isContributorValid(contributor, isSmpEdition));
  const mainAuthor = getMainAuthor(validContributors);

  return {
    contributors: validContributors.filter(contributor => contributor.idx !== mainAuthor?.idx),
    mainAuthor,
  };
}

/**
 * Reducer function for deduplicating authors while combining roleCodes and sequenceNumber of matching authors.
 * @param {import('../types.js').ValidatedContributor[]} currentAuthors - current authors
 * @param {import('../types.js').ValidatedContributor} author - enumerated author to process
 * @returns {import('../types.js').ValidatedContributor[]} index of first element satis
 */
export function deduplicateAuthors(currentAuthors, author) {
  const existingAuthorIdx = findAuthorIndex(currentAuthors, author);
  if (existingAuthorIdx === -1) {
    return [...currentAuthors, author];
  }

  // Use existing author primary information to expand on
  const currentAuthor = currentAuthors[existingAuthorIdx];

  // Use lowest sequence number
  currentAuthor.sequenceNumber = getLowestSequenceNumber(currentAuthor, author);

  // Translator and AI feats carry over
  currentAuthor.isTranslator = currentAuthor.isTranslator || author.isTranslator;
  currentAuthor.isAiAuthor = currentAuthor.isAiAuthor || author.isAiAuthor;

  // Append roles that author being processed has but existing author does not
  const newRoles = author.roleCodes.filter(roleCode => !currentAuthor.roleCodes.includes(roleCode));
  currentAuthor.roleCodes = [...currentAuthor.roleCodes, ...newRoles];

  return currentAuthors;

  /**
   * Getter for index of author with equal corporateName or personNameInverted as given in second parameter.
   * @param {import('../types.js').ValidatedContributor[]} currentAuthors - current authors
   * @param {import('../types.js').ValidatedContributor} author - enumerated author to process
   * @returns {number} index of first element in list satisfying search condition, -1 if not found
   */
  function findAuthorIndex(authorsList, author) {
    const {corporateName, personNameInverted} = author;

    return authorsList.findIndex(authorListAuthor => {
      const equalCorporateName = namesAreEqual(authorListAuthor.corporateName, corporateName);
      const equalPersonNameInverted = namesAreEqual(authorListAuthor.personNameInverted, personNameInverted);

      return equalCorporateName || equalPersonNameInverted;
    });
  };

  /**
   * Function for testing author name equality. Will return false in case parameter is not string with at least length of one.
   * @param {string|null|undefined} n1 - first value to compare
   * @param {string|null|undefined} n2 - second value to compare
   * @returns {boolean} true if strings given as parameters are defined and matching, otherwise false
   */
  function namesAreEqual(n1, n2) {
    if (typeof n1 !== 'string' || typeof n2 !== 'string' || n1.length === 0 || n1.length !== n2.length) {
      return false;
    }

    return n1 === n2;
  }

  /**
   * Function for getting lowest sequence number from duplicate authors.
   * @param {import('../types.js').ValidatedContributor} a1 - first author to compare
   * @param {import('../types.js').ValidatedContributor} a2 - second author to compare
   * @returns {number|null} lowest of sequence numbers if they are both defined, otherwise number that was defined or null if both numbers were not defined
  */
  function getLowestSequenceNumber(a1, a2) {
    const a1Num = a1.sequenceNumber;
    const a2Num = a2.sequenceNumber;

    if (a1Num === null && a2Num === null) {
      return null;
    }

    if (a2Num === null) {
      return a1Num;
    }

    if (a1Num === null) {
      return a2Num;
    }

    return a2Num > a1Num ? a1Num : a2Num;
  }
}

/**
 * Evaluates main author from contributor information. Main author needs to have valid main author role and lowest sequence number.
 * In case multiple authors share these traits, the first one is declared as main author.
 * @param {import('../types.js').ValidatedContributor[]} contributors - contributors array
 * @return {import('../types.js').ValidatedContributor|null} author that is declared main author if one satisfying pre-conditions can be found, otherwise null
 */
function getMainAuthor(contributors) {
  const contributorsWithValidRole = contributors.filter(({roleCodes}) => roleCodes.some(roleCode => MAIN_AUTHOR_ROLES.includes(roleCode)));
  const numSequenceDefinitions = contributorsWithValidRole.reduce((prev, next) => next.sequenceNumber ? prev + 1 : prev, 0);

  if (contributorsWithValidRole.length === 0) {
    return null;
  }

  // Branch: sequence numbers are not used, use first author with valid role as main author
  if (numSequenceDefinitions === 0) {
    return contributorsWithValidRole[0];
  }

  // Branch: evaluate main author by finding entry with lowest sequence number
  const mainAuthor = contributorsWithValidRole.reduce((prev, next) => {
    if (prev === null) {
      return next;
    }

    if (prev.sequenceNumber === null) {
      return next;
    }

    if (next.sequenceNumber === null) {
      return prev;
    }

    return prev.sequenceNumber > next.sequenceNumber ? next : prev;
  }, null);


  return mainAuthor;
}

/**
 * Validation function for contributor.
 * @param {import('../types.js').Contributor} contributor - contributor to validate
 * @param {boolean} isSmpEdition - whether record considers simplified language edition
 * @returns {boolean} true if contributor is valid, otherwise false
 */
export function isContributorValid(contributor, isSmpEdition = false) {
  const {
    corporateName,
    personNameInverted,
    roleCodes,
    isAiAuthor
  } = contributor;

  // AI authors are currently not considered valid for author fields
  // Instead a f500 note regarding them is generated
  if (isAiAuthor) {
    return false;
  }

  // Either personNameInverted or corporateName is mandatory
  // personName is used only for inversion truthness test
  const contributorName = personNameInverted || corporateName;

  // Contributor needs to have a name
  if (!contributorName || !typeof contributorName === 'string' || contributorName.length === 0) {
    return false;
  }

  // At least one valid author or contributor role needs to be defined
  const hasValidAuthorRole = MAIN_AUTHOR_ROLES.some(role => roleCodes.includes(role));
  const hasValidContributorRole = CONTRIBUTOR_ROLES.some(role => roleCodes.includes(role));
  const hasValidSmpRole = roleCodes.includes('B05') && isSmpEdition;

  if (!hasValidAuthorRole && !hasValidContributorRole && !hasValidSmpRole) {
    return false;
  }

  // List of names disallowed as authors
  const invalidNames = [
    'kirjailijoita, useita',
    'tekijöitä, useita',
    'authors',
    'translators',
    'egmont, saga',
    'saga egmont',
    'ilmoitetaan myöhemmin',
    'disney',
    'marvel'
  ];

  // Note: comparing lowercase format intentionally
  const hasInvalidName = invalidNames.some(invalidName => contributorName.toLowerCase().includes(invalidName));
  const hasMultipleAuthors = /\sja\s/.test(contributorName.toLowerCase());

  if (hasInvalidName || hasMultipleAuthors) {
    return false;
  }

  // Finally, test whether name contains disallowed characters
  const notAllowedCharacters = /[\^;:!?]/u;
  const nameContainsNotAllowedCharacter = notAllowedCharacters.test(contributorName);
  const nameContainsValidCharactersOnly = !nameContainsNotAllowedCharacter;

  return nameContainsValidCharactersOnly;
}

/**
 * Translate contributor role code to Finnish.
 * @param {string} roleCode - contributor roleCode
 * @returns {string|null} Role term in Finnish if found from translation table, otherwise null
 */
export function translateContributorRoleCode(roleCode) {
  const translationTable = {
    'A01': 'kirjoittaja',
    'A06': 'säveltäjä',
    'A07': 'taiteilija',
    'A08': 'valokuvaaja',
    'A12': 'kuvittaja',
    'B01': 'toimittaja',
    'B05': 'selkomukauttaja', // Note: translation is only valid for entries which are SMP editions
    'B06': 'kääntäjä',
    'E07': 'lukija',
  };

  const translationFound = Object.keys(translationTable).includes(roleCode);
  if (translationFound) {
    return translationTable[roleCode];
  }

  return null;
}

/**
 * Translates language code from ISO format to Finnish. If code is not found, returns false.
 * @param {string|null|undefined} langCode - language code to translate
 * @returns {string|null} Finnish translation of language if found in translation table, otherwise false
 */
export function translateLanguageCode(langCode) {
  const translations = {
    'ara': 'Arabia',
    'chi': 'Kiina',
    'dan': 'Tanska',
    'dut': 'Hollanti',
    'eng': 'Englanti',
    'est': 'Viro',
    'fin': 'Suomi',
    'fre': 'Ranska',
    'ger': 'Saksa',
    'hun': 'Unkari',
    'ice': 'Islanti',
    'ita': 'Italia',
    'jpn': 'Japani',
    'kor': 'Korea',
    'lat': 'Latina',
    'lav': 'Latvia',
    'lit': 'Liettua',
    'mul': 'Monia kieliä',
    'nor': 'Norja',
    'per': 'Persia',
    'pol': 'Puola',
    'por': 'Portugali',
    'rus': 'Venäjä',
    'sgn': 'Viittomakielet',
    'sma': 'Saami, etelä-',
    'sme': 'Saami, pohjois-',
    'smi': 'Saamelaiskielet',
    'smj': 'Saame, luulajan-',
    'smn': 'Saame, inarin-',
    'sms': 'Saame, koltan',
    'som': 'Somali',
    'spa': 'Espanja',
    'swe': 'Ruotsi',
    'ukr': 'Ukraina'
  };

  if (!langCode) {
    return null;
  }

  return Object.keys(translations).includes(langCode) ? translations[langCode] : null;
}

/**
 * Get record title from title with TitleType of 00 or 01.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @param {boolean} [useSplitRules=true] - whether to use custom title splitting rules or not (default is true)
 * @returns {{title: string|null, subtitle: string|null}} object containing title information
 * @throws Error if title is observed to be a serial title
*/
export function getTitle(valueInterface, useSplitRules = true) {
  /*
  Onix Codelists: List 15: Title type code
  https://ns.editeur.org/onix/en/21

  00 | Undefined
  01 | Distinctive title (book); Cover title (serial); Title on item (serial content item or reviewed resource)
  */

  const validTitleTypes = ['00', '01'];

  const titleDetails = valueInterface.getValues('DescriptiveDetail', 'TitleDetail');
  const validTitleDetails = titleDetails.filter(titleDetail => validTitleTypes.includes(getFirstValueInContext(titleDetail, 'TitleType')));

  if (validTitleDetails.length === 0) {
    return {title: null, subtitle: null};
  }

  // If title of TitleType 01 exists, prioritize using it. If not found, use first title with valid title type.
  const titleDetail = validTitleDetails.find(titleDetail => getFirstValueInContext(titleDetail, 'TitleType') === '01') || validTitleDetails[0];

  const titleElements = getAllValuesInContext(titleDetail, 'TitleElement'); // [1-n]
  const titleText = titleElements.map(v => getFirstValueInContext(v, 'TitleText')).find(v => v !== null) ?? null; // [0-1]
  const subtitleText = titleElements.map(v => getFirstValueInContext(v, 'Subtitle')).find(v => v !== null) ?? null; // [0-1]

  if (!titleText) {
    return {title: null, subtitle: null};
  }

  const nonMonographTitle = isSerialTitle(titleText);
  if (nonMonographTitle) {
    throw new Error(`Title ${titleText} was observed to be a serial title. Refusing to process further.`);
  }

  if (!useSplitRules || subtitleText) {
    return {title: titleText.trim(), subtitle: subtitleText ? subtitleText.trim() : null};
  }

  // Check whether title contains characters where a split between title and subtitle could be observed
  const titleSplitRegex = findTitleSplitRegex(titleText);
  const {alternativeTitle, alternativeSubtitle} = splitTitle(titleText, titleSplitRegex);

  if (!alternativeTitle) {
    return {title: titleText.trim(), subtitle: null};
  }

  return {
    title: alternativeTitle,
    subtitle: alternativeSubtitle,
  };
}

/**
 * Getter function for finding correct regexp that may be used to split given title to title and subtitle.
 * @param {string} titleText - title text as string
 * @returns {{keepCharactersFromStart: number, keepCharactersFromEnd: number, keepResult: boolean, regex: RegExp}|null} object containing information for splitting the title if found, otherwise null
 */
export function findTitleSplitRegex(titleText) {
  // Note: order defines priority
  const regularExpressions = [
    // split title to mainTitle and subtitle at first ':', do not keep ':'
    {keepCharactersFromStart: 0, keepCharactersFromEnd: 0, keepResult: false, regex: /:\s+/u},
    // split title to mainTitle and subtitle at first ' - ', do not keep the separator
    {keepCharactersFromStart: 1, keepCharactersFromEnd: 1, keepResult: false, regex: /[^0-9]\s+[\u2013\u2014-]\s+[^0-9]/u},
    // split title to mainTitle and subtitle at '! ' or '? ', keep question and exclamation marks, they are part of the title
    {keepCharactersFromStart: 0, keepCharactersFromEnd: 0, keepResult: true, regex: /!+|\?+/u}
  ];

  return regularExpressions.find(({regex}) => regex.test(titleText)) ?? null;
}

/**
 * Split title using defined splitter
 * @param {string} titleText - title as string
 * @param {{keepCharactersFromStart: number, keepCharactersFromEnd: number, keepResult: boolean, regex: RegExp}|null} titleSplitRegex - return value of findTitleSplitRegex
 * @returns {{alternativeTitle: string|null, alternativeSubtitle: string|null}}
 */
export function splitTitle(titleText, titleSplitRegex) {
  if (!titleSplitRegex) {
    return {alternativeTitle: null, alternativeSubtitle: null};
  }

  // Split title based on the found regex and process based on result
  const titleSplitResult = titleSplitRegex.regex.exec(titleText);

  let alternativeTitle = titleText.slice(0, titleSplitResult.index + titleSplitRegex.keepCharactersFromStart).trim();
  const alternativeSubtitle = titleText.slice(titleSplitResult.index + titleSplitResult[0].length - titleSplitRegex.keepCharactersFromEnd).trim();

  if (titleSplitRegex.keepResult) {
    alternativeTitle += titleSplitResult[0].trim();
  }

  return {alternativeTitle, alternativeSubtitle};
}

/**
 * Inspects whether title seems to be a serial title or not
 * @param {string} title - title to inspect
 * @returns {boolean} true if title seems to be serial title, otherwise false
 */
export function isSerialTitle(title) {
  const serialTitleRegex = [
    new RegExp(/\s(\d{1,2}_)?\d{1,2}(\s|-|\/)\d{4}$/u),
    new RegExp(/\s\d{4}(\s|-)\d{1,2}(_\d{1,2})?[^\d]*$/u),
  ];

  return serialTitleRegex.some(regex => regex.test(title));
}

/**
 * Tests whether given identifier is in format of ISSN identifier.
 * Note that this test does not consider ISSN identifier validity.
 * @param {string} identifier - identifier to inspect
 * @returns {boolean} true if given identifier seems ISSN based on the string format, otherwise false
 */
export function isIssnIdentifier(identifier) {
  const issnRegex = /^[0-9]{4}-[0-9]{3}[0-9Xx]$/;
  return typeof identifier === 'string' && issnRegex.test(identifier);
}

/**
 * Transforms YSO term to SLM term by using hardcoded hashmap.
 * @param {string} subjectWord - subject word to transform to SLM
 * @returns {{value: string, urn: string}|null} object containing SLM value and urn if subject was found from translation mappings, otherwise null
 */
export function ysoToSlm(subjectWord) {
  const ysoToSlmMap = {
    'kertomakirjallisuus': {value: 'kertomakirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s352'},
    'lastenkirjallisuus': {value: 'lastenkirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s1181'},
    'nuortenkirjallisuus': {value: 'nuortenkirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s168'},
    'sadut': {value: 'sadut', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s1165'},
    'päiväkirjaromaanit': {value: 'päiväkirjaromaanit', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s566'},
    'kauhukirjallisuus': {value: 'kauhukirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s690'},
    'jännityskirjallisuus': {value: 'jännityskirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s382'},
    'seikkailukirjallisuus': {value: 'seikkailukirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s905'},
    'elämäntaito-oppaat': {value: 'elämäntaito-oppaat', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s222'},
    'muistelmat': {value: 'muistelmat', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s286'},
    'elämäkerrat': {value: 'elämäkerrat', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s1006'},
    'keittokirjat': {value: 'keittokirjat', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s392'},
    'rikoskirjallisuus': {value: 'rikoskirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s911'},
    'fantasiakirjallisuus': {value: 'fantasiakirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s1140'},
    'tieteiskirjallisuus': {value: 'tieteiskirjallisuus', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s418'},
    'runot': {value: 'runot', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s1150'},
    'harjoituskirjat': {value: 'harjoituskirjat', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s943'},
    'käännöskirjallisuus': {value: 'käännökset', urn: 'http://urn.fi/URN:NBN:fi:au:slm:s1044'}
  };

  return Object.keys(ysoToSlmMap).includes(subjectWord) ? ysoToSlmMap[subjectWord] : null;
}
