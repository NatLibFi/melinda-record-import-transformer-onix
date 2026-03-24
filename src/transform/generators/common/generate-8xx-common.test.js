import assert from 'node:assert';

import {Settings} from 'luxon';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {generate884Common} from './generate-8xx-common.js';
import {MarcRecord} from '@natlibfi/marc-record';

import {TEST_START_DATE} from '../../../test-constants.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-8xx-common'];

// Run tests
generate884CommonTests();

function generate884CommonTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('generate-884-common'),
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

  async function callback({getFixture, onixConversionConfiguration, expectedError}) {
    // Note: this field does not require input.xml but instead field is generated for empty marc record in tests always
    const testRecord = new MarcRecord();

    if (expectedError) {
      assert.throws(() => generate884Common(onixConversionConfiguration, testRecord), Error(expectedError));
      return;
    }

    const expectedOutputRaw = getFixture('output.json');
    const expectedOutput = JSON.parse(expectedOutputRaw);

    const result = generate884Common(onixConversionConfiguration, testRecord);
    assert.deepStrictEqual(result, expectedOutput, 'Resulting field did not match the expected');
  }
}