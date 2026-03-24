import assert from 'node:assert';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import createValidatorPipeline from './validate-record.js';
import ValidationError from '../errors/ValidationError.js';

// Run tests
generateValidateRecordTests();


// Test definitions
function generateValidateRecordTests() {
  generateTests({
    callback,
    path: [import.meta.dirname, '..', '..', 'test-fixtures', 'transform', 'validate-record'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.JSON,
      failWhenNotFound: false // false is used as halting errors do not produce output
    }
  });

  async function callback({getFixture, marcRecordValidatorConfiguration, expectedError, expectedValidationError, haltPipeline}) {
    const inputRecord = getFixture('input.json');
    const expectedResult = getFixture('output.json');

    // When expecting configuration error
    if (expectedError) {
      assert.equal(haltPipeline, true, 'When expecting validation pipeline initialization error, you must expect haltPipeline to be true');
      assert.throws(() => createValidatorPipeline(marcRecordValidatorConfiguration), new Error(expectedError));
      return;
    }

    const validateRecord = await createValidatorPipeline(marcRecordValidatorConfiguration);

    // When expecting validation process to throw validation error
    if (expectedValidationError) {
      const commonErrorPayload = {title: '', standardIdentifiers: []}; // Use hardcoded for this purpose as it's not trivial to create it from json input
      assert.rejects(async () => await validateRecord(inputRecord, commonErrorPayload), new ValidationError(commonErrorPayload, expectedValidationError));
      return;
    }

    const result = await validateRecord(inputRecord);
    assert.deepStrictEqual(expectedResult, result);
  }
}