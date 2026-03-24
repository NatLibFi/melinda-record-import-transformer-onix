import fs from 'fs';
import yargs from 'yargs';

import {transformerCliLogic} from '@natlibfi/melinda-record-import-commons';

import createTransformPipeline from './transform/transform-pipeline.js';
import {
  filterConfiguration,
  onixConversionConfiguration
} from './config.js';

cli();

async function cli() {
  const args = yargs(process.argv.slice(2))
    .scriptName('melinda-record-import-transformer-onix')
    .epilog('Copyright (C) 2019-2026 University Of Helsinki (The National Library Of Finland)')
    .usage('$0 <file> [options] and env variable info in README')
    .showHelpOnFail(true)
    .example([
      ['$ node $0/dist/cli.js ONIX3_file.xml -rfv -d transformed/'],
      ['$ node $0/dist/cli.js ONIX3_file.xml -rv -d transformed/'],
      ['$ node $0/dist/cli.js  -r true -d transformed/ ONIX3_file.xml']
    ])
    .env('TRANSFORM_ONIX')
    .positional('file', {type: 'string', describe: 'File to transform'})
    .options({
      v: {type: 'boolean', default: false, alias: 'validate', describe: 'Validate records'},
      f: {type: 'boolean', default: false, alias: 'fix', describe: 'Validate & fix records'},
      r: {type: 'boolean', default: false, alias: 'recordsOnly', describe: 'Write only record data to output (Invalid records are excluded)'},
      d: {type: 'string', alias: 'outputDirectory', describe: 'Output directory where each record file is written (Applicable only with `recordsOnly`'}
    })
    .check((args) => {
      const [file] = args._;
      if (file === undefined) {
        throw new Error('No file argument given');
      }

      if (!fs.existsSync(file)) {
        throw new Error(`File ${file} does not exist`);
      }

      return true;
    })
    .parseSync();

  const onixTransformerPipeline = createTransformPipeline({
    filterConfiguration,
    onixConversionConfiguration,
    marcRecordValidatorConfiguration: {
      validateFixes: args.v || args.validate,
      fix: args.f || args.fix,
      isLegalDeposit: onixConversionConfiguration.isLegalDeposit
    }
  });

  await transformerCliLogic(args, onixTransformerPipeline);
}
