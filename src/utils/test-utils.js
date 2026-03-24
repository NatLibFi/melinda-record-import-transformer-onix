import assert from 'node:assert';
import {Readable} from 'node:stream';

import xmlFlow from 'xml-flow';
import {Settings} from 'luxon';

import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

import {convertXml, createValueInterface} from './data-utils.js';

/**
 * Simulate transformer readableStream for reading product input.
 * @param {Readable} inputStream - input XML file as readable stream
 * @returns {Promise<Object>} - Object parsed from ONIX Product using convertXML function
 */
export async function readProduct(inputStream) {
  return new Promise((resolve, reject) => {
    let productFound = false;

    xmlFlow(inputStream, {
      strict: true,
      trim: false,
      normalize: false,
      preserveMarkup: xmlFlow.ALWAYS,
      simplifyNodes: false,
      useArrays: xmlFlow.ALWAYS
    })
      .on('tag:Product', async xmlElement => {
        productFound = true;
        const product = await convertXml(xmlElement);
        resolve(product);
      })
      .on('error', error => reject(`Error occurred during stream read of XML input: ${error}`))
      .on('end', () => {
        if (!productFound) {
          reject('Could not find Product in given input.');
        }
      });
  });
}

export function generateFieldGeneratorTest(fixturePath, fieldGeneratorFunction) {
  generateTests({
    callback,
    path: fixturePath,
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    }
  });

  async function callback({getFixture, onixConversionConfiguration, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => fieldGeneratorFunction(onixConversionConfiguration, valueInterface), Error(expectedError));
      return;
    }

    const expectedOutputRaw = getFixture('output.json');
    const expectedOutput = JSON.parse(expectedOutputRaw);

    const result = fieldGeneratorFunction(onixConversionConfiguration, valueInterface);
    assert.deepStrictEqual(result, expectedOutput, 'Resulting field did not match the expected');
  }
}

export function generateControlFieldGeneratorTest(fixturePath, fieldGeneratorFunction) {
  generateTests({
    callback,
    path: fixturePath,
    recurse: false,
    useMetadataFile: true,
    fixura: {
      reader: READERS.TEXT,
      failWhenNotFound: true
    },
    hooks: {
      beforeEach: () => {
        Settings.now = () => new Date(2025, 0, 1, 12);
      }
    }
  });

  async function callback({getFixture, onixConversionConfiguration, expectedValue, expectedError}) {
    const inputRecord = getFixture('input.xml');
    const inputStream = Readable.from(inputRecord);
    const {Product: product} = await readProduct(inputStream);
    const valueInterface = createValueInterface(product);

    if (expectedError) {
      assert.throws(() => fieldGeneratorFunction(onixConversionConfiguration, valueInterface), Error(expectedError));
      return;
    }

    const result = fieldGeneratorFunction(onixConversionConfiguration, valueInterface);
    assert.deepStrictEqual(result, expectedValue, 'Resulting field did not match the expected');
  }
}