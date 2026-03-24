/* eslint-disable max-lines */
import ISBN from 'isbn3';
import LanguageDetect from 'languagedetect';

import {ELECTRONIC_TEXT_FORMATS, ONIX_PRODUCT_FORM_DETAILS, ONIX_PRODUCT_FORMS} from '../constants.js';
import {getAllValuesInContext, getFirstValueInContext, hasAttribute} from '../utils/data-utils.js';
import {getContributors, isIssnIdentifier} from './record-utils.js';

/**
 * Retrieves source of record. Prioritizes using information retrieved from SupplierName and SenderName attribute.
 * Secondarily uses data parsed from package header.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string|null} if supplier or sender was found returns string, otherwise null
 */
export function getProductDataSource(valueInterface) {
  const productSupplierName = valueInterface.getValue('ProductSupply', 'SupplyDetail', 'Supplier', 'SupplierName');
  const productSenderName = valueInterface.getValue('ProductSupply', 'SupplyDetail', 'Supplier', 'SenderName');

  const productSource = productSupplierName || productSenderName;

  if (productSource) {
    return productSource;
  }

  return null;
}

/**
 * Retrieves basic product information that may be used for debugging in case processing encounters an error
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {{title: string, standardIdentifiers: string[]}}
 */
export function createCommonErrorPayload(valueInterface) {
  const {isbn13, isbn10} = getIsbn(valueInterface);
  const {ismn13, ismn10} = getIsmn(valueInterface);

  const recordReference = valueInterface.getValue('Product', 'RecordReference');
  const standardIdentifiers = [recordReference, ...isbn13, ...isbn10, ...ismn13, ...ismn10].filter(value => value);

  const title = valueInterface.getValue('DescriptiveDetail', 'TitleDetail', 'TitleElement', 'TitleText');

  return {title, standardIdentifiers};
}

/**
 * Utility function useful for filtering values.
 * @param {Object} sourceObject Object to filter based on attribute.
 * @param {string} attributeName Attribute name to filter based on.
 * @param {string[]} acceptedValues Values that filter accepts as object chosen attribute values
 * @returns {boolean} true if object contains attribute and its first value is included in the accepted values, otherwise false
 */
export function filterByFirstValue(sourceObject, attributeName, acceptedValues) {
  if (typeof sourceObject !== 'object' || !Object.prototype.hasOwnProperty.call(sourceObject, attributeName)) {
    return false;
  }

  const firstValue = getFirstValueInContext(sourceObject, attributeName);
  return acceptedValues.includes(firstValue);
}

/**
 * Test whether product considers downloadable MP3
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product considers downloadable mp3
 */
export function isDownloadableMp3(valueInterface) {
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
  const productFormDetails = valueInterface.getValues('DescriptiveDetail', 'ProductFormDetail');

  const productFormIsOnlineAudio = ONIX_PRODUCT_FORMS.ONLINE_AUDIO.includes(productForm);
  const productFormDetailContainsMp3Code = productFormDetails.includes(ONIX_PRODUCT_FORM_DETAILS.MP3);
  return productFormIsOnlineAudio && productFormDetailContainsMp3Code;
}

/**
 * Test whether product considers EPUB
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product considers online EPUB
 */
export function isEpub(valueInterface) {
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
  const productFormDetails = valueInterface.getValues('DescriptiveDetail', 'ProductFormDetail');

  const productFormIsOnlineText = ONIX_PRODUCT_FORMS.ONLINE_TEXT.includes(productForm);
  const productFormDetailContainsEpubCode = productFormDetails.includes(ONIX_PRODUCT_FORM_DETAILS.EPUB);
  return productFormIsOnlineText && productFormDetailContainsEpubCode;
}

/**
 * Test whether product considers PDF
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product considers online PDF
 */
export function isPdf(valueInterface) {
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
  const productFormDetails = valueInterface.getValues('DescriptiveDetail', 'ProductFormDetail');

  const productFormIsOnlineText = ONIX_PRODUCT_FORMS.ONLINE_TEXT.includes(productForm);
  const productFormDetailContainsEpubCode = productFormDetails.includes(ONIX_PRODUCT_FORM_DETAILS.PDF);
  return productFormIsOnlineText && productFormDetailContainsEpubCode;
}

/**
 * Test whether product considers text item.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product considers text, otherwise false
 */
export function isText(valueInterface) {
  return isPrintText(valueInterface) || isOnlineText(valueInterface);
}

/**
 * Test whether product considers online text item.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product considers online text, otherwise false
 */
export function isOnlineText(valueInterface) {
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
  const isOnlineText = ONIX_PRODUCT_FORMS.ONLINE_TEXT.includes(productForm);

  return isOnlineText;
}

/**
 * Test whether product considers print text item.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product considers print text, otherwise false
 */
export function isPrintText(valueInterface) {
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
  const isPrint = ONIX_PRODUCT_FORMS.PRINT.includes(productForm);

  return isPrint;
}

/**
 * Get text format for online text product.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {'PDF'|'EPUB'|null} If product is not online text product return null, otherwise return string representing text format for Product.
 */
export function getOnlineTextFormat(valueInterface) {
  const onlineText = isOnlineText(valueInterface);
  if (!onlineText) {
    return null;
  }

  const epub = isEpub(valueInterface);
  if (epub) {
    return ELECTRONIC_TEXT_FORMATS.EPUB;
  }

  // By default interpret electronic texts as PDF
  return ELECTRONIC_TEXT_FORMATS.PDF;
}

/**
 * Test whether product considers audio item.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product considers audio, otherwise false
 */
export function isAudio(valueInterface) {
  const productForm = valueInterface.getValue('DescriptiveDetail', 'ProductForm');
  return ONIX_PRODUCT_FORMS.ONLINE_AUDIO.includes(productForm);
}

/**
 * Determines whether product considers comic book based on Thema classification information.
 * If product has a Subject value that is of Thema subject category starting with 'X', it is considered comic book.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if record considers comic book, otherwise false
 */
export function isComic(valueInterface) {
  /*
  Onix Code Lists:  List 27: Subject scheme identifier
  https://ns.editeur.org/onix/en/27

  93 | Thema subject category
  */

  if (!isText(valueInterface)) {
    return false;
  }

  const subjects = valueInterface.getValues('DescriptiveDetail', 'Subject');
  return subjects.some(hasThemaComicClassification);


  function hasThemaComicClassification(subject) {
    // Comic book classifications begin with 'X'
    // https://www.editeur.org/151/Thema/

    const subjectSchemeIdentifier = getFirstValueInContext(subject, 'SubjectSchemeIdentifier');
    const subjectCode = getFirstValueInContext(subject, 'SubjectCode');

    if (!subjectSchemeIdentifier || !subjectCode) {
      return false;
    }

    return subjectSchemeIdentifier === '93' && subjectCode[0] === 'X';
  }
}

export function isSimplifiedLanguageEdition(valueInterface) {
  /*
  Onix Code Lists:  List 21: Edition type code
  https://ns.editeur.org/onix/en/21

  SMP | Simplified language edition
  */

  const editionTypes = valueInterface.getValues('DescriptiveDetail', 'EditionType');
  if (editionTypes.includes('SMP')) {
    return true;
  }

  const titleDetails = valueInterface.getValues('DescriptiveDetail', 'TitleDetail');
  const titleTexts = titleDetails.map(titleDetail => getFirstValueInContext(titleDetail, 'TitleElement', 'TitleText')).filter(v => v);

  return titleTexts.some(titleText => titleText.includes('(selkokirja)'));
}

/**
 * Retrieves ISBN identifier of the product in both ISBN-10/ISBN-13 format if it can be found.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {{isbn13: string[], isbn10: string[]}} Object containing isbn13 and isbn10 attributes which contain of array of parsed ISBNs that are valid in hyphenated format
 */
export function getIsbn(valueInterface) {
  /*
  Onix Codelists: List 5: Product identifier type
  https://ns.editeur.org/onix/en/5

  02 | ISBN-10
  15 | ISBN-13
  */

  const isbn13Values = valueInterface
    .getValues('ProductIdentifier')
    .filter(identifier => filterByFirstValue(identifier, 'ProductIDType', ['15']));

  const isbn13 = isbn13Values
    .map(({IDValue: [value]}) => validateAndParseIsbn(value))
    .filter(v => v !== null);

  const isbn10Values = valueInterface
    .getValues('ProductIdentifier')
    .filter(identifier => filterByFirstValue(identifier, 'ProductIDType', ['02']));

  const isbn10 = isbn10Values
    .map(({IDValue: [value]}) => validateAndParseIsbn(value))
    .filter(v => v !== null);

  return {
    isbn13: isbn13.map(({isbn13h}) => isbn13h),
    isbn10: isbn10.map(({isbn10h}) => isbn10h)
  };
}

/**
 * Wrapper that validates and parses ISBN identifier using isbn3 library
 * @param {string|null} isbn - string containing ISBN identifier
 * @returns {{isbn10: string, isbn10h: string, isbn13: string, isbn13h: string}|null} object containing ISBN identifier in different formats if given ISBN was valid, otherwise null
 */
export function validateAndParseIsbn(isbn) {
  if (!isbn || typeof isbn !== 'string') {
    return null;
  }

  // Required in v2 of isbn3 package
  try {
    const isbnAudit = ISBN.audit(isbn);

    if (!isbnAudit.validIsbn) {
      return null;
    }

    const {isbn10, isbn10h, isbn13, isbn13h} = ISBN.parse(isbn);
    return {isbn10, isbn10h, isbn13, isbn13h};
    // eslint-disable-next-line no-unused-vars
  } catch (_error) {
    return null;
  }
}

/**
 * Retrieves ISMN identifier of the product if it can be found.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {{ismn13: string[], ismn10: string[]}} Object containing ismn13 and ismn10 attributes which contain of array of parsed ISMNs. Note checksum is not validated.
 */
export function getIsmn(valueInterface) {
  /*
  Onix Codelists: List 5: Product identifier type
  https://ns.editeur.org/onix/en/5

  05 | ISMN-10
  25 | ISMN-13
  */
  const ismn13Values = valueInterface
    .getValues('ProductIdentifier')
    .filter(identifier => filterByFirstValue(identifier, 'ProductIDType', ['25']));

  const ismn13 = ismn13Values
    .map(({IDValue: [value]}) => value)
    .filter(validateAndParseIsmn);

  const ismn10Values = valueInterface
    .getValues('ProductIdentifier')
    .filter(identifier => filterByFirstValue(identifier, 'ProductIDType', ['05']));

  const ismn10 = ismn10Values
    .map(({IDValue: [value]}) => value)
    .filter(validateAndParseIsmn);

  return {ismn13, ismn10};


  function validateAndParseIsmn(ismn) {
    if (!ismn || typeof ismn !== 'string') {
      return null;
    }

    const ismnWithoutDashes = ismn.replaceAll(/-/gu, '');
    const isIsmn13Format = (/^9790\d{9}$/u).test(ismnWithoutDashes);
    const isIsmn10Format = (/^M\d{9}$/u).test(ismnWithoutDashes);

    if (!isIsmn10Format && !isIsmn13Format) {
      return null;
    }

    // Note: check digit is currently not validated or tested. This is upcoming feature.
    return true;
  }
}

/**
 * Getter for GTIN from ProductIdentifier with ProductIDType of '03'
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string[]} Array of strings containing GTIN
 */
export function getGTIN(valueInterface) {
  /*
  Onix Codelists: List 5: Product identifier type
  https://ns.editeur.org/onix/en/5

  03 | GTIN-13
  */

  const gtinIdentifiers = valueInterface.getValues('ProductIdentifier').filter(identifier => filterByFirstValue(identifier, 'ProductIDType', ['03']));
  return gtinIdentifiers.map(({IDValue: [value]}) => value);
}

/**
 * Getter for publishing date information for the product. Values are ordered based on year ASC.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../types.js').ProductPublishingDateInfo[]} Array of information objects regarding publishing date.
 */
export function getPublishingDates(valueInterface) {
  /*
  Onix Codelists: List 163: Publishing date role
  https://ns.editeur.org/onix/en/163
  01 | Publication date | Nominal date of publication
  11 | Date of first publication | Date when the work incorporated in a product was first published.
  12 | Last reprint date | Date when a product was last reprinted
  */

  const publishingDates = valueInterface.getValues('PublishingDetail', 'PublishingDate');
  const parsedValidPublishingDates = publishingDates
    .map(parsePublishingDate)
    .filter(v => v !== null);

  const deduplicatedPublishingDates = parsedValidPublishingDates
    .reduce((p, n) => p.some(({year, role}) => n.year === year && n.role === role) ? p : [n, ...p], []) // Deduplicate entries with shared year/role combo
    .sort((a, b) => Number(a.year) - Number(b.year)); // sort

  return deduplicatedPublishingDates;

  function parsePublishingDate(publishingDateElement) {
    const validPublishingDateRoles = ['01', '11', '12'];
    const publishingDateRole = getFirstValueInContext(publishingDateElement, 'PublishingDateRole');
    const publishingDateRoleIsValid = validPublishingDateRoles.includes(publishingDateRole);

    const publishingDate = getPublishingDate(getFirstValueInContext(publishingDateElement, 'Date'));
    const publishingDateIsValid = isValidDate(publishingDate);

    // Do not accept invalid date information
    if (!publishingDateRoleIsValid || !publishingDateIsValid) {
      return null;
    }

    return {
      role: publishingDateRole,
      rawValue: publishingDate,
      year: publishingDate.substring(0, 4)
    };

    function isValidDate(v) {
      // Regexp is lazy, but makes sure that values start with sane value that has at least parseable year
      // Assumes that this software (and MARC21 format) have reached their EOL before year 3000
      return v && typeof v === 'string' && (/^[12]{1}\d{3,7}/u).test(v);
    }

    function getPublishingDate(v) {
      // If XML element contains attribute definition (such as dateformat="05"), the result of getter is object and thus _ needs to be returned
      return typeof v === 'object' && v !== null ? v._ : v;
    }
  }
}

/**
 * Get extent information of product read from DescriptiveDetail.Extent .
 * If extent is missing type, value or unit it will not be accepted into returned array of values.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {{extType: string, extValue: string, extUnit: string}[]} Array containing extent information objects
 */
export function getExtentInformation(valueInterface) {
  const extentFields = valueInterface.getValues('DescriptiveDetail', 'Extent');
  return extentFields
    .map(extentField => {
      const extType = getFirstValueInContext(extentField, 'ExtentType');
      const extValue = getFirstValueInContext(extentField, 'ExtentValue');
      const extUnit = getFirstValueInContext(extentField, 'ExtentUnit');

      return {extType, extValue, extUnit};
    })
    .filter(extentInformation => {
      const {extType, extValue, extUnit} = extentInformation;
      return extType && extValue && extUnit;
    });
}

/**
 * Detects product language from TitleDetail with TitleType of 00 or 01.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string|null} Language information (three letter format) if could detect language reliably across all titles with TitleType of 00/01, otherwise null
*/
export function detectTitleLanguage(valueInterface) {
  /*
  Onix Codelists: List 15: TitleType
  https://ns.editeur.org/onix/en/15

  00 | Undefined
  01 | Distinctive title (book)
  */

  const titleDetails = valueInterface.getValues('DescriptiveDetail', 'TitleDetail');

  const lngDetector = new LanguageDetect();
  lngDetector.setLanguageType('iso3');

  const validTitleDetails = titleDetails
    .filter(titleDetail => ['00', '01'].includes(getFirstValueInContext(titleDetail, 'TitleType')));

  const titleElements = validTitleDetails.map(titleDetail => getAllValuesInContext(titleDetail, 'TitleElement')); // [1-n]
  const titleTexts = titleElements.map(([v]) => getFirstValueInContext(v, 'TitleText')).filter(v => v);

  const detectedTitleLanguages = titleTexts
    .map(titleText => lngDetector.detect(titleText, 1).flat())
    .map(([lang]) => lang);

  if (detectedTitleLanguages.length === 0) {
    return null;
  }

  // If all observed titles resulted to same detection result return detection result
  // Otherwise return null as detection result contains a conflict and therefore should not be used
  const firstDetectedValue = detectedTitleLanguages[0];
  const uniformDetectedLanguages = detectedTitleLanguages.every(v => v === firstDetectedValue);

  return uniformDetectedLanguages ? firstDetectedValue : null;
}

/**
 * Tests whether product has illustrations based on DescriptiveDetail.AncillaryContent values. Not available for audio products.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product is not audio and has illustrations, otherwise false
 */
export function hasIllustrations(valueInterface) {
  /**
  Onix Codelists: List 25: Illustration and other content type
  https://ns.editeur.org/onix/en/25
  01 | Illustrations, black and white
  02 | Illustrations, color
   */

  const audio = isAudio(valueInterface);
  if (audio) {
    return false;
  }

  return valueInterface.getValues('DescriptiveDetail', 'AncillaryContent')
    .filter(subject => filterByFirstValue(subject, 'AncillaryContentType', ['01', '02']))
    .length > 0;
}

/**
 * Get product language information based on language detection regarding product title.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string|null} Language information (three letter format) if could detect language reliably across all titles with TitleType of 00/01, otherwise null
*/
export function getProductTitleLanguage(valueInterface) {
  /*
  Onix Codelists: List 15: Title type
  https://ns.editeur.org/onix/en/15

  00 | Undefined
  01 | Distinctive title (book); Cover title (serial); Title of content item, collection, or resource
  */

  const lngDetector = new LanguageDetect();
  lngDetector.setLanguageType('iso3');

  const titleDetails = valueInterface.getValues('DescriptiveDetail', 'TitleDetail');
  const filteredTitleDetails = titleDetails.filter(titleDetail => ['00', '01'].includes(getFirstValueInContext(titleDetail, 'TitleType')));
  if (filteredTitleDetails.length === 0) {
    return null;
  }

  const titleElements = filteredTitleDetails.map(titleDetail => getAllValuesInContext(titleDetail, 'TitleElement')); // [1-n]
  const titleTexts = titleElements.map(([v]) => getFirstValueInContext(v, 'TitleText')).filter(v => v);

  const detectedTitleLanguages = titleTexts
    .map(titleText => lngDetector.detect(titleText, 1).flat())
    .map(([lang]) => lang);

  if (detectedTitleLanguages.length === 0) {
    return null;
  }

  // If all observed titles resulted to same detection result return observed language
  // Otherwise return null as detection result should not be used since value is not unified
  return detectedTitleLanguages.reduce((prev, next) => prev === next ? prev : null, detectedTitleLanguages[0]);
}

/**
 * Evaluates whether product considers an translated item or not.
 * If product contains contributor with translator role, it is considered translation.
 * If product contains title with TitleType of 03, it is considered translation.
 * If product contains language with LanguageRole of 02, it is considered translation.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if entry is translated item, otherwise false
*/
export function isTranslation(valueInterface) {
  /*
  Onix Codelists: List 15: Title type
  https://ns.editeur.org/onix/en/15

  03 | Title in original language


  Onix Codelists: List 22: Language role code
  https://ns.editeur.org/onix/en/22

  02 | Original language of a translated text
  */

  const {contributors, mainAuthor} = getContributors(valueInterface);
  const hasTranslator = contributors.some(({isTranslator}) => isTranslator) || mainAuthor?.isTranslator;

  if (hasTranslator) {
    return true;
  }

  const titleDetails = valueInterface.getValues('DescriptiveDetail', 'TitleDetail');
  const hasTitleType03 = titleDetails.some(titleDetail => getFirstValueInContext(titleDetail, 'TitleType') === '03');
  if (hasTitleType03) {
    return true;
  }

  const languageInformation = valueInterface.getValues('DescriptiveDetail', 'Language');
  const languageRole02 = languageInformation.filter(language => filterByFirstValue(language, 'LanguageRole', ['02']));

  return languageRole02.length > 0;;
}

/**
 * Retrieves publisher name values values from entries with PublishingRole of 01.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string[]} Array containing PublisherName values
 */
export function getPublisherNames(valueInterface) {
  /*
  Onix Code Lists:  List 45: Publishing role
  https://ns.editeur.org/onix/en/45

  01 | Publisher
  */

  const publisherInformation = valueInterface.getValues('PublishingDetail', 'Publisher');
  return publisherInformation
    .filter(publisher => filterByFirstValue(publisher, 'PublishingRole', ['01']) && hasAttribute(publisher, 'PublisherName'))
    .map(publisher => getFirstValueInContext(publisher, 'PublisherName'));
}

/**
 * Retrieves and returns imprint name values.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string[]} Array containing imprint name values
 */
export function getImprintNames(valueInterface) {
  const imprintInformation = valueInterface.getValues('PublishingDetail', 'Imprint');
  return imprintInformation
    .filter(imprintInfo => hasAttribute(imprintInfo, 'ImprintName'))
    .map(imprintInfo => getFirstValueInContext(imprintInfo, 'ImprintName'));
}

/**
 * Retrieves product collection information. Regarding collection titles and part numbers, only title element that is collection level is considered.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {{type: string|null, issnIdentifiers: string[], partNumber: string|null, sequenceNumbers: string[], title: string|null}[]}
 */
export function getCollectionInformation(valueInterface) {
  return valueInterface
    .getValues('DescriptiveDetail', 'Collection')
    .map(parseCollectionInfo);

  function parseCollectionInfo(collection) {
    /*
    Onix Codelists: List 13: Collection identifier type
    https://ns.editeur.org/onix/en/13

    02 | ISSN


    Onix Codelists: List 149: Title element level
    https://ns.editeur.org/onix/en/149

    02 | Collection level | The title element refers to the top level of a bibliographic collection.
    */

    const collectionType = getFirstValueInContext(collection, 'CollectionType');
    const collectionTitleDetail = getAllValuesInContext(collection, 'TitleDetail').find(titleDetail => getFirstValueInContext(titleDetail, 'TitleElement', 'TitleElementLevel') === '02');
    const collectionIdentifiers = getAllValuesInContext(collection, 'CollectionIdentifier');

    const collectionTitle = getFirstValueInContext(collectionTitleDetail, 'TitleElement', 'TitleText') || null;
    const processedCollectionTitle = collectionTitle ? collectionTitle.replace(/(?:\d+|\s+)$/u, '').trim() : null;

    const collectionPartNumber = getFirstValueInContext(collectionTitleDetail, 'TitleElement', 'PartNumber') || null;

    const collectionIssns = collectionIdentifiers
      .map(collectionIdentifier => ({
        identifierType: getFirstValueInContext(collectionIdentifier, 'CollectionIDType'),
        identifierValue: getFirstValueInContext(collectionIdentifier, 'IDValue')
      }))
      .filter(({identifierType, identifierValue}) => identifierType === '02' && isIssnIdentifier(identifierValue))
      .map(({identifierValue}) => identifierValue);


    const collectionSequenceNumbers = getAllValuesInContext(collection, 'CollectionSequence')
      .filter(collectionSequence => hasAttribute(collectionSequence, 'CollectionSequenceNumber'))
      .map(collectionSequence => getFirstValueInContext(collectionSequence, 'CollectionSequenceNumber'));

    return {
      type: collectionType,
      title: processedCollectionTitle,
      partNumber: collectionPartNumber,
      issnIdentifiers: collectionIssns,
      sequenceNumbers: collectionSequenceNumbers,
    };
  }
}

/**
 * Checks whether publication has been abandoned based on the ONIX product information.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {boolean} true if product has been abandoned, otherwise false
 */
export function isProductAbandoned(valueInterface) {
  /*
  Onix Codelists: List 64: Publishing status
  https://ns.editeur.org/onix/en/64

  01 | The product was announced, and subsequently abandoned
  */

  const publishingDetails = valueInterface.getValues('PublishingDetail');
  const publishingStatuses = publishingDetails.map(publishingDetail => getFirstValueInContext(publishingDetail, 'PublishingStatus'));
  const hasAbandonedStatus = publishingStatuses.some(publishingStatus => publishingStatus === '01');

  return hasAbandonedStatus;
}

/**
 * Getter for YSO subject words that are defined using SubjectSchemeIdentifier of '71'.
 * @param {import('../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {string[]} array containing YSO subject words
 */
export function getYsoSubjects(valueInterface) {
  /*
  Onix Codelists: List 27: Subject scheme identifier code
  https://ns.editeur.org/onix/en/27

  71 | YSO | Yleinen suomalainen ontologia: Finnish General Upper Ontology
  */

  return valueInterface.getValues('DescriptiveDetail', 'Subject')
    .filter(subject => hasAttribute(subject, 'SubjectHeadingText') && hasAttribute(subject, 'SubjectSchemeIdentifier'))
    .filter(subject => filterByFirstValue(subject, 'SubjectSchemeIdentifier', ['71']))
    .map(subject => getFirstValueInContext(subject, 'SubjectHeadingText'));
}
