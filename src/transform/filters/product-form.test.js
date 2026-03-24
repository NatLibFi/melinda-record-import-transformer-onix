import assert from 'node:assert';
import {Readable} from 'node:stream';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import productFormFilter from './product-form.js';
import {createValueInterface} from '../../utils/data-utils.js';
import {readProduct} from '../../utils/test-utils.js';
import {createCommonErrorPayload} from '../product-utils.js';

import FilterError from '../../errors/FilterError.js';

// Run tests
productFormFilterTests();

// Test definitions
function productFormFilterTests() {
  generateTests({
    callback,
    path: [import.meta.dirname, '..', '..', '..', 'test-fixtures', 'filter', 'product-form'],
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
      assert.throws(() => productFormFilter(valueInterface, settings, commonErrorPayload), new Error(expectedError));
      return;
    }

    if (expectedError && !haltPipeline) {
      assert.throws(() => productFormFilter(valueInterface, settings, commonErrorPayload), new FilterError(commonErrorPayload, expectedError));
      return;
    }

    assert.doesNotThrow(() => productFormFilter(valueInterface, settings, commonErrorPayload));
    return;
  }
}