import {generateFieldGeneratorTest} from '../../../utils/test-utils.js';
import {
  generate300Print,
  generate336Print,
  generate337Print,
  generate338Print,
  // generate341Print DEPRECATED 2026-02-11
} from './generate-3xx-print.js';

const testFixtureRootPath = [import.meta.dirname, '..', '..', '..', '..', 'test-fixtures', 'transform', 'generators', 'print', 'generate-3xx-print'];

generateFieldGeneratorTest(testFixtureRootPath.concat('generate-300-print'), generate300Print);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-336-print'), generate336Print);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-337-print'), generate337Print);
generateFieldGeneratorTest(testFixtureRootPath.concat('generate-338-print'), generate338Print);
