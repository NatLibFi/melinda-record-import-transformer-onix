import {getAllValuesInContext, getFirstValueInContext, hasAttribute} from '../../../utils/data-utils.js';
import {filterByFirstValue, getPublishingDates, isProductAbandoned} from '../../product-utils.js';

/**
 * Generates f500 for print and electronical records. Note this function is wrapper for multiple different type of f500 generators.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 500
 */
export function generate500Common(onixConversionConfiguration, valueInterface) {
  const cancellationNoteFields = generate500CancellationNote(onixConversionConfiguration, valueInterface);
  const editionNoteFields = generate500EditionNote(onixConversionConfiguration, valueInterface);
  const informationTypeNoteFields = generate500InformationTypeNote(onixConversionConfiguration, valueInterface);
  const disneyNoteFields = generate500WaltDisneyNote(onixConversionConfiguration, valueInterface);
  const marvelNoteFields = generate500MarvelNote(onixConversionConfiguration, valueInterface);
  const aiContributorNote = generate500AiContributorNote(onixConversionConfiguration, valueInterface);

  return cancellationNoteFields.concat(editionNoteFields, informationTypeNoteFields, disneyNoteFields, marvelNoteFields, aiContributorNote);
}

/**
 * Generate f500 if publication has been abandoned based on the ONIX product information.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 500
 */
function generate500CancellationNote(_onixConversionConfiguration, valueInterface) {
  if (isProductAbandoned(valueInterface)) {
    return [
      {tag: '500', subfields: [{code: 'a', value: 'Ei ilmesty.'}]},
    ];
  }

  return [];
}

/**
 * Generate f500 regarding additional editions if record has publishing year and such information exists.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 500
 */
function generate500EditionNote(_onixConversionConfiguration, valueInterface) {
  const editionNumber = valueInterface.getValue('DescriptiveDetail', 'EditionNumber');
  const [latestPublishingDate, ...additionalPublishingDates] = getPublishingDates(valueInterface);

  // getPublishingDates only deduplicate entries with same role
  // this disallows same year from appearing multiple times within the f500 regarding additional editions
  const validatedAdditionalPublishingDates = additionalPublishingDates.filter(({year}) => year !== latestPublishingDate.year);

  if (validatedAdditionalPublishingDates.length === 0) {
    return [];
  }

  // Format for the $a value is: '<year>. - <another_year>. - <edition>. painos <last_year>.'
  const lastAdditionalPublishingDate = validatedAdditionalPublishingDates.slice(-1);
  const lastAdditionalPublishingDateString = lastAdditionalPublishingDate ? lastAdditionalPublishingDate[0].year : '';

  if (!lastAdditionalPublishingDateString) {
    return [];
  }

  const otherPublishingDates = validatedAdditionalPublishingDates.slice(0, -1);

  const editionString = editionNumber ? `${editionNumber}. painos ` : '';
  const otherPublishingDatesYearString = otherPublishingDates
    .map(({year}) => `${year}. - `)
    .join('');

  const additionalEditionYearsString = `${otherPublishingDatesYearString}${editionString}${lastAdditionalPublishingDateString}.`;

  return [{tag: '500', subfields: [{code: 'a', value: `Lisäpainokset: ${additionalEditionYearsString}`}]}];
}

/**
 * Generate f500 for information type note (e.g., early notification, advanced notification, etc.)
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 500
 */
function generate500InformationTypeNote(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 1: Notification or update type
  https://ns.editeur.org/onix/en/1

  01 | Early notification | Use for a complete record issued earlier than approximately six months before publication
  02 | Advance notification (confirmed) | Use for a complete record issued to confirm advance information approximately six months before publication; or for a complete record issued after that date and before information has been confirmed from the book-in-hand
  03 | Notification confirmed on publication | Use for a complete record issued to confirm advance information at or just before actual publication date, usually from the book-in-hand, or for a complete record issued at any later date
  */

  const {
    isLegalDeposit,
    notificationName
  } = onixConversionConfiguration;

  if (isLegalDeposit) {
    return [{tag: '500', subfields: [{code: 'a', value: 'Koneellisesti tuotettu tietue.'}]}];
  }

  const notificationType = valueInterface.getValue('NotificationType');
  const isEarlyNotification = ['01', '02'].includes(notificationType);
  const isAdvancedNotification = notificationType === '03';

  if (isEarlyNotification) {
    const earlyNotificationNote = notificationName ? `Ennakkotieto / ${notificationName}.` : 'Ennakkotieto.';
    return [{tag: '500', subfields: [{code: 'a', value: earlyNotificationNote}]}];
  }

  if (isAdvancedNotification) {
    const advancedNotificationNote = notificationName ? `Tarkistettu ennakkotieto / ${notificationName}.` : 'Tarkistettu ennakkotieto.';
    return [{tag: '500', subfields: [{code: 'a', value: advancedNotificationNote}]}];
  }

  return [];
}

/**
 * Generate f500 to indicate record is part of Walt Disney productions.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 500
 */
function generate500WaltDisneyNote(_onixConversionConfiguration, valueInterface) {
  const disneyNameForms = ['disney', 'disney, walt'];

  const contributors = valueInterface.getValues('DescriptiveDetail', 'Contributor');
  const contributorNameContainsDisney = contributors.some(contributor => {
    const personNameInverted = getFirstValueInContext(contributor, 'PersonNameInverted');
    const corporateName = getFirstValueInContext(contributor, 'CorporateName');

    const processedNames = [personNameInverted, corporateName]
      .filter(v => typeof v === 'string') // Drop nulls
      .map(nameform => nameform.toLowerCase());

    return processedNames.some(processedName => disneyNameForms.includes(processedName));
  });

  if (contributorNameContainsDisney) {
    return [
      {
        tag: '500',
        subfields: [
          {code: 'a', value: 'Walt Disney -tuotantoa.'},
          {code: '9', value: 'FENNI<KEEP>'}
        ]
      }
    ];
  }

  return [];
}

/**
 * Generate f500 to indicate AI has been used in creating the content.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 500
 */
function generate500AiContributorNote(_onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 17: Contributor role code
  https://ns.editeur.org/onix/en/17

  A01 | By (author)       | Author of a textual work


  Onix Codelists: List 72: Unnamed person(s)
  https://ns.editeur.org/onix/en/72

  09 | AI (Artificial intelligence)
  */
  const contributors = valueInterface.getValues('DescriptiveDetail', 'Contributor');
  const hasAiContributor = contributors.some(contributor => {
    const roleCodes = getAllValuesInContext(contributor, 'ContributorRole');
    const hasAuthorRole = roleCodes.includes('A01');
    if (!hasAuthorRole) {
      return false;
    }

    const unnamedPersons = getAllValuesInContext(contributor, 'UnnamedPersons');
    const isAi = unnamedPersons.includes('09');
    return isAi;
  });

  if (!hasAiContributor) {
    return [];
  }

  return [
    {
      tag: '500',
      subfields: [
        {code: 'a', value: 'Sisällön luomisessa on käytetty tekoälyä.'},
        {code: '9', value: 'FENNI<KEEP>'}
      ]
    }
  ];
}

/**
 * Generate f500 to indicate record is part of Marvel productions.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 500
 */
function generate500MarvelNote(_onixConversionConfiguration, valueInterface) {
  const marvelNameForms = ['marvel'];

  const contributors = valueInterface.getValues('DescriptiveDetail', 'Contributor');
  const contributorNameContainsMarvel = contributors.some(contributor => {
    const personNameInverted = getFirstValueInContext(contributor, 'PersonNameInverted');
    const corporateName = getFirstValueInContext(contributor, 'CorporateName');

    const processedNames = [personNameInverted, corporateName]
      .filter(v => typeof v === 'string') // For toLowerCase to not ever fail
      .map(nameform => nameform.toLowerCase());

    return processedNames.some(processedName => marvelNameForms.includes(processedName));
  });

  if (contributorNameContainsMarvel) {
    return [
      {
        tag: '500',
        subfields: [
          {code: 'a', value: 'Marvel-tuotantoa.'},
          {code: '9', value: 'FENNI<KEEP>'}
        ]
      }
    ];
  }

  return [];
}

/**
 * Generates 511 field for products that contain reader information.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 511
 */
export function generate511Common(_onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 17: Contributor role code
  https://ns.editeur.org/onix/en/17

  E07 | Read by | Reader of recorded text, as in an audiobook
  */

  const readers = valueInterface.getValues('DescriptiveDetail', 'Contributor')
    .filter(contributor => filterByFirstValue(contributor, 'ContributorRole', ['E07']) && hasAttribute(contributor, 'PersonName'))
    .map(contributor => getFirstValueInContext(contributor, 'PersonName'));

  if (readers.length === 0) {
    return [];
  }

  const prefix = readers.length > 1 ? 'Lukijat' : 'Lukija';

  return [
    {
      tag: '511',
      ind1: '0',
      subfields:
        [{code: 'a', value: `${prefix}: ${readers.join(', ')}.`}]
    }
  ];
}

/**
 * Generates f594 for print and electronical records. Note this function is wrapper for multiple different type of f594 generators.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 594
 */
export function generate594Common(onixConversionConfiguration, valueInterface) {
  const cancellationNoteFields = generate594CancellationNote(onixConversionConfiguration, valueInterface);
  const informationTypeNoteFields = generate594InformationTypeNote(onixConversionConfiguration, valueInterface);

  return cancellationNoteFields.concat(informationTypeNoteFields);
}

/**
 * Generate f594 if publication has been abandoned based on the ONIX product information.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 594
 */
function generate594CancellationNote(_onixConversionConfiguration, valueInterface) {
  if (isProductAbandoned(valueInterface)) {
    return [
      {tag: '594', subfields: [{code: 'a', value: 'Ei ilmesty'}, {code: '5', value: 'FENNI'}]}
    ];
  }

  return [];
}


/**
 * Generate f594 for information type note (e.g., early notification, advanced notification, etc.)
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 594
 */
function generate594InformationTypeNote(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 1: Notification or update type
  https://ns.editeur.org/onix/en/1

  01 | Early notification | Use for a complete record issued earlier than approximately six months before publication
  02 | Advance notification (confirmed) | Use for a complete record issued to confirm advance information approximately six months before publication; or for a complete record issued after that date and before information has been confirmed from the book-in-hand
  03 | Notification confirmed on publication | Use for a complete record issued to confirm advance information at or just before actual publication date, usually from the book-in-hand, or for a complete record issued at any later date
  */

  const {
    isLegalDeposit,
    notificationName
  } = onixConversionConfiguration;

  if (isLegalDeposit) {
    return [{tag: '594', subfields: [{code: 'a', value: 'Koneellisesti tuotettu tietue'}, {code: '5', value: 'FENNI'}]}];
  }

  const notificationType = valueInterface.getValue('NotificationType');
  const isEarlyNotification = ['01', '02'].includes(notificationType);
  const isAdvancedNotification = notificationType === '03';

  if (isEarlyNotification) {
    const earlyNotificationNote = notificationName ? `Ennakkotieto / ${notificationName}` : 'Ennakkotieto';
    return [{tag: '594', subfields: [{code: 'a', value: earlyNotificationNote}, {code: '5', value: 'FENNI'}]}];
  }

  if (isAdvancedNotification) {
    const advancedNotificationNote = notificationName ? `Tarkistettu ennakkotieto / ${notificationName}` : 'Tarkistettu ennakkotieto';
    return [{tag: '594', subfields: [{code: 'a', value: advancedNotificationNote}, {code: '5', value: 'FENNI'}]}];
  }

  return [];
}