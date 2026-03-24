import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';
import {generate490Common} from './generate-4xx-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-4xx-common'];

// Run tests
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-490-common'), generate490Common);
