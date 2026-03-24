import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate600Common, generate650Common, generate653Common, generate655Common} from './generate-6xx-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-6xx-common'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-600-common'), generate600Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-650-common'), generate650Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-653-common'), generate653Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-655-common'), generate655Common);
