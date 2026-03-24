import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate100Common, generate110Common, generate130Common} from './generate-1xx-common.js';


const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'common', 'generate-1xx-common'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-100-common'), generate100Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-110-common'), generate110Common);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-130-common'), generate130Common);
