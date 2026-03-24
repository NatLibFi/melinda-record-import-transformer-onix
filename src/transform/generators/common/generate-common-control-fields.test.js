import assert from 'node:assert';
import {describe, it} from 'node:test';
import {generate005Common} from './generate-common-control-fields.js';

describe('generate005Common', () => {
  it('generates correct f005 for date value in format YYYYMMDD', () => {
    const sentDate = '20251128';

    const result = generate005Common(sentDate);
    const expectedOutput = {tag: '005', value: '20251128000000.0'};

    assert.deepStrictEqual(result, expectedOutput);
  });

  it('generates correct f005 for date value in format YYYYMMDDTHHMM', () => {
    const sentDate = '20251128T0900';

    const result = generate005Common(sentDate);
    const expectedOutput = {tag: '005', value: '20251128090000.0'};

    assert.deepStrictEqual(result, expectedOutput);
  });

  it('generates correct f005 for date value in format YYYYMMDDTHHMMSS', () => {
    const sentDate = '20251128T090010';

    const result = generate005Common(sentDate);
    const expectedOutput = {tag: '005', value: '20251128090010.0'};

    assert.deepStrictEqual(result, expectedOutput);
  });

  it('generates correct f005 for date value in format YYYYMMDDTHHMMSS.Z', () => {
    const sentDate = '20251128T090010.1';

    const result = generate005Common(sentDate);
    const expectedOutput = {tag: '005', value: '20251128T090010.1'};

    assert.deepStrictEqual(result, expectedOutput);
  });

  it('returns null for undefined input', () => {
    const sentDate = undefined;
    const result = generate005Common(sentDate);

    assert.equal(result, null);
  });

  it('returns null for date information in currently unsupported format', () => {
    const sentDate = '2025-11-28';
    const result = generate005Common(sentDate);

    assert.equal(result, null);
  });
});