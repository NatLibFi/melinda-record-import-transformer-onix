import assert from 'node:assert';
import {beforeEach, describe, it} from 'node:test';

import {createApplicationLogger, getApplicationLogger, resetApplicationLogger} from './logging.js';

beforeEach(() => {
  resetApplicationLogger();
});

describe('createApplicationLogger', () => {
  it('Creates new logger without error', () => {
    assert.doesNotThrow(() => createApplicationLogger('silent'));
  });

  it('May call info without error', () => {
    const logger = createApplicationLogger('silent');
    assert.doesNotThrow(() => logger.info('foo'));
  });
});

describe('getApplicationLogger', () => {
  it('Fails when attempting to get logger that has not yet been created', () => {
    assert.throws(getApplicationLogger);
  });

  it('Succeeds when getting logger which has been created', () => {
    createApplicationLogger('silent');
    assert.doesNotThrow(getApplicationLogger);
  });
});
