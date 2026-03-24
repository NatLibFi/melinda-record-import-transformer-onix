import assert from 'node:assert';
import {Readable} from 'node:stream';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import createFilterPipeline from './filter-product.js';
import {createValueInterface} from '../utils/data-utils.js';
import {readProduct} from '../utils/test-utils.js';
import {createCommonErrorPayload} from './product-utils.js';

import FilterError from '../errors/FilterError.js';

// Run tests
filterProductTests();

// Test definitions
function filterProductTests() {
  generateTests({
    callback,
    path: [import.meta.dirname, '..', '..', 'test-fixtures', 'transform', 'filter-product'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, filterConfiguration, expectedError, expectedFilterError, haltPipeline}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);
    const commonErrorPayload = createCommonErrorPayload(valueInterface);

    // When expecting configuration error
    if (expectedError) {
      assert.equal(haltPipeline, true, 'When expecting filter pipeline initialization error, you must expect haltPipeline to be true');
      assert.throws(() => createFilterPipeline(filterConfiguration), new Error(expectedError));
      return;
    }

    const filterRecord = createFilterPipeline(filterConfiguration);

    // When expecting error occurring during filter pipeline processing
    if (expectedFilterError && haltPipeline) {
      assert.throws(() => filterRecord(valueInterface, commonErrorPayload), new Error(expectedFilterError));
      return;
    }

    if (expectedFilterError && !haltPipeline) {
      assert.throws(() => filterRecord(valueInterface, commonErrorPayload), new FilterError(commonErrorPayload, expectedFilterError));
      return;
    }

    assert.doesNotThrow(() => filterRecord(valueInterface, commonErrorPayload));
    return;
  }
}