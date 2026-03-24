/**
 * Generates SID field for print and electronical records. SID is used for record deduplication purposes in Melinda merge.
 * @param {import('../../../types.js').OnixConversionConfiguration} onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field fSID
 */
export function generateSIDCommon(onixConversionConfiguration, valueInterface) {
  const {isLegalDeposit, systemIdentifier} = onixConversionConfiguration;
  const recordReference = valueInterface.getValue('Product', 'RecordReference');

  // Note: field is not generated legal deposit material
  if (isLegalDeposit || !systemIdentifier || !recordReference) {
    return [];
  }

  return [
    {
      tag: 'SID',
      subfields: [
        {code: 'c', value: recordReference},
        {code: 'b', value: systemIdentifier}
      ]
    }
  ];
}

/**
 * Generates LOW field for print and electronical records for NatLibFi purposes.
 * @param {import('../../../types.js').OnixConversionConfiguration} _onixConversionConfiguration - configuration for ONIX->MARC21 conversion
 * @param {import('../../../types.js').ValueInterface} _valueInterface ValueInterface containing getValue/getValues functions
 * @returns {import('../../../types.js').DataField[]} Array containing field fLOW
 */
// eslint-disable-next-line no-unused-vars
export function generateLOWCommon(_onixConversionConfiguration, _valueInterface) {
  return [
    {
      tag: 'LOW',
      subfields: [{code: 'a', value: 'FIKKA'}]
    }
  ];
}
