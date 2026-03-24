import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate700Common, generate710Common, generate776Common} from './generate-7xx-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-7xx-common'];

// Run tests
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-700-common'), generate700Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-710-common'), generate710Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-776-common'), generate776Common);
