import assert from 'node:assert';
import {describe, it} from 'node:test';

import {generateControlFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate008Print, generateLeaderPrint} from './generate-print-control-fields.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'print', 'generate-print-control-fields'];

generateControlFieldGeneratorTest(testFixtureRootPath.concat('generate-008-print'), generate008Print);

describe('generateLeaderPrint', () => {
  it('returns always the pre-defined static string that is used for print pre-publications', () => {
    const expectedValue = '00000nam a22000008i 4500';
    const result = generateLeaderPrint();
    assert.equal(result, expectedValue);
  });
});
