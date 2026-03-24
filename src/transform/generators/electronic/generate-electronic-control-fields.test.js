import {generateControlFieldGeneratorTest} from '../../../utils/test-utils.js';

import {generate006Electronic, generate007Electronic, generate008Electronic, generateLeaderElectronic} from './generate-electronic-control-fields.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'electronic', 'generate-electronic-control-fields'];

generateControlFieldGeneratorTest(testFixtureRootPath.concat('generate-leader-electronic'), generateLeaderElectronic);
generateControlFieldGeneratorTest(testFixtureRootPath.concat('generate-006-electronic'), generate006Electronic);
generateControlFieldGeneratorTest(testFixtureRootPath.concat('generate-007-electronic'), generate007Electronic);
generateControlFieldGeneratorTest(testFixtureRootPath.concat('generate-008-electronic'), generate008Electronic);
