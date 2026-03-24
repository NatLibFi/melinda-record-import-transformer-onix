import {readEnvironmentVariable} from '@natlibfi/melinda-backend-commons';

import {parseBoolean} from './utils/misc-utils.js';

// Melinda Record Import handler configuration
const abortOnInvalidRecords = readEnvironmentVariable('ABORT_ON_INVALID_RECORDS', {defaultValue: false, format: v => parseBoolean(v)});
const nextQueueStatus = readEnvironmentVariable('NEXT_QUEUE_STATUS', {defaultValue: 'TRANSFORMED'});
const profileIds = readEnvironmentVariable('PROFILE_IDS', {format: v => JSON.parse(v), defaultValue: []});
const polltime = readEnvironmentVariable('POLLTIME', {
  format: v => {
    const polltimeSeconds = Number(v);
    if (isNaN(polltimeSeconds)) {
      throw new Error('Cannot use non-numeric polltime!');
    }

    return polltimeSeconds;
  }, defaultValue: 3000
});
const readFrom = readEnvironmentVariable('READ_FROM', {defaultValue: 'blobContent'});

// Melinda Record Import connections
const amqpUrl = readEnvironmentVariable('AMQP_URL', {defaultValue: 'amqp://127.0.0.1:5672/'});
const mongoUrl = readEnvironmentVariable('MONGO_URI', {defaultValue: 'mongodb://127.0.0.1/db'});

// Filter configuration
const applyFilters = readEnvironmentVariable('APPLY_FILTERS', {defaultValue: [], format: v => JSON.parse(v)});
const allowRecordTypes = readEnvironmentVariable('ALLOW_RECORD_TYPES', {defaultValue: [], format: v => JSON.parse(v)});
const denySubjectCodes = readEnvironmentVariable('DENY_SUBJECT_CODES', {defaultValue: [], format: v => JSON.parse(v)});

// Transform configuration
const isLegalDeposit = readEnvironmentVariable('IS_LEGAL_DEPOSIT', {defaultValue: false, format: v => parseBoolean(v)});

const source = readEnvironmentVariable('SOURCE', {defaultValue: ''});
const pseudonym = readEnvironmentVariable('PSEUDONYM', {defaultValue: ''});
const relatedWorkReferenceName = readEnvironmentVariable('RELATED_WORK_REFERENCE_NAME', {defaultValue: ''});
const isilIdentifier = readEnvironmentVariable('ISIL_IDENTIFIER', {defaultValue: ''});
const notificationName = readEnvironmentVariable('NOTIFICATION_NAME', {defaultValue: ''});
const systemIdentifier = readEnvironmentVariable('SYSTEM_IDENTIFIER', {defaultValue: ''});
const f984Directives = readEnvironmentVariable('F984_DIRECTIVES', {defaultValue: [], format: JSON.parse});
const languageSanityCheck = readEnvironmentVariable('LANGUAGE_SANITY_CHECK', {defaultValue: false, format: v => parseBoolean(v)});
const preventUniformTitleGeneration = readEnvironmentVariable('PREVENT_UNIFORM_TITLE_GENERATION', {defaultValue: false, format: v => parseBoolean(v)});
const accessibilityBlacklist = readEnvironmentVariable('ACCESSIBILITY_BLACKLIST', {defaultValue: [], format: JSON.parse});

// Marc record validation configuration
// - isLegalDeposit is always derived from onixConversionConfiguration setting
// - fix and validateFixes are always true when running component within Melinda infrastructure
// - fix and validateFixes are managed by CLI parameters when running in CLI mode

// Other configuration
export const logLevel = readEnvironmentVariable('LOG_LEVEL', {defaultValue: 'info'});

// Exported configurations
export const recordImportConfiguration = {
  abortOnInvalidRecords,
  amqpUrl,
  mongoUrl,
  nextQueueStatus,
  polltime,
  profileIds,
  readFrom
};

export const onixConversionConfiguration = {
  isLegalDeposit,
  source,
  pseudonym,
  relatedWorkReferenceName,
  isilIdentifier,
  notificationName,
  systemIdentifier,
  f984Directives,
  languageSanityCheck,
  preventUniformTitleGeneration,
  accessibilityBlacklist
};

export const filterConfiguration = {
  applyFilters,
  settings: {
    filterByProductForm: {
      allowRecordTypes
    },
    filterBySubjectCode: {
      denySubjectCodes
    },
  }
};

export const runtimeConfiguration = {
  recordImportConfiguration,
  filterConfiguration,
  onixConversionConfiguration,
};
