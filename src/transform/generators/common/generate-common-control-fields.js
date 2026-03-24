/**
 * Generates field 005 from date information if date information given is in valid format.
 * @param {string} dateInformation Sent date of ONIX message in string format
 * @returns {import('../../../types.js').ControlField|null} controlfield f005 within an array if it can be constructed, otherwise null
 */
export function generate005Common(dateInformation) {
  if (!dateInformation || typeof dateInformation !== 'string') {
    return null;
  }

  // Not extensive list of different formats, but should be close enough to filter and map most common values
  const dateFormatMap = [
    {regex: /^(?:19|20)\d{2}[01]{1}\d[0-3]{1}\d{1}$/u, format: (v) => `${v}000000.0`}, // YYYYMMDD
    {regex: /^(?:19|20)\d{2}[01]{1}\d[0-3]{1}\d{1}T[0-2]{1}\d[0-5]{1}\d$/u, format: (v) => `${v.replace('T', '')}00.0`}, // YYYYMMDDTHHMM
    {regex: /^(?:19|20)\d{2}[01]{1}\d[0-3]{1}\d{1}T[0-2]{1}\d[0-5]{1}\d[0-5]{1}\d$/u, format: (v) => `${v.replace('T', '')}.0`}, // YYYYMMDDTHHMMSS
    {regex: /^(?:19|20)\d{2}[01]{1}\d[0-3]{1}\d{1}T[0-2]{1}\d[0-5]{1}\d[0-5]{1}\d\.\d$/u, format: (value) => value} // YYYYMMDDTHHMMSS.Z
  ];

  // Find the format given date information is in. If it's not in list of supported formats, do not generate field.
  const dateFormat = dateFormatMap.find(format => format.regex.test(dateInformation));

  if (!dateFormat) {
    return null;
  }

  const formattedDate = dateFormat.format(dateInformation);
  return {tag: '005', value: formattedDate};
}