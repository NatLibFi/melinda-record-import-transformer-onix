import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate300Electronic, generate306Electronic, generate336Electronic, generate337Electronic, generate338Electronic, generate341Electronic, generate344Electronic, generate347Electronic} from './generate-3xx-electronic.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'electronic', 'generate-3xx-electronic'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-300-electronic'), generate300Electronic);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-306-electronic'), generate306Electronic);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-336-electronic'), generate336Electronic);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-337-electronic'), generate337Electronic);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-338-electronic'), generate338Electronic);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-341-electronic'), generate341Electronic);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-344-electronic'), generate344Electronic);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-347-electronic'), generate347Electronic);
