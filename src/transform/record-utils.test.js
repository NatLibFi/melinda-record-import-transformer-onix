/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import assert from 'node:assert';
import {Readable} from 'node:stream';
import {describe, it} from 'node:test';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {createValueInterface} from '../utils/data-utils.js';
import {readProduct} from '../utils/test-utils.js';

import {
  constructDurationString,
  deduplicateAuthors,
  findTitleSplitRegex,
  getContributors,
  getF008AudioGenre,
  getF008BookGenre,
  getF008Language,
  getF008PublicationCountry,
  getF008TargetAudience,
  getFirstYklSubjectMainClass,
  getForeignLanguageTextbookLanguage,
  getRecordMainLangs,
  getRecordType,
  isContributorValid,
  isFictionMainClass,
  isIssnIdentifier,
  isSerialTitle,
  splitTitle,
  translateContributorRoleCode,
  translatePrintProductForm,
  ysoToSlm
} from './record-utils.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', 'test-fixtures', 'transform', 'record-utils'];

// Run tests
getContributorsTests();
getF008AudioGenreTests();
getF008BookGenreTests();
getF008LanguageTests();
getF008PublicationCountryTests();
getF008TargetAudienceTests();
getFirstYklSubjectMainClassTests();
getForeignLanguageTextbookLanguageTests();
getRecordMainLangsTests();
getRecordTypeTests();
translatePrintProductFormTests();

// Test definitions
function getRecordTypeTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-record-type'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getRecordType(valueInterface), Error(expectedError));
      return;
    }

    const result = getRecordType(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function translatePrintProductFormTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('translate-print-product-form'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => translatePrintProductForm(valueInterface), Error(expectedError));
      return;
    }

    const result = translatePrintProductForm(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getF008PublicationCountryTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-f008-publication-country'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getF008PublicationCountry(valueInterface), Error(expectedError));
      return;
    }

    const result = getF008PublicationCountry(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}


function getF008TargetAudienceTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-f008-target-audience'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getF008TargetAudience(valueInterface), Error(expectedError));
      return;
    }

    const result = getF008TargetAudience(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getRecordMainLangsTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-record-main-langs'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError, languageSanityCheck}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getRecordMainLangs(valueInterface, languageSanityCheck), Error(expectedError));
      return;
    }

    const result = getRecordMainLangs(valueInterface, languageSanityCheck);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getForeignLanguageTextbookLanguageTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-foreign-language-textbook-language'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getForeignLanguageTextbookLanguage(valueInterface), Error(expectedError));
      return;
    }

    const result = getForeignLanguageTextbookLanguage(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getF008LanguageTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-f008-language'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError, languageSanityCheck}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getF008Language(valueInterface, languageSanityCheck), Error(expectedError));
      return;
    }

    const result = getF008Language(valueInterface, languageSanityCheck);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getFirstYklSubjectMainClassTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-first-ykl-subject-main-class'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getFirstYklSubjectMainClass(valueInterface), Error(expectedError));
      return;
    }

    const result = getFirstYklSubjectMainClass(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

// isFictionMainClass does not use valueInterface and thus does not need test-fixtures for testing
describe('isFictionMainClass', () => {
  it('YKL code 80 returns true', () => {
    const yklCode = '80';
    const result = isFictionMainClass(yklCode);
    assert.equal(result, true);
  });

  it('YKL code 81 returns true', () => {
    const yklCode = '81';
    const result = isFictionMainClass(yklCode);
    assert.equal(result, true);
  });

  it('YKL code 82 returns true', () => {
    const yklCode = '82';
    const result = isFictionMainClass(yklCode);
    assert.equal(result, true);
  });

  it('YKL code 83 returns true', () => {
    const yklCode = '83';
    const result = isFictionMainClass(yklCode);
    assert.equal(result, true);
  });

  it('YKL code 84 returns true', () => {
    const yklCode = '84';
    const result = isFictionMainClass(yklCode);
    assert.equal(result, true);
  });

  it('YKL code 85 returns true', () => {
    const yklCode = '85';
    const result = isFictionMainClass(yklCode);
    assert.equal(result, true);
  });

  it('YKL code 99 returns false', () => {
    const yklCode = '99';
    const result = isFictionMainClass(yklCode);
    assert.equal(result, false);
  });

  it('When receiving null as input, returns false', () => {
    const yklCode = null;
    const result = isFictionMainClass(yklCode);
    assert.equal(result, false);
  });
});

function getF008BookGenreTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-f008-book-genre'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getF008BookGenre(valueInterface), Error(expectedError));
      return;
    }

    const result = getF008BookGenre(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getF008AudioGenreTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-f008-audio-genre'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getF008AudioGenre(valueInterface), Error(expectedError));
      return;
    }

    const result = getF008AudioGenre(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

describe('isSerialTitle', () => {
  it('Returns true when title includes pattern like "xx yyyy"', () => {
    const title = 'The foo 01 2024';
    const result = isSerialTitle(title);

    assert.equal(result, true);
  });

  it('Returns true when title includes pattern like "yyyy xx"', () => {
    const title = 'The foo 2024 01';
    const result = isSerialTitle(title);

    assert.equal(result, true);
  });

  it('Returns true when title includes pattern like "yyyy-xx"', () => {
    const title = 'The foo 2024-01';
    const result = isSerialTitle(title);

    assert.equal(result, true);
  });

  it('Returns true when title includes pattern like "xx-yyyy"', () => {
    const title = 'The foo 01-2024';
    const result = isSerialTitle(title);

    assert.equal(result, true);
  });

  it('Returns true when title includes pattern like "yyyy xx_zz"', () => {
    const title = 'The foo 2024 10_11';
    const result = isSerialTitle(title);

    assert.equal(result, true);
  });

  it('Returns true when title includes pattern like "xx_zz yyyy"', () => {
    const title = 'The foo 10_11 2024';
    const result = isSerialTitle(title);

    assert.equal(result, true);
  });

  it('Returns true when title includes pattern like "xx/yyyy"', () => {
    const title = 'The foo 11/2024';
    const result = isSerialTitle(title);

    assert.equal(result, true);
  });

  it('Returns false when title does not include any serial-like pattern', () => {
    const validTitles = [
      'The foo 2024',
      'The foo 1: 2024 edition',
      'The foo 2024: 1234 is a series of numbers',
      'The foo 2025 - 1 thing to know about TDD',
      'FOSS in libraries 2000-2026',
      '2000-2026 Software development management strategies',
      'Javascript during 2000-2026 time period',
      'FOO12-12345',
      'FOO 12-34566',
      'FOOBAR 10-00001, this is a standard',
      '10-00001 FOOBAR, this is a standard',
      'This is a standard, FOOBAR 10-00001',
    ];

    validTitles.forEach(title => {
      const result = isSerialTitle(title);
      assert.equal(result, false);
    });

  });
});

describe('findTitleSplitRegex + splitTitle', () => {
  it('Correct splits for title including ":"', () => {
    const title = 'The foo: Baz';
    const findSplitterResult = findTitleSplitRegex(title);

    const expectedSplitterResult = {
      keepCharactersFromStart: 0,
      keepCharactersFromEnd: 0,
      keepResult: false,
      regex: /:\s+/u
    };

    assert.deepStrictEqual(findSplitterResult, expectedSplitterResult, 'Expected different split definition');

    const splitResult = splitTitle(title, findSplitterResult);
    const expectedSplitResult = {
      alternativeTitle: 'The foo',
      alternativeSubtitle: 'Baz'
    };

    assert.deepStrictEqual(splitResult, expectedSplitResult, 'Expected different split result');
  });

  it('Correct splits for title including "-"', () => {
    const title = 'The foo - Baz';
    const findSplitterResult = findTitleSplitRegex(title);

    const expectedSplitterResult = {
      keepCharactersFromStart: 1,
      keepCharactersFromEnd: 1,
      keepResult: false,
      regex: /[^0-9]\s+[\u2013\u2014-]\s+[^0-9]/u
    };

    assert.deepStrictEqual(findSplitterResult, expectedSplitterResult, 'Expected different split definition');

    const splitResult = splitTitle(title, findSplitterResult);
    const expectedSplitResult = {
      alternativeTitle: 'The foo',
      alternativeSubtitle: 'Baz'
    };

    assert.deepStrictEqual(splitResult, expectedSplitResult, 'Expected different split result');
  });

  it('Correct splits for title including "!"', () => {
    const title = 'The foo! Baz';
    const findSplitterResult = findTitleSplitRegex(title);

    const expectedSplitterResult = {
      keepCharactersFromStart: 0,
      keepCharactersFromEnd: 0,
      keepResult: true,
      regex: /!+|\?+/u
    };

    assert.deepStrictEqual(findSplitterResult, expectedSplitterResult, 'Expected different split definition');

    const splitResult = splitTitle(title, findSplitterResult);
    const expectedSplitResult = {
      alternativeTitle: 'The foo!',
      alternativeSubtitle: 'Baz'
    };

    assert.deepStrictEqual(splitResult, expectedSplitResult, 'Expected different split result');
  });

  it('Correct splits for title including "?"', () => {
    const title = 'The foo? Baz';
    const findSplitterResult = findTitleSplitRegex(title);

    const expectedSplitterResult = {
      keepCharactersFromStart: 0,
      keepCharactersFromEnd: 0,
      keepResult: true,
      regex: /!+|\?+/u
    };

    assert.deepStrictEqual(findSplitterResult, expectedSplitterResult, 'Expected different split definition');

    const splitResult = splitTitle(title, findSplitterResult);
    const expectedSplitResult = {
      alternativeTitle: 'The foo?',
      alternativeSubtitle: 'Baz'
    };

    assert.deepStrictEqual(splitResult, expectedSplitResult, 'Expected different split result');
  });

  it('Process returns alternativeTitle:null when splitter is not found', () => {
    const title = 'The foo ** Baz';
    const findSplitterResult = findTitleSplitRegex(title);

    const expectedSplitterResult = null;

    assert.deepStrictEqual(findSplitterResult, expectedSplitterResult, 'Expected different split definition');

    const splitResult = splitTitle(title, findSplitterResult);
    const expectedSplitResult = {
      alternativeTitle: null,
      alternativeSubtitle: null
    };

    assert.deepStrictEqual(splitResult, expectedSplitResult, 'Expected different split result');
  });
});

describe('constructDurationString', () => {
  it('Produces correct output with hours, minutes, and seconds defined', () => {
    const hours = '1';
    const minutes = '23';
    const seconds = '4';

    const expectedResult = '1 h 23 min 4 s';
    const result = constructDurationString(hours, minutes, seconds);
    assert.equal(expectedResult, result);
  });

  it('Produces correct output with hours and minutes defined', () => {
    const hours = '1';
    const minutes = '23';
    const seconds = null;

    const expectedResult = '1 h 23 min';
    const result = constructDurationString(hours, minutes, seconds);
    assert.equal(expectedResult, result);
  });

  it('Produces correct output with hours and seconds defined', () => {
    const hours = '1';
    const minutes = null;
    const seconds = '4';

    const expectedResult = '1 h 4 s';
    const result = constructDurationString(hours, minutes, seconds);
    assert.equal(expectedResult, result);
  });

  it('Produces correct output with minutes and seconds defined', () => {
    const hours = null;
    const minutes = '23';
    const seconds = '4';

    const expectedResult = '23 min 4 s';
    const result = constructDurationString(hours, minutes, seconds);
    assert.equal(expectedResult, result);
  });

  it('Produces correct output with hours defined', () => {
    const hours = '1';
    const minutes = null;
    const seconds = null;

    const expectedResult = '1 h';
    const result = constructDurationString(hours, minutes, seconds);
    assert.equal(expectedResult, result);
  });

  it('Produces correct output with minutes defined', () => {
    const hours = null;
    const minutes = '23';
    const seconds = null;

    const expectedResult = '23 min';
    const result = constructDurationString(hours, minutes, seconds);
    assert.equal(expectedResult, result);
  });

  it('Returns empty string when all input is undefined', () => {
    const hours = null;
    const minutes = null;
    const seconds = null;

    const expectedResult = '';
    const result = constructDurationString(hours, minutes, seconds);
    assert.equal(expectedResult, result);
  });
});

function getContributorsTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-contributors'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => getContributors(valueInterface), Error(expectedError));
      return;
    }

    const result = getContributors(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

describe('deduplicateAuthors', () => {
  it('properly deduplicates author if it is already found', () => {
    const currentContributors = [
      {
        'idx': 0,
        'personName': 'Matti Meikäläinen',
        'personNameInverted': 'Meikäläinen, Matti',
        'corporateName': null,
        'roleCodes': ['A01', 'B06'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      }
    ];

    const nextContributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen',
      'personNameInverted': 'Meikäläinen, Matti',
      'corporateName': null,
      'roleCodes': ['B01'],
      'isTranslator': false,
      'sequenceNumber': 2,
      'isAiAuthor': false,
    };

    const expectedResult = [
      {
        'idx': 0,
        'personName': 'Matti Meikäläinen',
        'personNameInverted': 'Meikäläinen, Matti',
        'corporateName': null,
        'roleCodes': ['A01', 'B06', 'B01'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      }
    ];

    const result = deduplicateAuthors(currentContributors, nextContributor);
    assert.deepStrictEqual(expectedResult, result);
  });

  it('properly adds author if it is not already found', () => {
    const currentContributors = [
      {
        'idx': 0,
        'personName': 'Matti Meikäläinen',
        'personNameInverted': 'Meikäläinen, Matti',
        'corporateName': null,
        'roleCodes': ['A01', 'B06'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      }
    ];

    const nextContributor = {
      'idx': 1,
      'personName': 'Maija Meikäläinen',
      'personNameInverted': 'Meikäläinen, Maija',
      'corporateName': null,
      'roleCodes': ['B01'],
      'isTranslator': false,
      'sequenceNumber': 2,
      'isAiAuthor': false,
    };

    const expectedResult = [
      {
        'idx': 0,
        'personName': 'Matti Meikäläinen',
        'personNameInverted': 'Meikäläinen, Matti',
        'corporateName': null,
        'roleCodes': ['A01', 'B06'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      },
      {
        'idx': 1,
        'personName': 'Maija Meikäläinen',
        'personNameInverted': 'Meikäläinen, Maija',
        'corporateName': null,
        'roleCodes': ['B01'],
        'isTranslator': false,
        'sequenceNumber': 2,
        'isAiAuthor': false,
      }
    ];

    const result = deduplicateAuthors(currentContributors, nextContributor);
    assert.deepStrictEqual(expectedResult, result);
  });

  it('translator/ai feats and lowest sequence number carry over independent of combining order', () => {
    const currentContributors = [
      {
        'idx': 0,
        'personName': 'Matti Meikäläinen',
        'personNameInverted': 'Meikäläinen, Matti',
        'corporateName': null,
        'roleCodes': ['A01', 'B01'],
        'isTranslator': false,
        'sequenceNumber': 2,
        'isAiAuthor': true,
      }
    ];

    const nextContributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen',
      'personNameInverted': 'Meikäläinen, Matti',
      'corporateName': null,
      'roleCodes': ['B06'],
      'isTranslator': true,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const expectedResult = [
      {
        'idx': 0,
        'personName': 'Matti Meikäläinen',
        'personNameInverted': 'Meikäläinen, Matti',
        'corporateName': null,
        'roleCodes': ['A01', 'B01', 'B06'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': true,
      }
    ];

    const result = deduplicateAuthors(currentContributors, nextContributor);
    assert.deepStrictEqual(expectedResult, result);
  });

  it('properly adds author if it is not already found with corporate name', () => {
    const currentContributors = [
      {
        'idx': 0,
        'personName': null,
        'personNameInverted': null,
        'corporateName': 'Foo Corporation',
        'roleCodes': ['A01', 'B06'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      }
    ];

    const nextContributor = {
      'idx': 1,
      'personName': null,
      'personNameInverted': null,
      'corporateName': 'Foo Corporation',
      'roleCodes': ['B01'],
      'isTranslator': false,
      'sequenceNumber': 2,
      'isAiAuthor': false,
    };

    const expectedResult = [
      {
        'idx': 0,
        'personName': null,
        'personNameInverted': null,
        'corporateName': 'Foo Corporation',
        'roleCodes': ['A01', 'B06', 'B01'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      }
    ];

    const result = deduplicateAuthors(currentContributors, nextContributor);
    assert.deepStrictEqual(expectedResult, result);
  });

  it('corporate name is not matched with inverted person name', () => {
    const currentContributors = [
      {
        'idx': 0,
        'personName': 'Foo Corporation',
        'personNameInverted': 'Foo Corporation',
        'corporateName': null,
        'roleCodes': ['A01', 'B06'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      }
    ];

    const nextContributor = {
      'idx': 1,
      'personName': null,
      'personNameInverted': null,
      'corporateName': 'Foo Corporation',
      'roleCodes': ['B01'],
      'isTranslator': false,
      'sequenceNumber': 2,
      'isAiAuthor': false,
    };

    const expectedResult = [
      {
        'idx': 0,
        'personName': 'Foo Corporation',
        'personNameInverted': 'Foo Corporation',
        'corporateName': null,
        'roleCodes': ['A01', 'B06'],
        'isTranslator': true,
        'sequenceNumber': 1,
        'isAiAuthor': false,
      },
      {
        'idx': 1,
        'personName': null,
        'personNameInverted': null,
        'corporateName': 'Foo Corporation',
        'roleCodes': ['B01'],
        'isTranslator': false,
        'sequenceNumber': 2,
        'isAiAuthor': false,
      }
    ];

    const result = deduplicateAuthors(currentContributors, nextContributor);
    assert.deepStrictEqual(expectedResult, result);
  });
});

describe('isContributorValid', () => {
  it('returns true for valid contributor that has corporateName', () => {
    const contributor = {
      'idx': 1,
      'personName': null,
      'personNameInverted': null,
      'corporateName': 'Foo Corporation',
      'roleCodes': ['B01'],
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const result = isContributorValid(contributor);
    assert.equal(true, result);
  });

  it('returns true for valid contributor that has personNameInverted', () => {
    const contributor = {
      'idx': 1,
      'personName': null,
      'personNameInverted': 'Meikäläinen, Matti',
      'corporateName': null,
      'roleCodes': ['B01'],
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const result = isContributorValid(contributor);
    assert.equal(true, result);
  });

  it('returns false if missing both corporateName and personNameInverted', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen',
      'personNameInverted': null,
      'corporateName': null,
      'roleCodes': ['B01'],
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const result = isContributorValid(contributor);
    assert.equal(false, result);
  });

  it('returns false if no valid roles available', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen',
      'personNameInverted': 'Meikäläinen, Matti',
      'corporateName': null,
      'roleCodes': ['B22'], // "Dramatized by" is not included to valid roles currently
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const result = isContributorValid(contributor);
    assert.equal(false, result);
  });

  it('returns false name if contains filtered phrases', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Walt Disney',
      'personNameInverted': 'Disney, Walt',
      'corporateName': null,
      'roleCodes': ['A01'],
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const result = isContributorValid(contributor);
    assert.equal(false, result);
  });

  it('returns false name if contains indication of multiple author information being combined', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Matti ja Maija Meikäläinen',
      'personNameInverted': 'Meikäläinen, Matti ja Maija',
      'corporateName': null,
      'roleCodes': ['A01'],
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const result = isContributorValid(contributor);
    assert.equal(false, result);
  });

  it('returns false if name contains characters not accepted in the contributor name', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen!',
      'personNameInverted': 'Meikäläinen!, Matti',
      'corporateName': null,
      'roleCodes': ['A01'],
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': false,
    };

    const result = isContributorValid(contributor);
    assert.equal(false, result);
  });

  it('returns false isAiAuthor attribute is true', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen',
      'personNameInverted': 'Meikäläinen, Matti',
      'corporateName': null,
      'roleCodes': ['A01'],
      'isTranslator': false,
      'sequenceNumber': 1,
      'isAiAuthor': true,
    };

    const result = isContributorValid(contributor);
    assert.equal(false, result);
  });

  it('returns true if has role B05 and record is simplified language edition', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen',
      'personNameInverted': 'Meikäläinen, Matti',
      'corporateName': null,
      'roleCodes': ['B05'],
      'isTranslator': false,
      'sequenceNumber': 1
    };

    const result = isContributorValid(contributor, true);
    assert.equal(true, result);
  });

  it('returns false if has role B05 but record is not simplified language edition', () => {
    const contributor = {
      'idx': 1,
      'personName': 'Matti Meikäläinen',
      'personNameInverted': 'Meikäläinen, Matti',
      'corporateName': null,
      'roleCodes': ['B05'],
      'isTranslator': false,
      'sequenceNumber': 1
    };

    const result = isContributorValid(contributor, false);
    assert.equal(false, result);
  });
});

describe('translateContributorRoleCode', () => {
  it('Translates A01 correctly', () => {
    const roleCode = 'A01';
    const expectedResult = 'kirjoittaja';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Translates A06 correctly', () => {
    const roleCode = 'A06';
    const expectedResult = 'säveltäjä';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Translates A07 correctly', () => {
    const roleCode = 'A07';
    const expectedResult = 'taiteilija';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Translates A08 correctly', () => {
    const roleCode = 'A08';
    const expectedResult = 'valokuvaaja';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Translates A12 correctly', () => {
    const roleCode = 'A12';
    const expectedResult = 'kuvittaja';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Translates B01 correctly', () => {
    const roleCode = 'B01';
    const expectedResult = 'toimittaja';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Translates B06 correctly', () => {
    const roleCode = 'B06';
    const expectedResult = 'kääntäjä';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Translates E07 correctly', () => {
    const roleCode = 'E07';
    const expectedResult = 'lukija';
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Returns null for role code not included to translations', () => {
    const roleCode = 'B22'; // "Dramatized by"
    const expectedResult = null;
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });

  it('Returns null for input that is null', () => {
    const roleCode = null;
    const expectedResult = null;
    const result = translateContributorRoleCode(roleCode);

    assert.equal(expectedResult, result);
  });
});

describe('isIssnIdentifier', () => {
  it('return true for valid ISSN identifier', () => {
    const issnIdentifier = '0356-2751';
    const result = isIssnIdentifier(issnIdentifier);
    assert.equal(true, result);
  });

  // Known issue which is currently accepted
  it.todo('return false for ISSN identifier that has valid format but is not valid otherwise', () => { });

  it('return false for identifier that is not ISSN', () => {
    const issnIdentifier = '123456789';
    const result = isIssnIdentifier(issnIdentifier);
    assert.equal(false, result);
  });

  it('return false for valid null input', () => {
    const issnIdentifier = null;
    const result = isIssnIdentifier(issnIdentifier);
    assert.equal(false, result);
  });
});

describe('ysoToSlm', () => {
  it('Returns SLM term object for YSO term found in mapping table', () => {
    const ysoSubject = 'kertomakirjallisuus';
    const expectedResult = {
      value: 'kertomakirjallisuus',
      urn: 'http://urn.fi/URN:NBN:fi:au:slm:s352'
    };

    const result = ysoToSlm(ysoSubject);
    assert.deepStrictEqual(expectedResult, result);
  });

  it('Returns null for YSO term not found in mapping table', () => {
    const ysoSubject = 'erehdys';
    const expectedResult = null;
    const result = ysoToSlm(ysoSubject);
    assert.deepStrictEqual(expectedResult, result);
  });

  it('Returns null for null input', () => {
    const ysoSubject = null;
    const expectedResult = null;
    const result = ysoToSlm(ysoSubject);
    assert.deepStrictEqual(expectedResult, result);
  });
});