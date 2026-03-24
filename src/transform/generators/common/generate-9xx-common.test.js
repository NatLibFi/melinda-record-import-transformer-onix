import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate903Common, generate946Common, generate974Common, generate984Common} from './generate-9xx-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-9xx-common'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-903-common'), generate903Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-946-common'), generate946Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-974-common'), generate974Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-984-common'), generate984Common);
