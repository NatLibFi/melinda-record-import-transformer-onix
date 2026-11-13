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

/**
 * Utility for reading environmental variable. Originally from melinda-backend-commons-js.
 * Original source: https://github.com/NatLibFi/melinda-backend-commons-js/blob/89907feb25dc2aefadb08a189ff3ef7594ddbf16/src/utils.js
 * Original source license (MIT): https://github.com/NatLibFi/melinda-backend-commons-js/blob/89907feb25dc2aefadb08a189ff3ef7594ddbf16/LICENSE.txt
 * Original source copyright: Copyright (c) 2022-present University Of Helsinki (The National Library Of Finland)
 */
export function readEnvironmentVariable(name, { defaultValue = undefined, hideDefault = false, format = v => v } = {}) {
  if (process.env[name] === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Mandatory environment variable missing: ${name}`);
    }

    if (typeof defaultValue === 'boolean') {
      return Boolean(defaultValue);
    }

    const defaultValuePrintable = typeof defaultValue === 'object' ? JSON.stringify(defaultValue) : defaultValue;

    console.error(`No environment variable set for ${name}, using default value: ${hideDefault ? '[hidden]' : defaultValuePrintable}`); // eslint-disable-line no-console
    return defaultValue;
  }

  return format(process.env[name]);
}