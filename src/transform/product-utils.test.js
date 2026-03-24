/* eslint-disable max-lines */
import assert from 'node:assert';
import {Readable} from 'node:stream';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {createValueInterface} from '../utils/data-utils.js';
import {readProduct} from '../utils/test-utils.js';

import {
  createCommonErrorPayload,
  detectTitleLanguage,
  filterByFirstValue,
  getCollectionInformation,
  getExtentInformation,
  getGTIN,
  getImprintNames,
  getIsbn,
  getIsmn,
  getOnlineTextFormat,
  getProductDataSource,
  getProductTitleLanguage,
  getPublisherNames,
  getPublishingDates,
  getYsoSubjects,
  hasIllustrations,
  isAudio,
  isComic,
  isDownloadableMp3,
  isEpub,
  isOnlineText,
  isPdf,
  isPrintText,
  isProductAbandoned,
  isSimplifiedLanguageEdition,
  isText,
  isTranslation
} from './product-utils.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', 'test-fixtures', 'transform', 'product-utils'];

// Run tests
createCommonErrorPayloadTests();
detectTitleLanguageTests();
filterByFirstValueTests();
getCollectionInformationTests();
getExtentInformationTests();
getGTINTests();
getImprintNamesTests();
getIsbnTests();
getIsmnTests();
getOnlineTextFormatTests();
getProductDataSourceTests();
getProductTitleLanguageTests();
getPublisherNamesTests();
getPublishingDatesTests();
getYsoSubjectsTests();
hasIllustrationsTests();
isAudioTests();
isComicTests();
isDownloadableMp3Tests();
isEpubTests();
isOnlineTextTests();
isPdfTests();
isPrintTextTests();
isProductAbandonedTests();
isSimplifiedLanguageEditionTests();
isTextTests();
isTranslationTests();

// Test definitions
function getProductDataSourceTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-source'),
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
      assert.throws(() => getProductDataSource(valueInterface), Error(expectedError));
      return;
    }

    const result = getProductDataSource(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function createCommonErrorPayloadTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('create-common-error-payload'),
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
      assert.throws(() => createCommonErrorPayload(valueInterface), Error(expectedError));
      return;
    }

    const result = createCommonErrorPayload(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function filterByFirstValueTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('filter-by-first-value'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, expectedValue, expectedError, attributeName, acceptedValues}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    // Note: using ProductIdentifier entry as static source object for these tests
    const [productIdentifier] = valueInterface.getValues('ProductIdentifier');

    if (expectedError) {
      assert.throws(() => filterByFirstValue(productIdentifier, attributeName, acceptedValues), Error(expectedError));
      return;
    }

    const result = filterByFirstValue(productIdentifier, attributeName, acceptedValues);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isDownloadableMp3Tests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-downloadable-mp3'),
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
      assert.throws(() => isDownloadableMp3(valueInterface), Error(expectedError));
      return;
    }

    const result = isDownloadableMp3(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isEpubTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-epub'),
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
      assert.throws(() => isEpub(valueInterface), Error(expectedError));
      return;
    }

    const result = isEpub(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isPdfTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-pdf'),
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
      assert.throws(() => isPdf(valueInterface), Error(expectedError));
      return;
    }

    const result = isPdf(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isTextTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-text'),
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
      assert.throws(() => isText(valueInterface), Error(expectedError));
      return;
    }

    const result = isText(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isOnlineTextTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-online-text'),
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
      assert.throws(() => isOnlineText(valueInterface), Error(expectedError));
      return;
    }

    const result = isOnlineText(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isPrintTextTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-print-text'),
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
      assert.throws(() => isPrintText(valueInterface), Error(expectedError));
      return;
    }

    const result = isPrintText(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isAudioTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-audio'),
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
      assert.throws(() => isAudio(valueInterface), Error(expectedError));
      return;
    }

    const result = isAudio(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isComicTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-comic'),
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
      assert.throws(() => isComic(valueInterface), Error(expectedError));
      return;
    }

    const result = isComic(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getIsbnTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-isbn'),
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
      assert.throws(() => getIsbn(valueInterface), Error(expectedError));
      return;
    }

    const result = getIsbn(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getIsmnTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-ismn'),
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
      assert.throws(() => getIsmn(valueInterface), Error(expectedError));
      return;
    }

    const result = getIsmn(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getGTINTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-gtin'),
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
      assert.throws(() => getGTIN(valueInterface), Error(expectedError));
      return;
    }

    const result = getGTIN(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getPublishingDatesTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-publishing-dates'),
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
      assert.throws(() => getPublishingDates(valueInterface), Error(expectedError));
      return;
    }

    const result = getPublishingDates(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function detectTitleLanguageTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('detect-title-language'),
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
      assert.throws(() => detectTitleLanguage(valueInterface), Error(expectedError));
      return;
    }

    const result = detectTitleLanguage(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function hasIllustrationsTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('has-illustrations'),
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
      assert.throws(() => hasIllustrations(valueInterface), Error(expectedError));
      return;
    }

    const result = hasIllustrations(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getOnlineTextFormatTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-online-text-format'),
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
      assert.throws(() => getOnlineTextFormat(valueInterface), Error(expectedError));
      return;
    }

    const result = getOnlineTextFormat(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isSimplifiedLanguageEditionTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-simplified-language-edition'),
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
      assert.throws(() => isSimplifiedLanguageEdition(valueInterface), Error(expectedError));
      return;
    }

    const result = isSimplifiedLanguageEdition(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getExtentInformationTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-extent-information'),
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
      assert.throws(() => getExtentInformation(valueInterface), Error(expectedError));
      return;
    }

    const result = getExtentInformation(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getProductTitleLanguageTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-product-title-language'),
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
      assert.throws(() => getProductTitleLanguage(valueInterface), Error(expectedError));
      return;
    }

    const result = getProductTitleLanguage(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isTranslationTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-translation'),
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
      assert.throws(() => isTranslation(valueInterface), Error(expectedError));
      return;
    }

    const result = isTranslation(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getPublisherNamesTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-publisher-names'),
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
      assert.throws(() => getPublisherNames(valueInterface), Error(expectedError));
      return;
    }

    const result = getPublisherNames(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getImprintNamesTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-imprint-names'),
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
      assert.throws(() => getImprintNames(valueInterface), Error(expectedError));
      return;
    }

    const result = getImprintNames(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getCollectionInformationTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-collection-information'),
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
      assert.throws(() => getCollectionInformation(valueInterface), Error(expectedError));
      return;
    }

    const result = getCollectionInformation(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function isProductAbandonedTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('is-product-abandoned'),
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
      assert.throws(() => isProductAbandoned(valueInterface), Error(expectedError));
      return;
    }

    const result = isProductAbandoned(valueInterface);
    assert.equal(result, expectedValue, 'Resulting value did not match expected value');
  }
}

function getYsoSubjectsTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('get-yso-subjects'),
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
      assert.throws(() => getYsoSubjects(valueInterface), Error(expectedError));
      return;
    }

    const result = getYsoSubjects(valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting value did not match expected value');
  }
}
