import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';
import {generate020Common, generate024Common, generate040Common, generate041Common, generate042Common, generate084Common} from './generate-0xx-common.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-0xx-common'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-020-common'), generate020Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-024-common'), generate024Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-040-common'), generate040Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-041-common'), generate041Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-042-common'), generate042Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-084-common'), generate084Common);
