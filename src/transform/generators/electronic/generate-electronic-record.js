import {MarcRecord} from '@natlibfi/marc-record';

import {generateLeaderElectronic, generate006Electronic, generate007Electronic, generate008Electronic} from './generate-electronic-control-fields.js';
import {generate024Electronic} from './generate-0xx-electronic.js';
import {generate300Electronic, generate306Electronic, generate336Electronic, generate337Electronic, generate338Electronic, generate341Electronic, generate344Electronic, generate347Electronic} from './generate-3xx-electronic.js';

import {generate005Common} from '../common/generate-common-control-fields.js';
import {generate020Common, generate024Common, generate040Common, generate041Common, generate042Common, generate084Common} from '../common/generate-0xx-common.js';
import {generate100Common, generate110Common, generate130Common} from '../common/generate-1xx-common.js';
import {generate240Common, generate245Common, generate246Common, generate250Common, generate263Common, generate264Common} from '../common/generate-2xx-common.js';
import {generate490Common} from '../common/generate-4xx-common.js';
import {generate500Common, generate511Common, generate594Common} from '../common/generate-5xx-common.js';
import {generate600Common, generate650Common, generate653Common, generate655Common} from '../common/generate-6xx-common.js';
import {generate700Common, generate710Common, generate776Common} from '../common/generate-7xx-common.js';
import {generate884Common} from '../common/generate-8xx-common.js';
import {generate946Common, generate974Common, generate984Common} from '../common/generate-9xx-common.js';
import {generateLOWCommon, generateSIDCommon} from '../common/generate-system-fields-common.js';

const ELECTRONIC_RECORD_FIELD_GENERATORS = [
  // Note: f005, f884 are generated outside this definition regarding array of field generators
  generate006Electronic,
  generate007Electronic,
  generate008Electronic,
  generate020Common,
  generate024Common,
  generate024Electronic,
  generate040Common,
  generate041Common,
  generate042Common,
  generate084Common,
  generate100Common,
  generate110Common,
  generate130Common,
  generate240Common,
  generate245Common,
  generate246Common,
  generate250Common,
  generate263Common,
  generate264Common,
  generate300Electronic,
  generate306Electronic,
  generate336Electronic,
  generate337Electronic,
  generate338Electronic,
  generate341Electronic,
  generate344Electronic,
  generate347Electronic,
  generate490Common,
  generate500Common,
  generate511Common,
  generate594Common,
  generate600Common,
  generate650Common,
  generate653Common,
  generate655Common,
  generate700Common,
  generate710Common,
  generate776Common,
  // f884 is generated outside of this array in the end of generatePrintRecord function
  generate946Common,
  generate974Common,
  generate984Common,
  generateSIDCommon,
  generateLOWCommon,
];

/**
 * Generates fields for record with electronical type.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @param {string|undefined} sentTime - sent time used for f005 generation
 * @returns {Object} MarcRecord.toObject return value
 */
export default function generateElectronicRecord(onixConversionConfiguration, valueInterface, sentTime) {
  const marcRecord = new MarcRecord();
  marcRecord.leader = generateLeaderElectronic(onixConversionConfiguration, valueInterface);

  // f005 generation is different from rest of the fields since it is based on value inside of header instead of value inside the product
  const f005 = generate005Common(sentTime);
  if (f005) {
    marcRecord.insertField(f005);
  }

  ELECTRONIC_RECORD_FIELD_GENERATORS
    .map((_, idx) => ELECTRONIC_RECORD_FIELD_GENERATORS[idx](onixConversionConfiguration, valueInterface))
    .flat()
    .forEach(field => marcRecord.insertField(field));

  // Generate and insert f884 last as it requires other record to be ready for hash function to work as intended for record deduplication purposes later in pipeline
  marcRecord.insertFields(generate884Common(onixConversionConfiguration, marcRecord));

  return marcRecord.toObject();
}
