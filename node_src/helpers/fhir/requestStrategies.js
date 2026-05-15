// Returns the fhir api url
const requestStrategies = {
    // fhirapi.domain/Observation/3984308adawd
    byId: ({ resourceType, id }) =>
    `${resourceType}/${id}`,

    // fhirapi.domain/Observation/3984308adawd/data/0
    byIdAndMinute: ({ resourceType, id, minute }) =>
    `${resourceType}/${id}/data/${minute}`,

    // fhirapi.domain/Observation/3984308adawd/data/0/1
    byIdAndMinuteInterval: ({ resourceType, id, initialMinute, finalMinute }) =>
    `${resourceType}/${id}/data/${initialMinute}/${finalMinute}`,
};

/**
 * Builds a FHIR URL based on the request type.
 *
 * @param {string} typeRequest - Strategy type:
 *  - 'byId'
 *  - 'byIdAndMinute'
 *  - 'byIdAndMinuteInterval'
 *
 * @param {Object} params - URL parameters
 * @returns {string} Formatted URL
 *
 */
export function buildFhirUrl(typeRequest, params) {
  const strategy = requestStrategies[typeRequest] ?? requestStrategies.byId;
  return strategy(params);
}