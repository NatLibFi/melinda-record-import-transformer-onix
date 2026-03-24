import {Parser} from 'xml2js';
import xmlFlow from 'xml-flow';

/**
 * Convert XML found element to object format using combination of xml-flow and xml2js utilities.
 * @param {*} xmlElement - xmlElement parsed by xml-flow default export .on -handler
 * @returns {Promise<Object>} Promise that resolves into an object after parsing is completed
 */
export function convertXml(xmlElement) {
  const str = xmlFlow.toXml(xmlElement);

  return new Promise((resolve, reject) => {
    new Parser().parseString(str, (err, obj) => {
      if (err) {
        return reject(err);
      }

      resolve(obj);
    });
  });
}

/**
 * Parse sender and sent time information from header.
 * @param {Object} headerInfo - Header-tag information as object as parsed by convertXml from tag:Header.
 * @returns {{name: string|undefined, sentTime: string|undefined}} Object containing sender name and sent time if found
 */
export function parseSender(headerInfo) {
  return {
    name: headerInfo?.Header?.Sender?.[0]?.SenderName?.[0],
    sentTime: headerInfo?.Header?.SentDateTime?.[0]
  };
}

/**
 * Generate interface which allows retrieving values for the ONIX Product-element that has been parsed to an object.
 * @param {Object} product - ONIX product element that has been parsed to object by converXml-function.
 * @returns {{getValue: Function, getValues: Function}} Object containing getValue and getValues functions for the given Product.
 */
export function createValueInterface(record) {
  return {getValue, getValues, getRecord};

  /**
   * Debugging function to retrieve the record which is interfaced
   * @returns {Object} value interface record
   */
  function getRecord() {
    return JSON.stringify(record);
  }

  /**
   * Get first value for the given path
   * @param  {...string} path - ONIX path to find values for (e.g., 'DescriptiveDetail', 'Contributor')
   * @returns {Object|string|undefined} First value found when traveling product using the given path
   */
  function getValue(...path) {
    return recurse(path);

    function recurse(props, context = record) {
      const [prop] = props;

      if (prop) {
        return recurse(props.slice(1), context?.[prop]?.[0]);
      }

      return typeof context === 'object' ? context._ : context;
    }
  }

  /**
   * Get all values for the given path
   * @param  {...string} path - ONIX path to find values for (e.g., 'DescriptiveDetail', 'Contributor')
   * @returns {Object[] | string[] | undefined} Values found when traveling product using the given path
   */
  function getValues(...path) {
    return recurse(path);

    function recurse(props, context = record) {
      const [prop] = props;

      if (prop) {
        if (props.length === 1) {
          return context?.[prop] || [];
        }

        return recurse(props.slice(1), context?.[prop]?.[0] || {});
      }

      return [];
    }
  }
}

/**
 * Get first value of given path in context of given object usually first returned by getValue/getValues function.
 * @param {Object} context - Object to be used as search context
 * @param  {...string} path - ONIX path to find values for (e.g., 'DescriptiveDetail', 'Contributor')
 * @returns {Object|string|null} Null if value could not be found from path, otherwise the first value retrieved through the path
 */
export function getFirstValueInContext(context, ...path) {
  return recurse(path, context);

  function recurse(props, context) {
    const [prop] = props;

    if (prop) {
      if (props.length === 1) {
        return context?.[prop] ? context[prop][0] : null;
      }

      return recurse(props.slice(1), context?.[prop]?.[0] || {});
    }

    return null;
  }
}

/**
 * Get all values when stepping through first indexes of given path in context of given object usually first returned by getValue/getValues function.
 * @param {Object} context - Object to be used as search context
 * @param  {...string} path - ONIX path to find values for (e.g., 'DescriptiveDetail', 'Contributor')
 * @returns Empty array if there are no values that could not be found from path, otherwise array containing the values retrieved from path's last attribute
 */
export function getAllValuesInContext(context, ...path) {
  return recurse(path, context);

  function recurse(props, context) {
    const [prop] = props;

    if (prop) {
      if (props.length === 1) {
        return context?.[prop] || [];
      }

      return recurse(props.slice(1), context?.[prop]?.[0] || {});
    }

    return [];
  }
}

/**
 * Utility function useful for testing object values as it does not produce error when sourceObject does not contain attribute.
 * @param {Object} sourceObject Object to test for attribute.
 * @param {string} attributeName Attribute name to test.
 * @returns {boolean} True if object contains attribute and it has at least one value in the value array
 */
export function hasAttribute(sourceObject, attributeName) {
  const isObject = typeof sourceObject === 'object';
  const objectHasRequestedProperty = isObject && Object.prototype.hasOwnProperty.call(sourceObject, attributeName);

  if (!isObject || !objectHasRequestedProperty) {
    return false;
  }

  const firstValue = getFirstValueInContext(sourceObject, attributeName);
  return firstValue !== null && firstValue !== undefined;
}