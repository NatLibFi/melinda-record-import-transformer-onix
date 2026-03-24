import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate024Electronic} from './generate-0xx-electronic.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'electronic', 'generate-0xx-electronic'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-024-electronic'), generate024Electronic);
