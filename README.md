# ONIX to MARC21 transformer for the Melinda record batch import system

ONIX to MARC21 transformer for the Melinda record batch import system. Supports ONIX for Books version 3 format defined in XML file for input. May be used as part of Melinda Record Import system or separately as a CLI tool.

**Please note: this transformer is currently not generic by its nature and it produces fields used by National Library of Finland.** In case you wish to remove these fields you may utilize tools for example [marc-record-serializers](https://github.com/NatLibFi/marc-record-serializers) together with [marc-record-js](https://github.com/NatLibFi/marc-record-js) or fork the repository and then adjust transformations to fit your use case.

## Environmental variables

In case the tool is used as CLI, there is no need to define environmental variables related to Melinda Record Import.

**Arrays and objects given to environment should be given as strings. They are parsed using JSON.parse as defined in src/config.js.**

### Melinda Record Import handler

These variables control how the transformation process handler will act within the Melinda Record Import system.

| Name                     | Description                                                                       | default       |
| ------------------------ | --------------------------------------------------------------------------------- | ------------- |
| ABORT_ON_INVALID_RECORDS | Whether to abort Melinda Record Import processing if record transformation fails  | false         |
| NEXT_QUEUE_STATUS        | Status to place record in Melinda Record Import queue after it has been processed | "TRANSFORMED" |
| POLLTIME                 | Wait time between handler processing in Melinda Record Import                     | []            |
| PROFILE_IDS              | Melinda Record Import profiles to use this transformer                            | []            |
| READ_FROM                | State of queue entries to process using by transformer in Melinda Record Import   | "blobContent" |

### Melinda Record Import connections

These variables control how the transformation process will communicate with Melinda Record Import system storage.

| Name      | Description          | default                  |
| --------- | -------------------- | ------------------------ |
| AMQP_URL  | RabbitMQ url         | "amqp://127.0.0.1:5672/" |
| MONGO_URI | Mongo connection URI | "mongodb://127.0.0.1/db" |

### Product filtering

These variables control filters for which products are transformed and which are not.

| Name          | Description                                                                                                | default                 |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------- |
| APPLY_FILTERS | List of filter names to apply (see src/transform/filters/index.js for function names of available filters) | ["filterByProductForm"] |

#### Record type filter

Record type filter may be used to filter either only print or only electronic records. Having both options enabled is similar to not using the filter at all. In order to use filter you must define `"filterByProductForm"` to APPLY_FILTERS array in addition of the following settings definition:

| Name               | Description                                                                                               | default |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ------- |
| ALLOW_RECORD_TYPES | Array containing record types you wish to allow pass the filter (available values: 'print', 'electronic') | []      |

#### Subject code filter

Subject code filter may be used to filter records that contain given subject codes in subjects that use proprietary subject scheme. In order to use filter you must define `"filterBySubjectCode"` to APPLY_FILTERS array in addition of the following settings definition:

| Name               | Description                                                                                                                                                                          | default |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| DENY_SUBJECT_CODES | Array containing subject codes for proprietary subject scheme (SubjectSchemeIdentifier 24). If record contains any subject like the previous definition, it will not be transformed. | []      |

### Transformation envs

These environments guide the transformation process: some affect only one field generator, but some may have greater effect on the transformed record (such as whether transformation considers pre-publication information or legal deposit information).

| Name                             | Description                                                                                                                                 | default |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| IS_LEGAL_DEPOSIT                 | Whether transformation considers legal deposit information                                                                                  | false   |
| SOURCE                           | Data source found from ONIX header information. If there is mismatch between given source and actual data source, transformation will fail. | ""      |
| PSEUDONYM                        | Data source pseudonym used in f884 generation. Field is used for deduplication. Value must start with "MELINDA" to be valid.                | ""      |
| RELATED_WORK_REFERENCE_NAME      | Only for pre-publications: Related work reference name used in f976 generation for $a value.                                                | ""      |
| ISIL_IDENTIFIER                  | Only for pre-publications: ISIL identifier used in f040 generation for $a value.                                                            | ""      |
| NOTIFICATION_NAME                | Only for pre-publications: value used to generate f500/f594 notification regarding record being pre-publication.                            | ""      |
| SYSTEM_IDENTIFIER                | Only for pre-publications: value used to generate fSID together with product record reference. Field is used for deduplication.             | ""      |
| F984_DIRECTIVES                  | Values to insert in f984 $a. Fields directives are used for controlling behaviour of Melinda record merging process.                        | []      |
| LANGUAGE_SANITY_CHECK            | If true, language of title will be inspected in addition to language information provided in ONIX message.                                  | false   |
| PREVENT_UNIFORM_TITLE_GENERATION | If true, prevents generation of f130 and f240.                                                                                              | false   |
| ACCESSIBILITY_BLACKLIST          | List of publisher names for which generating f341 is not allowed from product form features                                                 | []      |

### Other envs

These environmental variables are the one that do not belong to any of the prior categories.

| Name      | Description                                                                               | default |
| --------- | ----------------------------------------------------------------------------------------- | ------- |
| LOG_LEVEL | Log level used for Winston logger. Currently "info", "warn", and "error" levels are used. | "info"  |

## Usage

1. Clone the repository
2. Install dependencies using `npm i`
3. Run tests to verify install using `npm run test`
4. If running as CLI, it is proposed to create a .env file to the root of the project. Then you may run the CLI tool using `npm run cli:dotenv`. This both builds the latest code and runs the CLI tool using environmental variables defined in `.env`.

- Full example command: `npm run cli:dotenv -- -fv example-file.xml`

## License and copyright

Copyright (c) 2019-2026 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT**. For further information see [LICENSE-file](https://github.com/NatLibFi/melinda-record-import-transformer-onix/blob/main/LICENSE).
