/**
 * Formatting function for reading boolean environment variable values
 * @param {string} value - value to evaluate boolean value from
 * @returns {boolean} true if value was evaluated as true, otherwise false
 */
export function parseBoolean(value) {
  if (value === undefined) {
    return false;
  }

  if (Number.isNaN(Number(value))) {
    return value.length > 0 && !(/^(?:false)$/ui).test(value);
  }

  return Boolean(Number(value));
}

/**
 * Simple deep copy util which handles majority of the use cases.
 * Read more from https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
 * @param {Object} o - Object to make deep copy of
 * @returns {Object} Deep copy of object given as parameter
 */
export function clone(o) {
  return JSON.parse(JSON.stringify(o));
}