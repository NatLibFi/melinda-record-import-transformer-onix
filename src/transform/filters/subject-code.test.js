import assert from 'node:assert';
import {Readable} from 'node:stream';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import subjectCodeFilter from './subject-code.js';
import {createValueInterface} from '../../utils/data-utils.js';
import {readProduct} from '../../utils/test-utils.js';
import {createCommonErrorPayload} from '../product-utils.js';

import FilterError from '../../errors/FilterError.js';

// Run tests
subjectCodeFilterTests();

// Test definitions
function subjectCodeFilterTests() {
  generateTests({
    callback,
    path: [import.meta.dirname, '..', '..', '..', 'test-fixtures', 'filter', 'subject-code'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, settings, expectedError, haltPipeline}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);
    const commonErrorPayload = createCommonErrorPayload(valueInterface);

    if (expectedError && haltPipeline) {
      assert.throws(() => subjectCodeFilter(valueInterface, settings, commonErrorPayload), new Error(expectedError));
      return;
    }

    if (expectedError && !haltPipeline) {
      assert.throws(() => subjectCodeFilter(valueInterface, settings, commonErrorPayload), new FilterError(commonErrorPayload, expectedError));
      return;
    }

    assert.doesNotThrow(() => subjectCodeFilter(valueInterface, settings, commonErrorPayload));
    return;
  }
}