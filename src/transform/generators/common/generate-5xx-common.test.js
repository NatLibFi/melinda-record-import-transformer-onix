import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate500Common, generate511Common, generate594Common} from './generate-5xx-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-5xx-common'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-500-common'), generate500Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-511-common'), generate511Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-594-common'), generate594Common);
