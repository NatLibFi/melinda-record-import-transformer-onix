import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate240Common, generate245Common, generate246Common, generate250Common, generate263Common, generate264Common} from './generate-2xx-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-2xx-common'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-240-common'), generate240Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-245-common'), generate245Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-246-common'), generate246Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-250-common'), generate250Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-263-common'), generate263Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-264-common'), generate264Common);
