import assert from 'node:assert';
import {Readable} from 'node:stream';

import {Settings} from 'luxon';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {createValueInterface} from '../../../utils/data-utils.js';
import {readProduct} from '../../../utils/test-utils.js';
import generatePrintRecord from './generate-print-record.js';

import {TEST_START_DATE} from '../../../test-constants.js';

// Run tests
generatePrintRecordTests();

// Test definitions
function generatePrintRecordTests() {
  generateTests({
    callback,
    path: [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'print', 'generate-print-record'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    },
    hooks: {
      beforeEach: () => {
        Settings.now = () => new Date(TEST_START_DATE);
      }
    }
  });

  async function callback({getFixture, onixConversionConfiguration, sentTime, expectedError}) {
    const inputRecord = getFixture('input.xml');

    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => generatePrintRecord(onixConversionConfiguration, valueInterface, sentTime), Error(expectedError));
      return;
    }

    const expectedOutputRaw = getFixture('output.json');
    const expectedOutput = JSON.parse(expectedOutputRaw);

    const result = generatePrintRecord(onixConversionConfiguration, valueInterface, sentTime);

    assert.equal(result.leader, expectedOutput.leader, 'Generated leader did not match expected');
    assert.deepStrictEqual(result.fields, expectedOutput.fields, 'Generated record fields did not match expected fields');
  }
}