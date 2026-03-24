import {createHash} from 'crypto';

import {DateTime} from 'luxon';

import {clone} from '@natlibfi/melinda-commons';
import {MarcRecord} from '@natlibfi/marc-record';

/**
 * Generates 884 field for print and electronical records. Field contains hash value calculated from the given marc record.
 * NOTE: this field generator does not use the generic parameter of valueInteface but instead takes the current marc record object as input.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {*} marcRecord - marc record object to calculate the hash for
 * @returns {import('../../../types.js').DataField[]} Array containing field 884
 */

export function generate884Common(onixConversionConfiguration, marcRecord) {
  const {pseudonym} = onixConversionConfiguration;

  if (!pseudonym) {
    return [];
  }

  // Create new marc record object from cloned object
  // Note field validation is set to false on purpose
  const recordCopyObject = clone(marcRecord);
  const recordCopy = new MarcRecord(recordCopyObject, {fields: false});

  // Normalize f008 creation date so that hash comparison is not date dependent
  // Field creation is allowed also if f008 is not defined: then no normalization is just not done
  const [f008] = recordCopy.pop(/008/u);

  if (f008) {
    const normalizedF008 = {
      tag: f008.tag,
      value: `000000${f008.value.substring(6)}`
    };
    recordCopy.insertField(normalizedF008);
  }

  // Calculate hash for record copy that contains normalized f008
  const hash = createHash('sha256').update(JSON.stringify(recordCopy)).digest('hex');

  return [
    {
      tag: '884',
      subfields: [
        {code: 'a', value: 'ONIX3 to MARC transformation'},
        {code: 'g', value: DateTime.now().toFormat('yyyyMMdd')},
        {code: 'k', value: `${pseudonym}:${hash}`},
        {code: 'q', value: 'FI-NL'},
        {code: '5', value: 'MELINDA'}
      ]
    }
  ];
}
