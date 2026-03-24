import createDebugLogger from 'debug';

import FilterError from '../../errors/FilterError.js';
import {getFirstValueInContext} from '../../utils/data-utils.js';

/**
 * Filter ONIX products which contains a DescriptiveDetail.Subject having SubjectSchemeIdentifier of 24 (proprietary) and SubjectCode listed in filter settings.
 * @param {import('../../types.js').ValueInterface} valueInterface - ValueInterface containing getValue/getValues functions
 * @param {{denySubjectCodes: string[]}} settings - subject code filter settings describing disallowed subject codes
 * @param {import('../../types.js').CommonErrorPayload} commonErrorPayload - payload to use for errors extending TransformationPipelineError
 * @returns {boolean} true if filter passes
 * @throws FilterError if filter configuration is valid, but Product should not pass filter
 * @throws Error if filter configuration is invalid
 */
export default function (valueInterface, settings, commonErrorPayload) {
  /*
  Onix Codelists: List 27: Subject scheme identifier
  https://ns.editeur.org/onix/en/27

  24 | Proprietary subject scheme
  */
  const debug = createDebugLogger('@natlibfi/melinda-record-import/transformer-onix:transform:filters:subject-code');
  const {denySubjectCodes} = settings;

  const configurationIsNotValidFormat = !denySubjectCodes || !Array.isArray(denySubjectCodes);

  if (configurationIsNotValidFormat) {
    debug(`denySubjectCodes: ${denySubjectCodes}`);
    throw new Error('Required configuration for subject-code filter is not valid: denySubjectCodes setting is not an array of valid string values.');
  }

  const proprietarySubjectCodes = valueInterface
    .getValues('DescriptiveDetail', 'Subject')
    .filter(subject => getFirstValueInContext(subject, 'SubjectSchemeIdentifier') === '24')
    .map(subject => getFirstValueInContext(subject, 'SubjectCode'));

  const foundDenySubjectCode = denySubjectCodes.find(subjectCode => proprietarySubjectCodes.includes(subjectCode));

  if (foundDenySubjectCode) {
    throw new FilterError(commonErrorPayload, `[subject-code-filter] Product contained denied subject code of "${foundDenySubjectCode}"`);
  }

  return true;
}
