import assert from 'node:assert';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generateLOWCommon, generateSIDCommon} from './generate-system-fields-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-system-fields-common'];

// Run tests
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-sid-common'), generateSIDCommon);
generateLOWCommonTests();

function generateLOWCommonTests() {
  generateTests({
    callback,
    path: testFixtureRootPath.concat('generate-low-common'),
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, onixConversionConfiguration, expectedError}) {
    // Note: field generator does not use valueInterface and thus it is hardcoded to null in tests
    if (expectedError) {
      assert.throws(() => generateLOWCommon(onixConversionConfiguration, null), Error(expectedError));
      return;
    }

    const expectedOutputRaw = getFixture('output.json');
    const expectedOutput = JSON.parse(expectedOutputRaw);

    const result = generateLOWCommon(onixConversionConfiguration, null);
    assert.deepStrictEqual(result, expectedOutput, 'Resulting field did not match the expected');
  }
}
