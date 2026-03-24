import assert from 'node:assert';
import {Readable} from 'node:stream';

import {Settings} from 'luxon';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {createValueInterface} from '../utils/data-utils.js';
import {createCommonErrorPayload} from './product-utils.js';
import {readProduct} from '../utils/test-utils.js';

import {TEST_START_DATE} from '../test-constants.js';

import createConversion from './convert-product.js';
import ConversionError from '../errors/ConversionError.js';

// Run tests
generateConvertRecordTests();


function generateConvertRecordTests() {
  generateTests({
    callback,
    path: [import.meta.dirname, '..', '..', 'test-fixtures', 'transform', 'convert-product'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: false // false is used as halting errors do not produce output
    },
    hooks: {
      beforeEach: () => {
        Settings.now = () => new Date(TEST_START_DATE);
      }
    }
  });

  async function callback({getFixture, onixConversionConfiguration, sentTime, expectedError, expectedConversionError, haltPipeline}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);
    const commonErrorPayload = createCommonErrorPayload(valueInterface);

    if (expectedError && haltPipeline) {
      assert.throws(() => createConversion(onixConversionConfiguration), new Error(expectedError));
      return;
    }

    const convertProduct = createConversion(onixConversionConfiguration);

    if (expectedConversionError) {
      assert.rejects(async () => await convertProduct(valueInterface, sentTime, commonErrorPayload), new ConversionError(commonErrorPayload, expectedConversionError));
      return;
    }

    const expectedOutputRaw = getFixture('output.json');
    const expectedOutput = JSON.parse(expectedOutputRaw);

    const result = await convertProduct(valueInterface, sentTime, commonErrorPayload);
    assert.deepStrictEqual(result, expectedOutput, 'Resulting field did not match the expected');
  }
}