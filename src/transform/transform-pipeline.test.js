import assert from 'node:assert';

import {Settings} from 'luxon';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {TEST_START_DATE} from '../test-constants.js';

import createTransformPipeline from './transform-pipeline.js';

// Run tests
generateTransformPipelineTests();


// Test definitions
function generateTransformPipelineTests() {
  generateTests({
    callback,
    path: [import.meta.dirname, '..', '..', 'test-fixtures', 'transform', 'transform-pipeline'],
    recurse: false,
    useMetadataFile: true,
    fixura: {
      failWhenNotFound: false // false is used as halting errors do not produce output
    },
    hooks: {
      beforeEach: () => {
        Settings.now = () => new Date(TEST_START_DATE);
      }
    }
  });

  async function callback({getFixture, transformationPipelineConfig, expectedError}) {
    const inputOnixMessage = getFixture({components: ['input.xml'], reader: READERS.STREAM});
    const expectedResult = getFixture({components: ['output.json'], reader: READERS.JSON});

    const onixTransformationPipeline = createTransformPipeline(transformationPipelineConfig);

    const records = [];
    let errorProcessed = false;

    // Test emitter events
    await new Promise((resolve) => {
      onixTransformationPipeline(inputOnixMessage)
        .on('error', error => {
          assert.equal(typeof expectedError === 'string' && expectedError.length > 0, true, 'Unexpected halting error occurred');
          assert.equal(expectedError, error.message);
          errorProcessed = true;
        })
        .on('record', recordObject => {
          // Note: Melinda Record Import expects record-attribute to contain MARC record when emitting record that has not failed during transformation
          // If record failed during transformation gracefully, emitted record object should directly contain description of the failure
          const {record, failed} = recordObject;
          if (failed) {
            return records.push(recordObject);
          }

          return records.push(record);
        })
        .on('end', () => {
          const didExpectError = expectedError && expectedError.length > 0;

          // Test conditions based on whether emitted error was expected or not
          if (didExpectError) {
            assert.equal(didExpectError && errorProcessed, true, 'Expected error did not occur');
          }

          assert.deepStrictEqual(records, expectedResult, 'Records produced by transformation pipeline did not match expected records');
          resolve();
        });
    });
  }
}