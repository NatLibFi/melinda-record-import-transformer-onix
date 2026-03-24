import * as filters from './filters/index.js';

/**
 * Create record filtering function based on the configuration given as parameter.
 * @param {import('../types.js').FilterConfiguration} filterConfiguration - configuration for the filtering part of transformation pipeline
 * @returns {Function} Function which runs through configured filtering pipeline
 */
export default (filterConfiguration) => {
  const {applyFilters, settings} = filterConfiguration;

  const availableFilters = Object.keys(filters);

  // Validate all filters selected are available
  applyFilters.forEach(requestedFilter => {
    const filterIsAvailable = availableFilters.includes(requestedFilter);

    // Throw halting error: pipeline configuration needs to be fixed before any processing can be done
    if (!filterIsAvailable) {
      throw new Error(`Requested using filter "${requestedFilter}" which is not available. Filters available are: ${JSON.stringify(availableFilters)}`);
    }
  });

  // Improvement idea: code structure could be improved by having each filter return an callback and validator for the filter configuration.
  // Validators for selected filter configurations should be ran during filter pipeline initialization.

  return (valueInterface, commonErrorPayload) => applyFilters.forEach(filterName => filters[filterName](valueInterface, settings[filterName], commonErrorPayload));
};
