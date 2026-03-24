import {getFirstValueInContext, hasAttribute} from '../../../utils/data-utils.js';
import {filterByFirstValue, getYsoSubjects, isComic, isDownloadableMp3, isSimplifiedLanguageEdition} from '../../product-utils.js';
import {ysoToSlm} from '../../record-utils.js';

/**
 * Generates 600 field for print and electronical records from NameAsSubject information.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 600
 */
export function generate600Common(_onixConversionConfiguration, valueInterface) {
  const namesAsSubjects = valueInterface
    .getValues('DescriptiveDetail', 'NameAsSubject')
    .filter(nameAsSubject => hasAttribute(nameAsSubject, 'PersonNameInverted'))
    .map(nameAsSubject => getFirstValueInContext(nameAsSubject, 'PersonNameInverted'));

  if (namesAsSubjects.length === 0) {
    return [];
  }

  return namesAsSubjects.map(nameAsSubject => ({
    tag: '600',
    ind1: '1',
    ind2: '4',
    subfields: [
      {code: 'a', value: nameAsSubject}
    ]
  }));
}

/**
 * Generates 650 fields for print and electronical records that are not legal deposit records from YSO subjects that
 * are not mapped into SLM in f655 generator.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 650
 */
export function generate650Common(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 27: Subject scheme identifier code
  https://ns.editeur.org/onix/en/27

  71 | YSO | Yleinen suomalainen ontologia: Finnish General Upper Ontology
  */

  if (onixConversionConfiguration.isLegalDeposit) {
    return [];
  }

  const ysoSubjects = getYsoSubjects(valueInterface);

  // Note: subject words that are mapped to SLM terms in 655 are filtered here
  return ysoSubjects
    .filter(subject => ysoToSlm(subject) === null)
    .map(subject => ({
      tag: '650',
      ind2: '7',
      subfields: [
        {code: 'a', value: subject},
        {code: '2', value: 'yso/fin'},
        {code: '7', value: 'Ennakkotieto'}
      ]
    }));
}

/**
 * Generates 653 field for print and electronical records for non-legal deposit records from
 * subjects that have SubjectSchemeIdentifier of either 20, 64 or 72. Generates maximum of ten datafields.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 653
 */
export function generate653Common(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 27: Subject scheme identifier code
  https://ns.editeur.org/onix/en/27

  20 | Keywords | For indexing and search purposes, not normally intended for display.
  64 | YSA | Finnish General Thesaurus (Finnish: Yleinen suomalainen asiasanasto).
  72 | PTO | Finnish Geospatial Domain Ontology (Finnish: Paikkatieto ontologia).
  */
  const acceptedSubjectSchemeIdentifiers = ['20', '64', '72'];
  if (onixConversionConfiguration.isLegalDeposit) {
    return [];
  }

  const subjects = valueInterface.getValues('DescriptiveDetail', 'Subject')
    .filter(subject => hasAttribute(subject, 'SubjectHeadingText') && hasAttribute(subject, 'SubjectSchemeIdentifier'))
    .filter(subject => filterByFirstValue(subject, 'SubjectSchemeIdentifier', acceptedSubjectSchemeIdentifiers))
    .map(subject => {
      // Some subjects may actually contain multiple subjects delimited by ';'
      // Split these to array and flatten afterwards
      const subjectTexts = getFirstValueInContext(subject, 'SubjectHeadingText');
      const res = subjectTexts.split(';')
        .map(subjectText => subjectText.trim())
        .filter(subjectText => subjectText.length > 0);

      return res;
    })
    .flat()
    .filter(filterOddSubjects);

  // Returns ten datafields at most in order to produce reasonably size records for prepublications
  return subjects
    .slice(0, 10)
    .map(subject => ({
      tag: '653',
      subfields: [
        {code: 'a', value: subject},
        {code: '7', value: 'Ennakkotieto'}
      ]
    }));


  /**
   * Filters subjects that seem somehow odd and therefore probably should not be included to record.
   * Currently subject is evaluated to be suspicious if it includes full stop or multiple whitespaces.
   * @param {string} subjectText subject text as string
   * @returns {boolean} true if subject does not seem odd, otherwise false
   */
  function filterOddSubjects(subjectText) {
    const containsFullStop = subjectText.match(/\./) !== null;
    const whitespaceCharacters = subjectText.match(/\s/g) ?? [];

    if (containsFullStop || whitespaceCharacters.length > 2) {
      return false;
    }

    return true;
  }
}

/**
 * Generates 655 field for print and electronical records that are not legal deposit. Fields are generated for mp3 audiobooks
 * and for a set of pre-defined hardcoded YSO subjects that can be mapped to SLM.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field 655
 */

// eslint-disable-next-line max-lines-per-function
export function generate655Common(onixConversionConfiguration, valueInterface) {
  /*
  Onix Codelists: List 27: Subject scheme identifier code
  https://ns.editeur.org/onix/en/27

  71 | YSO | Yleinen suomalainen ontologia: Finnish General Upper Ontology
  */

  if (onixConversionConfiguration.isLegalDeposit) {
    return [];
  }

  const audiobookFields = isDownloadableMp3(valueInterface) ? getAudiobookFields() : [];
  const comicFields = isComic(valueInterface) ? getComicFields() : [];
  const smpFields = isSimplifiedLanguageEdition(valueInterface) ? getSmpFields() : [];

  // YSO subjects which have match in SLM mapping are created as f655
  const ysoSubjects = getYsoSubjects(valueInterface);
  const slmSubjects = ysoSubjects
    .map(ysoSubject => ysoToSlm(ysoSubject))
    .filter(slmSubject => slmSubject !== null);

  const slmFields = slmSubjects.map(slmSubject => ({
    tag: '655',
    ind2: '7',
    subfields: [
      {code: 'a', value: slmSubject.value},
      {code: '2', value: 'slm/fin'},
      {code: '0', value: slmSubject.urn}
    ]
  }));

  const fields = audiobookFields.concat(comicFields, slmFields, smpFields);
  const deduplicatedFields = fields.reduce((prev, next) => {
    const previousSubfieldAValues = prev.map(({subfields}) => subfields.find(sf => sf.code === 'a').value);
    const previousContainsSubject = previousSubfieldAValues.includes(next.subfields.find(sf => sf.code === 'a').value);

    if (previousContainsSubject) {
      return prev;
    }

    return prev.concat(next);
  }, []);

  return deduplicatedFields;


  // Getter for audiobook f655
  function getAudiobookFields() {
    return [
      {
        tag: '655',
        ind2: '7',
        subfields: [
          {code: 'a', value: 'äänikirjat'},
          {code: '2', value: 'slm/fin'},
          {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:slm:s579'},
          {code: '9', value: 'FENNI<KEEP>'}
        ]
      },
      {
        tag: '655',
        ind2: '7',
        subfields: [
          {code: 'a', value: 'ljudböcker'},
          {code: '2', value: 'slm/swe'},
          {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:slm:s579'}
        ]
      }
    ];
  }

  // Getter for comic f655
  function getComicFields() {
    return [
      {
        tag: '655',
        ind2: '7',
        subfields: [
          {code: 'a', value: 'sarjakuvat'},
          {code: '2', value: 'slm/fin'},
          {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:slm:s356'}
        ]
      },
      {
        tag: '655',
        ind2: '7',
        subfields: [
          {code: 'a', value: 'tecknade serier'},
          {code: '2', value: 'slm/swe'},
          {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:slm:s356'}
        ]
      }
    ];
  }

  function getSmpFields() {
    return [
      {
        tag: '655',
        ind2: '7',
        subfields: [
          {code: 'a', value: 'selkokirjat'},
          {code: '2', value: 'slm/fin'},
          {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:slm:s686'},
          {code: '9', value: 'FENNI<KEEP>'}
        ]
      },
      {
        tag: '655',
        ind2: '7',
        subfields: [
          {code: 'a', value: 'böcker på lätt språk'},
          {code: '2', value: 'slm/swe'},
          {code: '0', value: 'http://urn.fi/URN:NBN:fi:au:slm:s686'}
        ]
      }
    ];
  }
}


